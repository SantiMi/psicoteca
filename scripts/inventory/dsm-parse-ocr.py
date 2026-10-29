"""Make a review inventory from the supplied scan's classification, not clinical text.

Usage: python dsm-parse-ocr.py LOCAL_INVENTORY_DIRECTORY
All OCR remains unverified. Counts describe source rows, never distinct disorders.
"""
import argparse
import collections
import hashlib
import json
import re
import unicodedata
from pathlib import Path

SOURCE_ID = 'dsm-5-tr-es-provided'
CHAPTER_PAGES = {35,101,139,177,215,263,295,329,349,371,399,407,477,511,521,543,667,733,779,803,807,821}
# These four scan headings lose parentheses/digits in OCR. Checked against images.
CHAPTER_OCR_CORRECTIONS = {
    (38,132): ('Trastornos de la excreción (399)',399),
    (40,132): ('Disfunciones sexuales (477)',477),
    (40,813): ('Disforia de género (511)',511),
    (61,862): ('Trastornos de la personalidad (733)',733),
}
PAGE_END = re.compile(r'\((\d{1,4})\)\s*$')
RAW_CODE = re.compile(r'^[A-Z0-9][A-Za-z0-9]{1,3}(?:[.,][A-Za-z0-9\[\]()\-]{1,12})?$')
VALID_CODE = re.compile(r'^[A-Z][0-9]{2}(?:\.[0-9A-HJ-NP-Z]{1,7})?$')

def norm(text):
    return ''.join(c for c in unicodedata.normalize('NFD', text) if unicodedata.category(c) != 'Mn').lower()

def roman(number):
    result = ''
    for value, token in [(1000,'m'),(900,'cm'),(500,'d'),(400,'cd'),(100,'c'),(90,'xc'),(50,'l'),(40,'xl'),(10,'x'),(9,'ix'),(5,'v'),(4,'iv'),(1,'i')]:
        while number >= value:
            result += token
            number -= value
    return result

def rows_for(page):
    """Reconstruct reading order: Windows OCR reports the code column separately."""
    words = sorted((w for line in page['lines'] for w in line['words']), key=lambda w:(w['y']+w['height']/2,w['x']))
    rows = []
    for word in words:
        baseline = word['y'] + word['height']/2
        if not (105 <= baseline <= 1305):
            continue
        previous = rows[-1] if rows else None
        if previous is None or abs(previous['baseline']-baseline)>8:
            rows.append({'baseline':baseline, 'words':[word]})
        else:
            previous['words'].append(word)
    result=[]
    for row in rows:
        ordered=sorted(row['words'],key=lambda w:w['x'])
        left=[w for w in ordered if w['x']<132]
        left_text=''.join(w['text'] for w in left)
        code=left_text if RAW_CODE.fullmatch(left_text) and any(c.isdigit() for c in left_text) else None
        title_words=[w for w in ordered if w not in left] if code else ordered
        text=' '.join(w['text'] for w in title_words).strip()
        if not text:
            result.append({'title':'','rawCode':code,'x':54,'y':int(min(w['y'] for w in ordered))})
        else:
            result.append({'title':text,'rawCode':code,'x':min(w['x'] for w in title_words),'y':int(min(w['y'] for w in ordered))})
    return result

def main(root):
    manifest=json.loads((root/'dsm-source.json').read_text(encoding='utf8'))
    entries=[]; diagnostics=[]; skipped=collections.Counter(); pages=[]; corrections=[]
    chapter=None; group=None; current_diagnosis=None; current_subtype=None
    for page_number in range(28,71):
        data=json.loads((root/'dsm-ocr'/f'dsm-{page_number:04}.json').read_text(encoding='utf-8-sig'))
        pages.append(page_number)
        rows=rows_for(data)
        combined=[]
        for index,row in enumerate(rows):
            if page_number==28 and row['y']<560:
                skipped['frontmatter_rows']+=1; continue
            title=row['title'];n=norm(title)
            if not title:
                diagnostics.append({'pdfPage':page_number,'y':row['y'],'reason':'code_without_title','rawCode':row['rawCode']})
                continue
            if n.startswith(('nota','especificar','codificar','codigo','vease','veanse')):
                skipped['instruction_start_rows']+=1;continue
            # Join visibly wrapped headings/titles before selecting reference rows.
            previous=combined[-1] if combined else None
            can_join=(previous is not None and not PAGE_END.search(previous['title'])
                      and row['y']-previous['lastY']<=35 and not row['rawCode']
                      and not n.startswith(('trastorno','otro trastorno','otros trastornos','problema','otras afecciones'))
                      and (row['x']>previous['x']+12 or previous['x']>190 or row['x']<120))
            if can_join:
                previous['title']=previous['title'].rstrip('-')+('' if previous['title'].endswith('-') else ' ')+title
                previous['lastY']=row['y'];continue
            row['lastY']=row['y'];combined.append(row)
        for row in combined:
            correction=CHAPTER_OCR_CORRECTIONS.get((page_number,row['y']))
            raw=correction[0] if correction else row['title'];n=norm(raw);page_match=PAGE_END.search(raw)
            destination=int(page_match.group(1)) if page_match else None
            has_reference=page_match is not None
            is_named_start=n.startswith(('trastorno','otro trastorno','otros trastornos','problema','otras afecciones'))
            is_episode=n.startswith(('episodio unico','episodio recurrente','episodio actual','episodio mas reciente'))
            if not (row['rawCode'] or has_reference or is_named_start or is_episode):
                skipped['non_entry_or_continuation_rows']+=1
                continue
            # A surviving instruction continuation may contain a parenthetical page:
            # keep only nominal-looking entries; otherwise mark the row for follow-up.
            if not row['rawCode'] and not is_named_start and not has_reference and not is_episode:
                diagnostics.append({'pdfPage':page_number,'y':row['y'],'reason':'uncertain_nominal_entry'})
                continue
            title=PAGE_END.sub('',raw).strip()
            if len(title)>220 or any(fragment in norm(title) for fragment in ['nota de codificacion','para ver los codigos','codigos cie-','veanse tambien']):
                diagnostics.append({'pdfPage':page_number,'y':row['y'],'reason':'instruction_or_long_continuation','length':len(title),'rawCode':row['rawCode']})
                continue
            is_chapter=(destination in CHAPTER_PAGES and row['rawCode'] is None and row['x']>100
                        and (n.startswith(('trastornos','trastorno bipolar','trastorno obsesivo','espectro','disfunciones','disforia','otros trastornos','otros problemas'))))
            # No duplicate chapter rows: same chapter may also contain a same-page diagnosis.
            is_chapter=is_chapter and not any(e.get('chapterOpeningPage')==destination for e in entries)
            scope='related' if (is_chapter and destination in {807,821}) or (chapter and chapter['scope']=='related') else 'core'
            if is_chapter:
                kind='group';parent=None
            elif row['x']<125 and not row['rawCode']:
                kind='group';parent=chapter
            elif scope=='related' and row['rawCode']:
                kind='clinical-condition';parent=current_diagnosis or group or chapter
            elif n.startswith(('leve','moderado','grave','profundo','presentacion','episodio unico','episodio recurrente')):
                kind='subtype';parent=current_subtype or current_diagnosis or group or chapter
            elif n.startswith(('en remision','con caracteristicas','con sintomas','con ansiedad','con estado','sin especificar')) and not has_reference:
                kind='specifier';parent=current_diagnosis or group or chapter
            elif n.startswith(('trastorno ','otro trastorno ','fobia ','mutismo ','agorafobia','anorexia ','bulimia ','pica','enuresis','encopresis','catatonia','delirium','insomnio','hipersomnia','narcolepsia','disforia ')) and (has_reference or row['rawCode']):
                kind='diagnosis';parent=group or chapter
            else:
                kind='coded-category' if row['rawCode'] else 'unclassified';parent=current_diagnosis or group or chapter
            source_entry=f'pdf:{page_number}:y:{row["y"]}'
            identity=hashlib.sha256((manifest['sourceSha256']+'|'+source_entry).encode()).hexdigest()[:12]
            identifier=f'dsm5tr-es-{identity}'
            raw_code=row['rawCode']
            valid_code=raw_code if raw_code and VALID_CODE.fullmatch(raw_code) else None
            notes=['Nombre y jerarquía procedentes de OCR; pendientes de comprobación visual.']
            if correction:
                notes.append('Encabezado y referencia de capítulo corregidos contrastando la imagen original; el resto de la extracción sigue pendiente.')
            if raw_code:
                notes.append('Código extraído de la columna CIE-10-MC del ejemplar; no representa una correspondencia CIE-11.')
            checked_code={
                (34,'trastorno de panico'):'F41.0',
                (34,'agorafobia'):'F40.00',
            }.get((page_number,norm(title)))
            if checked_code:
                valid_code=checked_code
                notes.append('Código cotejado visualmente en PDF34 por revisión de transcripción 2026-10-28; no validación clínica.')
                corrections.append({'sourceSha256':manifest['sourceSha256'],'sourceEntryId':source_entry,'field':'code','before':raw_code,'after':checked_code,'pdfPage':34,'reason':'visual transcription check, 2026-10-28; not clinical validation'})
            elif raw_code and not valid_code:
                notes.append('Código OCR sospechoso: no se normaliza ni se presenta como código confirmado.')
                diagnostics.append({'pdfPage':page_number,'y':row['y'],'reason':'uncertain_code','rawCode':raw_code})
            if not has_reference:
                notes.append('No se detectó referencia de página del cuerpo en esta fila; puede tratarse de una variante o continuación.')
            entry={'id':identifier,'sourceId':SOURCE_ID,'sourceEntryId':source_entry,'title':title,'kind':kind,
                   'parentId':parent['id'] if parent else None,'code':valid_code,'codeSystem':'CIE-10-MC' if valid_code else None,
                   'pdfPage':page_number,'printedPage':roman(page_number-1),'destinationPrintedPage':str(destination) if destination else None,
                   'uri':None,'sortOrder':len(entries),'scope':scope,'reviewStatus':'pending','contentStatus':'missing','topicId':None,'notes':notes}
            if raw_code:entry['rawCode']=raw_code
            if is_chapter:
                entry['chapterOpeningPage']=destination;chapter=entry;group=entry;current_diagnosis=None;current_subtype=None
            elif kind=='group':group=entry;current_diagnosis=None;current_subtype=None
            elif kind=='diagnosis':current_diagnosis=entry;current_subtype=None
            elif is_episode:current_subtype=entry
            entries.append(entry)
    source={'id':SOURCE_ID,'system':'DSM-5-TR','version':'DSM-5-TR · ejemplar español aportado','language':'es',
            'localFilename':manifest['localFilename'],'sourceSha256':manifest['sourceSha256'],'pdfPageCount':manifest['pdfPageCount'],
            'scope':'Clasificación inicial, páginas PDF 28–70; no incluye inventario de sección III ni índices finales.',
            'extractionStatus':'partial','notes':[
                'Inventario de filas candidatas, no recuento de trastornos distintos. Todo permanece pending/missing.',
                'La numeración romana de las páginas de clasificación sigue la secuencia PDF menos uno (xxvii–lxix).',
                'destinationPrintedPage identifica la página del cuerpo citada entre paréntesis; printedPage identifica la página del índice.',
                'Especificadores en línea, notas de codificación y jerarquías requieren revisión; no se expanden por inferencia.',
                'Las llamadas de nota superíndices pueden aparecer pegadas a algunos títulos OCR; deben depurarse con el original.',
                'Las afecciones en estudio y el modelo alternativo de sección III siguen fuera de la extracción.',
                'Los códigos sintácticamente válidos también pueden contener errores OCR; no son datos clínicos verificados.']}
    run={'id':'dsm-classification-ocr-v1','sourceId':SOURCE_ID,'method':'Windows OCR es-ES, reconstruction by word position; parser v1',
         'processedPdfPages':pages,'excludedBlankPdfPages':[71], 'candidateEntries':len(entries),'chapterCandidates':sum('chapterOpeningPage' in e for e in entries),
         'unresolvedRows':diagnostics,'discardedRowCounts':dict(skipped),
         'transcriptionCorrections':corrections,
         'limitation':'No exhaustive clinical or visual verification; section III remains uncounted.'}
    output={'schemaVersion':1,'sources':[source],'entries':entries,'runs':[run]}
    (root/'dsm-5-tr.json').write_text(json.dumps(output,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
    print(json.dumps({'entries':len(entries),'types':dict(collections.Counter(e['kind'] for e in entries)),
                      'chapters':run['chapterCandidates'],'uncertainRows':len(diagnostics),'pages':len(pages)},ensure_ascii=True))

if __name__=='__main__':
    parser=argparse.ArgumentParser()
    parser.add_argument('inventory_directory',type=Path)
    main(parser.parse_args().inventory_directory)

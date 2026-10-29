"""Build a local review inventory from WHO's unmodified ICD-11 MMS spreadsheet ZIP.

No credentials, API, clinical text, DSM mappings or remote writes are used.
The official ZIP stays outside Git. It is available from the Spanish 2024-01 browser:
https://icd.who.int/browse/2024-01/mms/es (Information > Spreadsheet File).

Usage:
  python scripts/inventory/cie-inventory.py --input <official.zip> --output <local.json>
"""
from __future__ import annotations

import argparse
from collections import Counter
from datetime import datetime, timezone
import csv
import hashlib
import io
import json
from pathlib import Path
import re
from zipfile import ZipFile

SOURCE_ID = 'cie-11-mms-2024-01-es'
RELEASE = '2024-01'
DOWNLOAD_URL = 'https://icdcdn.who.int/static/releasefiles/2024-01/SimpleTabulation-ICD-11-MMS-es.zip'
EXPECTED_ARCHIVE_SHA256 = 'ffbd78890e599c40f953bf49e0ae3ec942204a84ee0c2bc5be4069365d3eed8d'
BROWSER_URL = 'https://icd.who.int/browse/2024-01/mms/es'
LICENSE_URL = 'https://icd.who.int/en/docs/icd11-license.pdf'
CHAPTERS = {'06': 'core', '07': 'related', '17': 'related'}
EXPECTED_COUNTS = {'06': {'chapter': 1, 'block': 25, 'category': 858}, '07': {'chapter': 1, 'block': 6, 'category': 79}, '17': {'chapter': 1, 'block': 3, 'category': 68}}


def entity_id(uri: str) -> str:
    prefix = 'http://id.who.int/icd/release/11/mms/'
    if not uri.startswith(prefix):
        raise ValueError('Unexpected official linearization URI: ' + uri)
    return 'cie11-2024-01-es-' + uri[len(prefix):].replace('/', '-')


def build_inventory(archive: Path) -> dict:
    data = archive.read_bytes()
    archive_hash = hashlib.sha256(data).hexdigest()
    if archive_hash != EXPECTED_ARCHIVE_SHA256:
        raise ValueError('Archive differs from the verified 2024-01 Spanish snapshot: ' + archive_hash)
    with ZipFile(io.BytesIO(data)) as z:
        names = z.namelist()
        member = 'SimpleTabulation-ICD-11-MMS-es.txt'
        if member not in names:
            raise ValueError('Official Spanish TXT member not found')
        text = z.read(member).decode('utf-8-sig')
    reader = csv.DictReader(io.StringIO(text), delimiter='\t')
    expected_fields = {'Foundation URI', 'Linearization URI', 'Code', 'BlockId', 'Title', 'ClassKind', 'DepthInKind', 'IsResidual', 'ChapterNo', 'isLeaf'}
    if not expected_fields.issubset(reader.fieldnames or []):
        raise ValueError('Unexpected WHO spreadsheet schema')
    version_columns = [key for key in reader.fieldnames if key.startswith('Version:')]
    if version_columns != ['Version:2024 Jan 21 - 22:30 UTC']:
        raise ValueError('Unexpected internal release marker: ' + repr(version_columns))
    rows = list(reader)
    selected = [row for row in rows if row['ChapterNo'] in CHAPTERS]
    entries = []
    stack: list[str] = []
    codes: set[str] = set()
    identities: set[str] = set()
    for order, row in enumerate(selected):
        original_title = row['Title']
        prefix = re.match(r'^(?:- )*', original_title).group(0)
        depth = len(prefix) // 2
        title = original_title[len(prefix):]
        official_uri = row['Linearization URI']
        item_id = entity_id(official_uri)
        code = row['Code'] or None
        while len(stack) > depth:
            stack.pop()
        if len(stack) != depth:
            raise ValueError('Hierarchy depth jump for ' + original_title)
        parent_id = stack[-1] if stack else None
        stack.append(item_id)
        if item_id in identities or (code and code in codes):
            raise ValueError('Duplicate official identity or code: ' + item_id)
        if not title or not official_uri:
            raise ValueError('Missing required WHO title or URI')
        if (row['ClassKind'] == 'category') != bool(code):
            raise ValueError('Category/code mismatch for ' + title)
        identities.add(item_id)
        if code:
            codes.add(code)
        is_residual = row['IsResidual'] == 'True'
        notes = []
        if is_residual:
            notes.append('Categoría residual oficial; no equivale por sí sola a un trastorno independiente.')
        if row['ChapterNo'] != '06':
            notes.append('Ámbito relacionado fuera del capítulo 06; no se etiqueta automáticamente como trastorno mental.')
        entry = {
            'id': item_id,
            'sourceId': SOURCE_ID,
            'sourceEntryId': official_uri,
            'title': title,
            'kind': 'coded-category' if code else 'group',
            'parentId': parent_id,
            'code': code,
            'codeSystem': 'ICD-11-MMS' if code else None,
            'pdfPage': None,
            'printedPage': None,
            'uri': official_uri,
            'sortOrder': order,
            'scope': CHAPTERS[row['ChapterNo']],
            'reviewStatus': 'pending',
            'contentStatus': 'missing',
            'topicId': None,
            'notes': notes,
            # Source metadata, retained verbatim or explicitly typed; these are not clinical claims.
            'chapter': row['ChapterNo'],
            'sourceKind': row['ClassKind'],
            'foundationUri': row['Foundation URI'] or None,
            'blockId': row['BlockId'] or None,
            'isResidual': is_residual,
            'isLeaf': row['isLeaf'] == 'True',
            'sourceDepthInKind': int(row['DepthInKind']),
            'depth': depth,
        }
        entries.append(entry)
    for entry in entries:
        if entry['parentId'] and entry['parentId'] not in identities:
            raise ValueError('Missing parent: ' + entry['id'])
    chapter_counts = {}
    for chapter in CHAPTERS:
        chapter_entries = [entry for entry in entries if entry['chapter'] == chapter]
        counts = dict(Counter(entry['sourceKind'] for entry in chapter_entries))
        if counts != EXPECTED_COUNTS[chapter]:
            raise ValueError('Unexpected chapter count: ' + chapter + ' ' + repr(counts))
        chapter_counts[chapter] = {
            'entries': len(chapter_entries),
            'bySourceKind': counts,
            'codedCategories': sum(entry['kind'] == 'coded-category' for entry in chapter_entries),
            'residualCategories': sum(entry['isResidual'] for entry in chapter_entries),
            'leafCategories': sum(entry['kind'] == 'coded-category' and entry['isLeaf'] for entry in chapter_entries),
        }
    source = {
        'id': SOURCE_ID,
        'title': 'CIE-11 para estadísticas de mortalidad y morbilidad (MMS)',
        'system': 'ICD-11',
        'subtype': 'ICD-11-MMS',
        'edition': RELEASE,
        'version': RELEASE,
        'language': 'es',
        'url': BROWSER_URL,
        'sourceUrl': BROWSER_URL,
        'downloadUrl': DOWNLOAD_URL,
        'format': 'WHO SimpleTabulation, TXT in official ZIP',
        'archiveSha256': archive_hash,
        'sourceSha256': archive_hash,
        'releaseMarker': version_columns[0],
        'checkedAt': datetime.now(timezone.utc).date().isoformat(),
        'scope': 'Capítulo 06 como núcleo; capítulos 07 y 17 como ámbitos relacionados independientes.',
        'coverageStatus': 'complete-for-selected-chapters',
        'extractionStatus': 'complete',
        'coverageCheck': {
            'expectedEntries': 1042,
            'unresolvedItems': 0,
            'method': 'comparación contra 36044 filas, capítulos 06/07/17, hash y controles jerárquicos',
        },
        'reviewStatus': 'pending',
        'license': 'CC BY-ND 3.0 IGO',
        'licenseUrl': LICENSE_URL,
        'attribution': 'International Classification of Diseases, Eleventh Revision (ICD-11), World Health Organization (WHO) 2019. https://icd.who.int/browse11. Licensed under CC BY-ND 3.0 IGO.',
        'notes': [
            'El inventario conserva títulos, códigos y URI oficiales; solo retira los prefijos de sangría de la hoja del título mostrado.',
            'reviewStatus, contentStatus, topicId, scope y notas son campos editoriales de Psicoteca, no de la OMS.',
            'Los totales son categorías y agrupaciones de clasificación; no un recuento de trastornos clínicos distintos.',
            'Las categorías residuales no tienen Foundation URI en la hoja oficial; conservan su Linearization URI.',
            'Los URI de linearización del TXT no incluyen versión en el propio URI; la versión queda fijada por esta fuente y el archivo descargado.',
            'No incluye texto clínico, requisitos diagnósticos, equivalencias con DSM ni traducciones propias.',
            'El alcance no comprende otros capítulos de CIE-11 ni expresiones de poscoordinación.',
        ],
    }
    return {'schemaVersion': 1, 'sources': [source], 'entries': entries, 'summary': {'sourceRows': len(rows), 'selectedEntries': len(entries), 'codedCategories': len(codes), 'chapters': chapter_counts}}


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--input', type=Path, required=True)
    parser.add_argument('--output', type=Path, required=True)
    args = parser.parse_args()
    result = build_inventory(args.input)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(json.dumps(result['summary'], ensure_ascii=True))


if __name__ == '__main__':
    main()

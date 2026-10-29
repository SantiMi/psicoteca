"""Extract selected scanned classification pages locally; never upload the PDF."""
import argparse
import hashlib
import json
from pathlib import Path
from pypdf import PdfReader

parser = argparse.ArgumentParser()
parser.add_argument('pdf', type=Path)
parser.add_argument('output', type=Path)
parser.add_argument('--start', type=int, default=28)
parser.add_argument('--end', type=int, default=71)
args = parser.parse_args()
reader = PdfReader(args.pdf)
if not (1 <= args.start <= args.end <= len(reader.pages)):
    raise SystemExit('Invalid inclusive PDF page range')
args.output.mkdir(parents=True, exist_ok=True)
for page_number in range(args.start, args.end + 1):
    page = reader.pages[page_number - 1]
    if len(page.images) != 1:
        raise SystemExit(f'PDF page {page_number}: expected a single full-page scan')
    page.images[0].image.save(args.output / f'dsm-{page_number:04}.png')
digest = hashlib.file_digest(args.pdf.open('rb'), 'sha256').hexdigest()
manifest = {'localFilename': args.pdf.name, 'sourceSha256': digest, 'pdfPageCount': len(reader.pages), 'firstPdfPage': args.start, 'lastPdfPage': args.end, 'extraction': 'embedded full-page scans; Windows OCR is a separate step'}
(args.output.parent / 'dsm-source.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding='utf8')
print(json.dumps(manifest))

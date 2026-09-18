"""Fetch the licensed UCI teaching dataset and the pinned Pyodide NumPy wheel.
Archives are read in memory; the original bank.csv is kept byte-for-byte.
"""
from pathlib import Path
import csv
import hashlib
import io
import json
import urllib.request
import zipfile

ROOT = Path(__file__).resolve().parents[1]
DEST = ROOT / 'public/learning/bank'
URL = 'https://archive.ics.uci.edu/static/public/222/bank%2Bmarketing.zip'

def download(url):
    with urllib.request.urlopen(url, timeout=90) as response:
        return response.read()

def main():
    DEST.mkdir(parents=True, exist_ok=True)
    outer = zipfile.ZipFile(io.BytesIO(download(URL)))
    inner = zipfile.ZipFile(io.BytesIO(outer.read('bank.zip')))
    raw = inner.read('bank.csv')
    (DEST / 'bank.csv').write_bytes(raw)
    (DEST / 'bank-names.txt').write_bytes(inner.read('bank-names.txt'))
    rows = list(csv.DictReader(io.StringIO(raw.decode()), delimiter=';'))
    metadata = dict(name='UCI Bank Marketing · bank.csv', rows=len(rows), columns=list(rows[0]),
        sha256=hashlib.sha256(raw).hexdigest(), source=URL,
        citation='Moro, S., Rita, P., & Cortez, P. (2014). Bank Marketing [Dataset]. UCI. https://doi.org/10.24432/C5K306',
        license='CC BY 4.0', licenseUrl='https://creativecommons.org/licenses/by/4.0/',
        description='Original 4,521-row random subset supplied by UCI; no rows or values modified.',
        examples=rows[:5])
    (DEST / 'dataset.json').write_text(json.dumps(metadata, ensure_ascii=False, indent=2), encoding='utf-8', newline='\n')
    lock = json.loads((ROOT / 'public/runtime/pyodide/pyodide-lock.json').read_text())['packages']['numpy']
    wheel = download('https://cdn.jsdelivr.net/pyodide/v0.27.7/full/' + lock['file_name'])
    assert hashlib.sha256(wheel).hexdigest() == lock['sha256'], 'NumPy wheel checksum mismatch'
    (ROOT / 'public/runtime/pyodide' / lock['file_name']).write_bytes(wheel)
    print(json.dumps({'rows': len(rows), 'dataset_sha256': metadata['sha256'], 'numpy_bytes': len(wheel)}))

if __name__ == '__main__':
    main()

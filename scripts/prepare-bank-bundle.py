"""Package local, versioned sources. No downloads or timestamps in the archive."""
from pathlib import Path
import zipfile

folder = Path(__file__).resolve().parents[1] / 'public/learning/bank'
with zipfile.ZipFile(folder / 'nicoding-bank-lab.zip', 'w') as bundle:
    for name in ['README.md', 'requirements.txt', 'model.py', 'bank.csv', 'bank-names.txt', 'dataset.json']:
        entry = zipfile.ZipInfo(name, date_time=(2026, 9, 17, 0, 0, 0))
        entry.compress_type = zipfile.ZIP_DEFLATED
        bundle.writestr(entry, (folder / name).read_bytes())
print('Built nicoding-bank-lab.zip')

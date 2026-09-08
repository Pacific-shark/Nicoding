"""Create a WOFF2 subset from an OFL-licensed Noto Sans SC variable font.

Usage: python scripts/prepare-font.py /path/to/NotoSansSC-VF.ttf
Optional authoring dependency: pip install "fonttools[woff]"
"""
from pathlib import Path
import hashlib
import sys
from fontTools import subset
from fontTools.ttLib import TTFont

root=Path(__file__).resolve().parents[1]
source=Path(sys.argv[1])
characters=set(chr(i) for i in range(32,127))
for file in (root/'src').rglob('*'):
    if file.suffix in {'.js','.jsx','.css'}:
        characters.update(file.read_text(encoding='utf-8'))
characters.update((root/'index.html').read_text(encoding='utf-8'))
font=TTFont(source,recalcTimestamp=False)
options=subset.Options()
options.flavor='woff2'
options.name_IDs=[0,1,2,3,4,5,6,13,14,16,17]
options.name_legacy=True
options.layout_features=['*']
subsetter=subset.Subsetter(options=options)
subsetter.populate(text=''.join(sorted(characters)))
subsetter.subset(font)
missing=[c for c in characters if 0x4e00<=ord(c)<=0x9fff and ord(c) not in font.getBestCmap()]
if missing: raise ValueError('Uncovered CJK characters: '+''.join(missing))
target=root/'public/fonts/nicoding-sans-sc.woff2'
target.parent.mkdir(parents=True,exist_ok=True)
font.flavor='woff2'
font.save(target)
print('Noto Sans SC: '+str(len(characters))+' characters; '+str(target.stat().st_size)+' bytes; SHA256 '+hashlib.sha256(target.read_bytes()).hexdigest())

import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
const runtime='public/runtime/pyodide';
fs.mkdirSync(runtime,{recursive:true});fs.mkdirSync('public/licenses',{recursive:true});
for(const name of ['pyodide.mjs','pyodide.js','pyodide.asm.js','pyodide.asm.wasm','python_stdlib.zip','pyodide-lock.json'])fs.copyFileSync(path.join('node_modules/pyodide',name),path.join(runtime,name));
const lock=JSON.parse(fs.readFileSync(path.join(runtime,'pyodide-lock.json'),'utf8'));
const pkg=lock.packages.sqlite3;
const target=path.join(runtime,pkg.file_name);
const digest=data=>createHash('sha256').update(data).digest('hex');
if(!fs.existsSync(target)||digest(fs.readFileSync(target))!==pkg.sha256){
 const response=await fetch(`https://cdn.jsdelivr.net/pyodide/v0.27.7/full/${pkg.file_name}`);
 if(!response.ok)throw new Error(`SQLite download: ${response.status}`);
 const data=Buffer.from(await response.arrayBuffer());
 if(digest(data)!==pkg.sha256)throw new Error('SQLite SHA256 mismatch');
 fs.writeFileSync(target,data);
}
const licenses=[['pyodide-LICENSE.txt','https://raw.githubusercontent.com/pyodide/pyodide/0.27.7/LICENSE'],['cpython-LICENSE.txt','https://raw.githubusercontent.com/python/cpython/3.12/LICENSE']];
for(const [name,url] of licenses){const file=path.join('public/licenses',name);if(!fs.existsSync(file)){const r=await fetch(url);if(!r.ok)throw Error(`License download ${r.status}`);fs.writeFileSync(file,await r.text());}}
for(const pkgName of ['react','react-dom','lucide-react']){const source=path.join('node_modules',pkgName,'LICENSE');if(fs.existsSync(source))fs.copyFileSync(source,`public/licenses/${pkgName}-LICENSE.txt`);}
console.log(JSON.stringify({pyodide:lock.info,sqliteFile:pkg.file_name,sqliteBytes:fs.statSync(target).size,verifiedSHA256:pkg.sha256},null,2));

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.join(path.dirname(fileURLToPath(import.meta.url)),'dist');
const port=Number(process.env.NICODING_PORT||4173);
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.woff2':'font/woff2','.wasm':'application/wasm','.zip':'application/zip','.png':'image/png','.svg':'image/svg+xml','.ico':'image/x-icon','.txt':'text/plain; charset=utf-8'};
const server=http.createServer((req,res)=>{
 if(!['GET','HEAD'].includes(req.method)){res.writeHead(405);res.end();return;}
 let requested;
 try{requested=decodeURIComponent(new URL(req.url,'http://localhost').pathname);}catch{res.writeHead(400);res.end();return;}
 if(requested==='/__nicoding_health'){res.writeHead(200,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(JSON.stringify({app:'Nicoding',version:1}));return;}
 const target=path.resolve(root,'.'+(requested==='/'?'/index.html':requested));
 if(!target.startsWith(root+path.sep)||requested.includes('\0')){res.writeHead(403);res.end();return;}
 fs.stat(target,(err,stat)=>{
  if(err||!stat.isFile()){res.writeHead(404);res.end('Not found');return;}
  res.writeHead(200,{'Content-Type':mime[path.extname(target)]||'application/octet-stream','Content-Length':stat.size,'Cache-Control':requested.includes('/runtime/')?'public, max-age=86400':'no-cache','X-Content-Type-Options':'nosniff'});
  if(req.method==='HEAD')res.end();else fs.createReadStream(target).on('error',()=>res.destroy()).pipe(res);
 });
});
server.on('error',e=>{console.error(e.code==='EADDRINUSE'?`Port ${port} is already in use. Open http://127.0.0.1:${port} if Nicoding is already running.`:e.message);process.exit(1);});
server.listen(port,'127.0.0.1',()=>{
 const logs=path.join(path.dirname(fileURLToPath(import.meta.url)),'work');
 fs.mkdirSync(logs,{recursive:true});
 fs.writeFileSync(path.join(logs,'server.pid'),String(process.pid));
 console.log(`Nicoding ready at http://127.0.0.1:${port}`);
});

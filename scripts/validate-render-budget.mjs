import assert from 'node:assert/strict';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {createServer} from 'vite';
const server=await createServer({server:{middlewareMode:true},appType:'custom'});
try{
 const {default:Space}=await server.ssrLoadModule('/src/atlas/KnowledgeSpace.jsx');
 const {domainPoints}=await server.ssrLoadModule('/src/atlas/knowledge-layout.js');
 const {default:Cat}=await server.ssrLoadModule('/src/components/NicoCharacter.jsx');
 const {default:Recovery}=await server.ssrLoadModule('/src/components/RecoveryBoundary.jsx');
 const props={mode:'global',domain:'ml',camera:{orientation:[0,0,0,1],zoom:1},onCamera:()=>{},points:domainPoints.ml,selected:'ml-splits',onSelect:()=>{},progress:{state:{lessons:{}}}};
 const markup=renderToStaticMarkup(React.createElement(Space,props));
 assert.equal((markup.match(/data-space-target=/g)||[]).length,84);
 assert.equal((markup.match(/id="[^"]*-cat-\d+"/g)||[]).length,12,'share 12 glyph definitions instead of drawing 84 complete SVG trees');
 assert.equal((markup.match(/<use /g)||[]).length,84);
 assert.equal((markup.match(/<filter/g)||[]).length,0,'map does not allocate SVG filter surfaces');
 assert(!markup.includes('data-sphere-outline'),'no spherical enclosure around the knowledge branches');
 assert(markup.includes('data-renderer="branching"'));
 const elements=(markup.match(/<[a-z]+\b/g)||[]).length;
 assert(elements<1300,'map DOM budget exceeded: '+elements);
 assert(!/NaN|Infinity/.test(markup));
 for(let pose=0;pose<6;pose++){
  const cat=renderToStaticMarkup(React.createElement(Cat,{pose}));
  assert.equal((cat.match(/data-nico-frame=/g)||[]).length,1,'only the active pet frame should be mounted');
  assert((cat.match(/<image /g)||[]).length<=6);
 }
 const fallback=new Recovery({compact:true,onList:()=>{}});fallback.state={failed:true};
 assert(renderToStaticMarkup(fallback.render()).includes('打开知识列表'));
 console.log('Render budgets passed: '+elements+' map elements, 12 shared glyphs, no map filters, one mounted pet frame, recovery fallback.');
}finally{await server.close();}

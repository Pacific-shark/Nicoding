export const sigmoid=z=>1/(1+Math.exp(-z));
export function evaluate(rows,{threshold=.5,fpCost=1,fnCost=5}={}){
 let tp=0,fp=0,tn=0,fn=0,loss=0;
 for(const r of rows){const positive=r.p>=threshold;if(r.y){if(positive)tp++;else fn++;}else if(positive)fp++;else tn++;const p=Math.min(1-1e-12,Math.max(1e-12,r.p));loss-=r.y?Math.log(p):Math.log1p(-p);}
 return {n:rows.length,tp,fp,tn,fn,selected:tp+fp,accuracy:rows.length?(tp+tn)/rows.length:null,precision:tp+fp?tp/(tp+fp):null,recall:tp+fn?tp/(tp+fn):null,logloss:rows.length?loss/rows.length:null,cost:fp*fpCost+fn*fnCost};
}
export const pct=n=>n==null?'无定义':(n*100).toFixed(1)+'%';
export const decimal=n=>n==null?'—':n.toFixed(4);
export function controlledPair(runs){
 return runs.some((a,i)=>runs.slice(i+1).some(b=>['lr','l2','epochs','categorical'].filter(k=>a.config[k]!==b.config[k]).length===1));
}

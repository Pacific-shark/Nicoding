export function K(id,title,subtitle,prereqs,parts,code,prediction,pitfalls,question,sources,extra={}){
 return {id,title,subtitle,domain:id.split('-')[0],prereqs,parts,code,prediction,pitfalls,quiz:[{prompt:question[0],options:question[1],correct:question[2],explanations:question[3]}],sources:sources.map(([title,url])=>({title,url})),lang:'python',depth:'原理与应用',minutes:40,checked:'2026-09-18',...extra};
}
export const SK=(page,title)=>[title,'https://scikit-learn.org/stable/'+page];


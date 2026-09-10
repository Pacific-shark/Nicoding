// A bounded model of the displayed list examples, not a Python interpreter.
// validate-learning.mjs compares every snapshot with a real Python execution.
export const referenceModes = {
 binding: {label:'赋值与重新绑定', lines:['a = [1]','b = a','b.append(2)','a = [9]'], notes:[
  '还没有执行代码。先准备观察名字和对象。',
  '创建列表对象 A，让名字 a 指向它。',
  '两个名字指向同一列表。此时没有复制。',
  'append 修改对象 A。通过 a 或 b 都会看到 [1, 2]。',
  'a 改为指向新对象 B；b 仍指向原来的对象 A。重新赋值没有修改 A。']},
 shallow: {label:'浅拷贝', lines:['a = [[1]]','b = a.copy()','b[0].append(2)','b.append([9])'], notes:[
  '这里有两层列表，注意外层和内层分别是谁。',
  'a 指向外层 A；A 的第 0 项引用内层 B。',
  'b 指向新外层 C，但 A 和 C 的第 0 项都引用 B。',
  '修改的是共享的内层 B，所以 a 和 b 都变成 [[1, 2]]。',
  '给外层 C 追加新一项，只改变 b 的外层结构。a 仍是 [[1, 2]]。']},
 deep: {label:'深拷贝', lines:['a = [[1]]','b = deepcopy(a)','b[0].append(2)','b.append([9])'], notes:[
  '已从 copy 导入 deepcopy。先从同一个嵌套例子出发。',
  'a 的外层 A 引用内层 B。',
  '这个例子中，b 的外层 C 和内层 D 都是新列表。',
  '修改 D，不影响 B。因此 a 仍是 [[1]]，b 是 [[1, 2]]。',
  'b 新增一项 [9]，a 的对象关系仍不变。']}
};
const ref=id=>({ref:id});
export function referenceSnapshot(mode,step) {
 if(!referenceModes[mode])throw new Error('Unknown reference scenario');
 step=Math.max(0,Math.min(4,step));
 const names={},objects={};
 if(step>=1){names.a='A';objects.A=mode==='binding'?[1]:[ref('B')];if(mode!=='binding')objects.B=[1];}
 if(step>=2){names.b=mode==='binding'?'A':'C';if(mode!=='binding')objects.C=[ref(mode==='deep'?'D':'B')];if(mode==='deep')objects.D=[1];}
 if(step>=3)objects[mode==='binding'?'A':mode==='deep'?'D':'B'].push(2);
 if(step>=4){if(mode==='binding'){names.a='B';objects.B=[9];}else{const id=mode==='deep'?'E':'D';objects[id]=[9];objects.C.push(ref(id));}}
 return {names,objects};
}
export function listValue(id,objects) {
 return (objects[id]||[]).map(x=>typeof x==='object'?listValue(x.ref,objects):x);
}
export function referenceRows(snapshot) {
 return Object.entries(snapshot.names).map(([name,id])=>({name,id,value:JSON.stringify(listValue(id,snapshot.objects))}));
}
export function defaultCalls(fixed,items) {
 const shared=[];
 return items.map(item=>{
  const bag=fixed?[]:shared;
  bag.push(item);
  return [...bag];
 });
}

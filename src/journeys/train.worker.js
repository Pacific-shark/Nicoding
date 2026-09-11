import {initialize,trainEpoch} from './dl-model.js';
self.onmessage=async({data:{lr,seed,epochs}})=>{
 try{const model=initialize(seed),history=[];let best=null,bestLoss=Infinity;
  for(let epoch=1;epoch<=epochs;epoch++){const result=trainEpoch(model,lr);history.push({epoch,...result});if(result.valid<bestLoss){bestLoss=result.valid;best={epoch,model:structuredClone(model)};}if(epoch%10===0){self.postMessage({type:'progress',epoch,history});await new Promise(r=>setTimeout(r,0));}}
  self.postMessage({type:'done',run:{lr,seed,epochs,history,best,model,at:Date.now()}});
 }catch(error){self.postMessage({type:'error',message:error.message});}
};

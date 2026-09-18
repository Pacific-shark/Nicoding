import React from 'react';

// React/render and lazy-chunk errors are recoverable here. Browser process OOM
// is not catchable in JavaScript; renderer budgets and cleanup prevent pressure.
export default class RecoveryBoundary extends React.Component{
 state={failed:false};
 static getDerivedStateFromError(){return {failed:true};}
 render(){
  if(!this.state.failed)return this.props.children;
  return <section className="recovery-panel" role="alert"><h2>{this.props.compact?'星图暂时未能显示':'页面暂时未能打开'}</h2><p>{this.props.compact?'可以先用知识列表继续学习，或重新打开星图。':'请重新加载页面。已保存的学习进度不会被清除。'}</p><div>{this.props.onList&&<button onClick={this.props.onList}>打开知识列表</button>}<button onClick={()=>this.props.compact?this.setState({failed:false}):location.reload()}>{this.props.compact?'重试星图':'重新加载'}</button>{!this.props.compact&&<a href="#library" onClick={()=>this.setState({failed:false})}>返回知识星图</a>}</div></section>;
 }
}

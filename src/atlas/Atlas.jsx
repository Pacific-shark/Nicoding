import React from 'react';
import {ChapterPage,TopicPage} from './Curriculum.jsx';
import Constellation from './Constellation.jsx';
import KnowledgePage from './KnowledgePage.jsx';
import {topicById} from './topics.js';
import './atlas.css';
import './space.css';
export default function Atlas({page,id,view,progress}){
 if(page==='library'||page==='path')return <Constellation key={(id||'all')+'/'+(view||'')} id={id} view={view} progress={progress}/>;
 if(page==='knowledge'||page==='learn')return <KnowledgePage key={id} id={id} view={view} progress={progress}/>;
 if(page==='topic')return <TopicPage key={id+'/'+(view??'intro')} id={id} view={view} progress={progress}/>;
 const chapter=id||topicById[progress.state.lastTopic]?.chapter||(progress.state.lastCourse?'ml':'py');
 return <ChapterPage key={chapter} id={chapter} progress={progress}/>;
}

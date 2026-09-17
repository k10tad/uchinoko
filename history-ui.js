function historyToggleButton(container,items,onChange,label='履歴'){
 if(items.length<=3)return;
 let expanded=false;
 const button=document.createElement('button');
 button.type='button';button.className='secondary wide history-toggle';
 const update=()=>{
  items.forEach((item,index)=>item.hidden=!expanded&&index>=3);
  button.textContent=expanded?'直近3件に戻す':`${label}をすべて表示（${items.length}件）`;
  button.setAttribute('aria-expanded',String(expanded));
  onChange?.(expanded);
 };
 button.addEventListener('click',()=>{expanded=!expanded;update()});
 container.append(button);update();
}
function historyToggleLatest(container,items,label='履歴'){
 if(items.length<=3)return;
 let expanded=false;
 const button=document.createElement('button');
 button.type='button';button.className='secondary wide history-toggle';
 const update=()=>{
  items.forEach((item,index)=>item.hidden=!expanded&&index<items.length-3);
  button.textContent=expanded?'直近3件に戻す':`${label}をすべて表示（${items.length}件）`;
  button.setAttribute('aria-expanded',String(expanded));
 };
 button.addEventListener('click',()=>{expanded=!expanded;update()});
 container.insertAdjacentElement('afterend',button);update();
}
function updateTimelineHeadings(container){
 const headings=[...container.querySelectorAll(':scope > h3')];
 for(const heading of headings){
  let node=heading.nextElementSibling,visible=false;
  while(node&&!node.matches('h3')){if(node.matches('.timeline')&&!node.hidden)visible=true;node=node.nextElementSibling}
  heading.hidden=!visible;
 }
}
function applyHistoryLimits(){
 if(page==='home'){
  const todayCard=document.querySelector('.home-bottom .card');
  [...(todayCard?.querySelectorAll('.timeline')||[])].forEach((item,index)=>item.hidden=index>=3);
 }
 if(page==='records'){
  const weightChart=document.querySelector('.weight-chart');
  if(weightChart){const bars=[...weightChart.children].filter(item=>item.tagName==='DIV');historyToggleLatest(weightChart,bars,'体重記録')}
  const container=[...document.querySelectorAll('.card.section-space')].find(card=>card.querySelector('.timeline'));
  if(container){const items=[...container.querySelectorAll(':scope > .timeline')];historyToggleButton(container,items,()=>updateTimelineHeadings(container),'記録');updateTimelineHeadings(container)}
 }
 if(page==='calendar'){
  const selected=document.querySelector('.grid > .card:nth-child(2)');
  if(selected){const items=[...selected.querySelectorAll(':scope > .hospital')];historyToggleButton(selected,items,null,'この日の履歴')}
  const upcoming=[...document.querySelectorAll('.card.section-space')].find(card=>card.querySelector('h3')?.textContent.includes('これからの予定'));
  if(upcoming){const items=[...upcoming.querySelectorAll(':scope > .hospital')];historyToggleButton(upcoming,items,null,'予定')}
 }
 if(page==='settings'){
  const vaccine=document.querySelector('.vaccine-history');
  if(vaccine){const items=[...vaccine.children].filter(item=>item.tagName==='DIV');historyToggleButton(vaccine,items,null,'接種履歴')}
 }
}

const STORAGE_KEY = 'ai-sana-mvp-v1';
const WEIGHTS = { contextNeed: 20, data: 20, expectedResult: 15, successCriteria: 15, constraints: 10, users: 10, businessLink: 10 };
const FIELD_LABELS = { contextNeed:'контексте и потребности', data:'данных и материалах', expectedResult:'ожидаемом результате', successCriteria:'критериях успеха', constraints:'ограничениях', users:'пользователях', businessLink:'контакте и формате взаимодействия' };

const seed = {
  drafts: [
    {id:'d1', text:'Хотим сократить очереди в городской клинике и сделать запись удобнее для пациентов.', industry:'Здравоохранение'},
    {id:'d2', text:'Нужно помочь первокурсникам не терять дедлайны по практическим работам.', industry:'Образование'},
    {id:'d3', text:'Маленькому магазину нужен понятный способ видеть товары, которые заканчиваются.', industry:'Ритейл'},
    {id:'d4', text:'Логистическая компания хочет быстрее находить причину задержки доставки.', industry:'Логистика'},
    {id:'d5', text:'Финансовый консультант хочет объяснять клиентам сложные продукты простыми словами.', industry:'Финансы'}
  ],
  teams: [
    {id:'team1', name:'Qadam', interests:'EdTech, civic tech', skills:'UX, React, аналитика', tech:'React, Node.js'},
    {id:'team2', name:'Nomad Labs', interests:'HealthTech, AI', skills:'Python, ML, backend', tech:'FastAPI, SQLite'},
    {id:'team3', name:'Steppe Studio', interests:'Retail, design', skills:'UX/UI, frontend', tech:'Vue, Figma'},
    {id:'team4', name:'Orda Devs', interests:'Logistics, data', skills:'Go, data viz, API', tech:'Go, PostgreSQL'},
    {id:'team5', name:'Baiterek', interests:'FinTech, accessibility', skills:'product, frontend, QA', tech:'Next.js, Playwright'}
  ],
  cards: [
    {id:'task1', title:'Умная запись в клинику', companyName:'MedLine Clinic', industry:'Здравоохранение', contextNeed:'Пациенты тратят время в очереди и не всегда понимают доступные слоты. Клиника хочет сделать запись удобнее.', users:'Пациенты и регистраторы клиники.', data:'Расписание врачей, типовые причины визита, примеры талонов.', expectedResult:'Интерактивный прототип записи с подбором свободного времени.', successCriteria:'Пациент находит слот не более чем за 3 шага; регистратор видит подтверждённую запись.', constraints:'MVP за 5 часов; без интеграции с медицинской системой.', format:'Контакт с Алией в Telegram дважды за время хакатона.', contact:'Алия · business@example.com', score:100, published:true, offers:[]},
    {id:'task2', title:'Дедлайн без стресса', companyName:'City University', industry:'Образование', contextNeed:'Первокурсники теряют дедлайны практических работ и поздно узнают о накопившихся задачах.', users:'Студенты первого курса и преподаватели.', data:'Список заданий, даты сдачи, статусы выполнения.', expectedResult:'Экран с приоритетами и понятным планом на неделю.', successCriteria:'Студент за 30 секунд понимает ближайший дедлайн и следующий шаг.', constraints:'Без регистрации и push-уведомлений; только прототип данных.', format:'Онлайн-консультация с преподавателем раз в час.', score:90, published:true, offers:[]},
    {id:'task3', title:'Панель остатков магазина', companyName:'SmallMart', industry:'Ритейл', contextNeed:'Небольшому магазину сложно заранее заметить, что популярный товар заканчивается.', users:'Владелец магазина и продавцы.', data:'Остатки, продажи за неделю, минимальный порог.', expectedResult:'Дашборд с товарами риска и подсказкой по пополнению.', successCriteria:'Владелец находит 3 товара риска за 1 минуту.', constraints:'Синтетические данные; только desktop.', format:'Обратная связь в чате хакатона.', score:80, published:true, offers:[]},
    {id:'task4', title:'Почему задержалась доставка?', companyName:'QazLogistics', industry:'Логистика', contextNeed:'Менеджер видит факт задержки, но тратит много времени на поиск участка маршрута, где возникла проблема.', users:'Логисты и операторы поддержки.', data:'Статусы отправлений, временные метки, точки маршрута.', expectedResult:'Визуальная цепочка доставки с выделением проблемного этапа.', successCriteria:'Причина задержки определяется по карточке за 2 минуты.', constraints:'Без реального GPS; маршрут из 10 тестовых записей.', format:'Два коротких созвона с бизнесом.', score:80, published:true, offers:[]},
    {id:'task5', title:'Простое объяснение финансового продукта', companyName:'FinConsult', industry:'Финансы', contextNeed:'Клиенты консультанта не понимают сложные условия финансовых продуктов и задают одни и те же вопросы.', users:'Частные клиенты 25–45 лет.', data:'Публичные описания продуктов и список частых вопросов.', expectedResult:'Прототип сравнения продуктов простым языком.', successCriteria:'Пользователь может назвать отличие двух продуктов после просмотра.', constraints:'Не давать персональных финансовых рекомендаций; использовать только тестовые данные.', format:'Письменная обратная связь и финальное интервью.', score:70, published:true, offers:[]}
  ],
  proposals: [
    {id:'p1', taskId:'task1', teamId:'team2', idea:'Сделаем мастер записи с фильтром по специалисту и времени.', plan:'1) форма; 2) мок расписания; 3) экран подтверждения. 4 часа.', link:'https://example.com/nomad-clinic', status:'pending'},
    {id:'p2', taskId:'task2', teamId:'team1', idea:'Покажем недельный маршрут студента с приоритетом по сроку.', plan:'Данные → логика приоритета → календарный экран. 4 часа.', link:'https://example.com/qadam-deadline', status:'pending'},
    {id:'p3', taskId:'task3', teamId:'team3', idea:'Соберём спокойный дашборд остатков с цветовой зоной риска.', plan:'Синтетические данные → карточки → фильтр категорий. 3.5 часа.', link:'https://example.com/steppe-stock', status:'pending'},
    {id:'p4', taskId:'task4', teamId:'team4', idea:'Сделаем timeline маршрута и объясним, где накопилась задержка.', plan:'Таблица событий → timeline → состояние риска. 4 часа.', link:'https://example.com/orda-route', status:'pending'},
    {id:'p5', taskId:'task5', teamId:'team5', idea:'Сравним продукты через вопросы пользователя, без советов.', plan:'Категории → сравнение → проверка понятности. 4 часа.', link:'https://example.com/baiterek-fin', status:'pending'}
  ]
};

let state = loadState();
let currentRole = 'business';
let currentView = 'builder';
let activeTaskId = null;
let offerTaskId = null;
let dependentParentTaskId = null;
let progressOfferRef = null;

function clone(value){return JSON.parse(JSON.stringify(value));}
function loadState(){
  try { const saved = localStorage.getItem(STORAGE_KEY); if(saved){ const parsed=JSON.parse(saved); return {...parsed, dependentTasks:parsed.dependentTasks||[]}; } } catch(e) {}
  const tasks = clone(seed.cards);
  clone(seed.proposals).forEach(proposal => { const task = tasks.find(t => t.id === proposal.taskId); if(task) task.offers.push(proposal); });
  return { ...clone(seed), tasks, proposals: clone(seed.proposals), dependentTasks:[] };
}
function persist(){ localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); updateCounts(); }
function esc(value=''){ return String(value).replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
function toast(message, success=true){const el=document.getElementById('toast'); el.textContent=message; el.className='toast '+(success?'success':''); setTimeout(()=>el.classList.add('hidden'),2600);}
function getTask(){ return state.tasks.find(t=>t.id===activeTaskId); }
function readiness(score){ if(score>=90) return ['priority','Приоритетная']; if(score>=70) return ['ready','Готовая']; if(score>=40) return ['working','Рабочая']; return ['draft','Черновик']; }
function calculateScore(task){
  const values={contextNeed:task.contextNeed,data:task.data,expectedResult:task.expectedResult,successCriteria:task.successCriteria,constraints:task.constraints,users:task.users,businessLink:(task.contact&&task.format)?'yes':''};
  const breakdown={}; let score=0;
  Object.keys(WEIGHTS).forEach(key=>{ const ok=String(values[key]||'').trim().length>=8; breakdown[key]=ok?WEIGHTS[key]:0; score+=breakdown[key]; });
  return {score,breakdown,missing:Object.keys(WEIGHTS).filter(k=>!breakdown[k])};
}
function setCardFields(task){ document.querySelectorAll('[data-field]').forEach(el=>el.value=task[el.dataset.field]||''); document.getElementById('draft-company').value=task.companyName||document.getElementById('draft-company').value; document.getElementById('draft-contact').value=task.contact||document.getElementById('draft-contact').value; document.getElementById('draft-industry').value=task.industry||'Другое'; renderScore(task); }
function readCardFields(){
  const task=getTask()||{id:'draft-'+Date.now(),offers:[]}; document.querySelectorAll('[data-field]').forEach(el=>task[el.dataset.field]=el.value);
  task.companyName=document.getElementById('draft-company').value.trim(); task.contact=document.getElementById('draft-contact').value; task.industry=document.getElementById('draft-industry').value; const calc=calculateScore(task); Object.assign(task,calc); return task;
}
function renderScore(task){
  const calc=calculateScore(task); Object.assign(task,calc); document.getElementById('score-value').textContent=calc.score; document.getElementById('score-track-fill').style.width=calc.score+'%';
  const [level,label]=readiness(calc.score); const badge=document.getElementById('readiness-label'); badge.className='readiness '+level; badge.textContent=label;
  const explanation=calc.score===100?'Карточка полностью готова к работе.':`${calc.score}/100 · ${calc.missing.length} ${calc.missing.length===1?'поле требует':'полей требуют'} дополнения.`; document.getElementById('score-explain').textContent=explanation;
  const banner=document.getElementById('missing-banner'); if(calc.missing.length){banner.classList.remove('hidden');banner.innerHTML='<strong>Как повысить рейтинг:</strong> '+calc.missing.map(k=>FIELD_LABELS[k]).join(', ')+'. Баллы начисляются после заполнения и подтверждения.';}else banner.classList.add('hidden');
  document.getElementById('publish-btn').disabled=!document.getElementById('confirm-check').checked || !task.title;
}
function aiAnalyze(){
  const draft=document.getElementById('draft-text').value.trim(); if(!draft){toast('Сначала введите описание задачи',false);return;}
  let task=getTask(); if(!task){task={id:'task-'+Date.now(),offers:[]};state.tasks.unshift(task);activeTaskId=task.id;}
  task.companyName=document.getElementById('draft-company').value.trim(); task.industry=document.getElementById('draft-industry').value; task.contact=document.getElementById('draft-contact').value; task.contextNeed=task.contextNeed||draft; task.title=task.title||draft.split(/[.!?]/)[0].slice(0,60); const calc=calculateScore(task); Object.assign(task,calc); setCardFields(task);
  const questions=calc.missing.slice(0,5).map(k=>({field:k,text:{contextNeed:'Что сейчас происходит и какое изменение нужно получить?',data:'Какие данные, примеры или источники можно дать команде?',expectedResult:'Какой конкретный результат должна показать команда?',successCriteria:'По каким измеримым признакам вы примете решение?',constraints:'Какие есть сроки, технологии, доступы или ограничения?',users:'Для кого в первую очередь создаётся решение?',businessLink:'Кто будет контактным лицом и как команда получит обратную связь?'}[k]}));
  const ai=document.getElementById('ai-result'); document.getElementById('ai-empty').classList.add('hidden'); ai.classList.remove('hidden'); ai.innerHTML=`<div class="ai-summary"><span>✦</span><span><strong>Анализ завершён.</strong> Факты не добавлялись. Найдено пробелов: ${calc.missing.length}. Ответы ниже попадут только в редактируемую карточку.</span></div><div class="question-list">${questions.length?questions.map((q,i)=>`<div class="question-item"><strong>${i+1}. ${q.text}</strong><input data-question-field="${q.field}" placeholder="Ваш ответ (необязательно сейчас)" /></div>`).join(''):'<div class="ai-summary">Карточка заполнена. Проверьте данные и подтвердите публикацию.</div>'}</div>`;
  ai.querySelectorAll('[data-question-field]').forEach(input=>input.addEventListener('change',()=>{const field=input.dataset.questionField; const value=input.value.trim(); if(value){task[field]=field==='contextNeed'&&task[field]?task[field]+' '+value:value; setCardFields(task);}}));
  document.getElementById('confirm-check').checked=false; renderScore(task); persist(); toast('AI-анализ готов: проверьте и отредактируйте карточку');
}
function publish(){const task=readCardFields(); if(!task.title||!document.getElementById('confirm-check').checked){toast('Нужны название и ручное подтверждение',false);return;} task.published=true; task.publishedAt=Date.now(); persist(); renderCatalog(); toast('Задача опубликована в общем каталоге'); goTo('catalog');}
function dependentFallback(parent, role, focus){
  const parentTitle=parent.title||'задача заказчика';
  const context=parent.contextNeed||'Контекст в родительской карточке не указан.';
  const data=parent.data||'Данные и материалы в родительской карточке не указаны.';
  const expected=parent.expectedResult||'Ожидаемый результат в родительской карточке не указан.';
  const criteria=parent.successCriteria||'Критерии приёмки в родительской карточке не указаны.';
  const limits=parent.constraints||'Ограничения в родительской карточке не указаны.';
  return {title:`${focus} · зависимое задание`,role,focus,objective:`Подготовить «${focus}» как часть задачи «${parentTitle}». Работа должна помогать приблизиться к результату заказчика: ${expected}`,inputs:`Родительская задача: ${context}\nМатериалы от заказчика: ${data}`,deliverable:`Результат работы роли «${role}» по фокусу «${focus}». Формат артефакта нужно подтвердить с заказчиком до начала работы.`,acceptanceCriteria:`Фокус закрыт и связан с задачей «${parentTitle}». Проверка проводится по критерию заказчика: ${criteria}`,constraints:`Ограничения родительской задачи: ${limits}\nНе расширять объём работ без согласования с заказчиком.`,estimate:'Согласовать с заказчиком; срок в карточке зависитимого задания не задан.'};
}
function openDependentAgent(taskId){
  const parent=state.tasks.find(t=>t.id===taskId); if(!parent) return;
  dependentParentTaskId=taskId;
  document.getElementById('dependent-parent-context').innerHTML=`<span class="parent-label">РОДИТЕЛЬСКАЯ ЗАДАЧА</span><strong>${esc(parent.title||'Без названия')}</strong><p>${esc((parent.contextNeed||'Описание не добавлено').slice(0,220))}</p><span class="parent-score">${parent.score||0}/100 · ${esc(parent.industry||'Другое')}</span>`;
  document.getElementById('dependent-focus').value=(parent.expectedResult||'').split(/[.!?]/)[0].slice(0,100);
  document.getElementById('dependent-agent-empty').classList.remove('hidden');
  document.getElementById('dependent-agent-result').classList.add('hidden');
  document.getElementById('dependent-modal').classList.remove('hidden');
}
function fillDependentFields(task){document.querySelectorAll('[data-dependent-field]').forEach(el=>el.value=task[el.dataset.dependentField]||'');}
function generateDependentAgent(){
  const parent=state.tasks.find(t=>t.id===dependentParentTaskId); const focus=document.getElementById('dependent-focus').value.trim(); const role=document.getElementById('dependent-role').value;
  if(!parent||!focus){toast('Укажите фокус зависимого задания',false);return;}
  fillDependentFields(dependentFallback(parent,role,focus));
  document.getElementById('dependent-agent-empty').classList.add('hidden');
  document.getElementById('dependent-agent-result').classList.remove('hidden');
  toast('AI-агент подготовил черновик зависимого задания');
}
function saveDependentTask(){
  const parent=state.tasks.find(t=>t.id===dependentParentTaskId); const task={id:'dependent-'+Date.now(),parentTaskId:dependentParentTaskId,parentTitle:parent?.title||'Задача заказчика',role:document.getElementById('dependent-role').value,focus:document.getElementById('dependent-focus').value.trim(),status:'draft',source:'local-ai-fallback',createdAt:Date.now()};
  document.querySelectorAll('[data-dependent-field]').forEach(el=>task[el.dataset.dependentField]=el.value.trim());
  if(!task.title){toast('Добавьте название зависимого задания',false);return;}
  state.dependentTasks=state.dependentTasks||[]; state.dependentTasks.unshift(task); persist();
  document.getElementById('dependent-modal').classList.add('hidden'); renderDependent(); goTo('dependent'); toast('Зависимая карточка сохранена как черновик');
}
function renderDependent(){
  const list=document.getElementById('dependent-list'); const tasks=state.dependentTasks||[]; document.getElementById('dependent-total').textContent=tasks.length;
  if(!tasks.length){list.innerHTML='<div class="empty-state"><div class="empty-icon">⌁</div><p>Здесь появятся зависимые задания.<br/>Откройте каталог и запустите AI-агента у задачи заказчика.</p></div>';return;}
  list.innerHTML=tasks.map(task=>`<article class="dependent-card"><div class="dependent-card-head"><div><span class="dependent-status">Черновик</span><h3>${esc(task.title)}</h3><p>Родитель: <strong>${esc(task.parentTitle)}</strong></p></div><span class="role-pill">${esc(task.role||'Роль не указана')}</span></div><div class="dependent-card-grid"><div><span>Цель</span><p>${esc(task.objective||'—')}</p></div><div><span>Ожидаемый артефакт</span><p>${esc(task.deliverable||'—')}</p></div><div><span>Критерии приёмки</span><p>${esc(task.acceptanceCriteria||'—')}</p></div><div><span>Зависимость и срок</span><p>${esc(task.constraints||'—')}<br/><strong>${esc(task.estimate||'Срок не задан')}</strong></p></div></div></article>`).join('');
}
function renderCatalog(){
  const query=(document.getElementById('catalog-search')?.value||'').toLowerCase(); const level=document.getElementById('catalog-level')?.value||'all'; const sort=document.getElementById('catalog-sort')?.value||'rating';
  let tasks=state.tasks.filter(t=>t.published).filter(t=>!query||[t.title,t.companyName,t.industry,t.contextNeed,t.users].join(' ').toLowerCase().includes(query)); tasks=tasks.filter(t=>level==='all'||readiness(t.score)[0]===level); tasks.sort((a,b)=>sort==='new'?(b.publishedAt||0)-(a.publishedAt||0):b.score-a.score);
  document.getElementById('catalog-total').textContent=state.tasks.filter(t=>t.published).length; const list=document.getElementById('catalog-list'); if(!tasks.length){list.innerHTML='<div class="empty-state"><div class="empty-icon">⌕</div><p>Задач по фильтру не найдено.</p></div>';return;}
  list.innerHTML=tasks.map(t=>{const [level,label]=readiness(t.score);return `<article class="task-card"><div class="task-card-top"><div><h3>${esc(t.title)}</h3><div class="industry-tag">${esc(t.companyName||'Компания не указана')} · ${esc(t.industry||'Другое')}</div></div><span class="score-mini">${t.score}/100</span></div><p>${esc((t.contextNeed||'Описание пока не добавлено').slice(0,150))}${(t.contextNeed||'').length>150?'…':''}</p><div class="card-meta"><span class="meta-tag ${level}">${label}</span><span class="meta-tag">${(t.offers||[]).length} откликов</span></div><div class="task-card-actions"><button class="secondary-btn" data-dependent-task="${t.id}">✦ Создать зависимое</button><button class="primary-btn" data-offer-task="${t.id}">Подать предложение →</button></div></article>`}).join('');
  list.querySelectorAll('[data-offer-task]').forEach(btn=>btn.addEventListener('click',()=>openOffer(btn.dataset.offerTask)));
  list.querySelectorAll('[data-dependent-task]').forEach(btn=>btn.addEventListener('click',()=>openDependentAgent(btn.dataset.dependentTask)));
}
function normalizeWords(value=''){return String(value).toLowerCase().replace(/[^a-zа-яё0-9]+/gi,' ').split(/\s+/).filter(word=>word.length>3);}
function teamMatch(task,team){
  const industryMap={'Здравоохранение':['health','healthtech','медицин','клиник','здрав'],'Образование':['education','edtech','образован'],'Ритейл':['retail','магазин','ритейл'],'Логистика':['logistics','логист','достав'],'Финансы':['fintech','finance','финанс']};
  const text=normalizeWords(`${task.industry||''} ${task.contextNeed||''} ${task.users||''} ${task.expectedResult||''}`); const teamText=normalizeWords(`${team.interests||''} ${team.skills||''} ${team.tech||''}`); const industryWords=industryMap[task.industry]||[]; const industryHit=industryWords.some(word=>`${team.interests||''} ${team.skills||''}`.toLowerCase().includes(word)); const overlap=[...new Set(text.filter(word=>teamText.includes(word)))];
  const score=Math.min(98,35+(industryHit?35:0)+Math.min(20,overlap.length*5)+(team.tech?8:0));
  const reason=industryHit?`Интересы команды связаны с отраслью «${task.industry}».`: 'Прямое совпадение отрасли не найдено; совпадение построено по описанию навыков и технологий.';
  return {score,reason,overlap};
}
function renderTeamRecommendations(task){
  const ranked=state.teams.map(team=>({team,...teamMatch(task,team)})).sort((a,b)=>b.score-a.score).slice(0,3);
  document.getElementById('team-recommendations').innerHTML=`<div class="recommendations-head"><strong>AI-рекомендации студенту</strong><span>объяснимое совпадение</span></div>${ranked.map((item,index)=>`<div class="recommendation-item"><span class="recommendation-rank">${index+1}</span><div><strong>${esc(item.team.name)}</strong><p>${esc(item.reason)} ${item.overlap.length?`Общие признаки: ${esc(item.overlap.slice(0,3).join(', '))}.`:''}</p></div><b>${item.score}/100</b></div>`).join('')}`;
}
function reviewOffer(idea,plan,link){const missing=[];if(idea.length<20)missing.push('более конкретное описание идеи');if(plan.length<20)missing.push('этапы и срок в плане');const hasLink=Boolean(link);return {complete:missing.length===0,score:missing.length?50:hasLink?100:85,missing,hasLink};}
function updateOfferReview(){const review=reviewOffer(document.getElementById('offer-idea').value.trim(),document.getElementById('offer-plan').value.trim(),document.getElementById('offer-link').value.trim());const el=document.getElementById('offer-ai-review');el.className=`offer-ai-review ${review.complete?'complete':'incomplete'}`;el.innerHTML=review.complete?`<strong>AI-проверка: отклик выглядит полным · ${review.score}/100</strong><span>${review.hasLink?'Ссылка на прототип добавлена.':'Ссылка на прототип необязательна, но усилит предложение.'}</span>`:`<strong>AI-проверка: нужно уточнить</strong><span>${review.missing.join(' и ')}.</span>`;}
function compareTaskOffers(taskId){
  const task=state.tasks.find(item=>item.id===taskId); const target=document.getElementById(`comparison-${taskId}`); if(!task||!target)return;
  const rows=(task.offers||[]).map(offer=>{const team=state.teams.find(item=>item.id===offer.teamId)||{name:'Команда',interests:'',skills:'',tech:''};const review=reviewOffer(offer.idea||'',offer.plan||'',offer.link||'');const match=teamMatch(task,team);return {offer,team,review,match};}).sort((a,b)=>(b.review.score+b.match.score)-(a.review.score+a.match.score));
  if(!rows.length){target.innerHTML='<p class="muted">Для сравнения нужны отклики команд.</p>';return;}
  target.innerHTML=`<div class="comparison-title"><strong>AI-сравнение предложений</strong><span>Итог не заменяет решение бизнеса</span></div>${rows.map((row,index)=>`<div class="comparison-row"><span class="recommendation-rank">${index+1}</span><div><strong>${esc(row.team.name)}</strong><p>${row.review.complete?'Полнота отклика достаточная':'Нужно уточнить: '+esc(row.review.missing.join(', '))}. Совпадение с задачей: ${row.match.score}/100.</p></div><b>${Math.round((row.review.score+row.match.score)/2)}/100</b></div>`).join('')}`;
}
function openProgress(taskId,offerId){const task=state.tasks.find(item=>item.id===taskId);const offer=(task?.offers||[]).find(item=>item.id===offerId);const team=state.teams.find(item=>item.id===offer?.teamId);if(!task||!offer)return;progressOfferRef={taskId,offerId};document.getElementById('progress-modal-subtitle').textContent=`${team?.name||'Команда'} · ${task.title}`;document.getElementById('progress-note').value='';document.getElementById('progress-modal').classList.remove('hidden');}
function saveProgress(){const task=state.tasks.find(item=>item.id===progressOfferRef?.taskId);const offer=(task?.offers||[]).find(item=>item.id===progressOfferRef?.offerId);const note=document.getElementById('progress-note').value.trim();if(!offer||note.length<8){toast('Опишите фактический результат этапа',false);return;}offer.progressLog=offer.progressLog||[];offer.progressLog.push({id:'progress-'+Date.now(),stage:document.getElementById('progress-stage').value,note,status:document.getElementById('progress-status').value,createdAt:Date.now()});persist();document.getElementById('progress-modal').classList.add('hidden');renderOffers();toast('Фактический прогресс зафиксирован');}
function renderOffers(){
  const published=state.tasks.filter(t=>t.published && (t.offers||[]).length); const all=published.length?published:state.tasks.filter(t=>t.published).slice(0,2); const list=document.getElementById('offers-list');
  if(!all.length){list.innerHTML='<div class="empty-state"><div class="empty-icon">↗</div><p>Пока нет опубликованных задач.</p></div>';return;}
  list.innerHTML=all.map(task=>{const offers=task.offers||[];return `<article class="offer-task"><div class="offer-task-head"><div><p class="eyebrow">${esc(task.companyName||'Компания не указана')} · ${esc(task.industry||'Другое')} · ${task.score}/100</p><h3>${esc(task.title)}</h3></div><div class="offer-head-actions"><span class="meta-tag">${offers.length} предложений</span>${offers.length?`<button class="secondary-btn compare-btn" data-compare-task="${task.id}">✦ Сравнить предложения</button>`:''}</div></div><div id="comparison-${task.id}" class="offer-comparison hidden"></div>${offers.length?offers.map(o=>{const team=state.teams.find(x=>x.id===o.teamId)||{name:'Команда'};const progress=(o.progressLog||[]).slice(-1)[0];return `<div class="offer-item"><div><span class="offer-label">Команда</span><h4>${esc(team.name)}</h4><p>${esc(team.skills||'')}</p></div><div><span class="offer-label">Предложение · AI-проверка ${reviewOffer(o.idea||'',o.plan||'',o.link||'').score}/100</span><p><strong>${esc(o.idea)}</strong>\n${esc(o.plan)}${o.link?`\n<a href="${esc(o.link)}" target="_blank" rel="noreferrer">Открыть прототип</a>`:''}</p>${progress?`<div class="progress-history"><strong>Последний этап: ${esc(progress.stage)}</strong><span>${esc(progress.note)}</span></div>`:''}</div><div class="offer-actions">${o.status==='pending'?`<button class="accept-btn" data-decision="accepted" data-task="${task.id}" data-offer="${o.id}">Принять</button><button class="reject-btn" data-decision="rejected" data-task="${task.id}" data-offer="${o.id}">Отклонить</button>`:o.status==='accepted'?`<span class="decision accepted">Принято</span><button class="progress-btn" data-progress-task="${task.id}" data-progress-offer="${o.id}">+ Этап</button>`:`<span class="decision rejected">Отклонено</span>`}</div></div>`}).join(''):'<p class="muted">Откликов пока нет. Переключитесь в режим студента и отправьте предложение из каталога.</p>'}</article>`}).join('');
  list.querySelectorAll('[data-decision]').forEach(btn=>btn.addEventListener('click',()=>decideOffer(btn.dataset.task,btn.dataset.offer,btn.dataset.decision)));
  list.querySelectorAll('[data-compare-task]').forEach(btn=>btn.addEventListener('click',()=>{const target=document.getElementById(`comparison-${btn.dataset.compareTask}`);target.classList.toggle('hidden');if(!target.classList.contains('hidden'))compareTaskOffers(btn.dataset.compareTask);}));
  list.querySelectorAll('[data-progress-task]').forEach(btn=>btn.addEventListener('click',()=>openProgress(btn.dataset.progressTask,btn.dataset.progressOffer)));
}
function decideOffer(taskId,offerId,status){const task=state.tasks.find(t=>t.id===taskId);const offer=(task.offers||[]).find(o=>o.id===offerId);if(offer){offer.status=status;persist();renderOffers();toast(status==='accepted'?'Команда принята бизнесом':'Отклик отклонён');}}
function openOffer(taskId){offerTaskId=taskId;const task=state.tasks.find(t=>t.id===taskId);document.getElementById('offer-modal-title').textContent=`Отклик на «${task.title}»`;document.getElementById('offer-modal-subtitle').textContent=`Рейтинг задачи: ${task.score}/100 · отклики не ограничены`;document.getElementById('offer-team').innerHTML=state.teams.map(t=>`<option value="${t.id}">${esc(t.name)} · ${esc(t.skills)}</option>`).join('');document.getElementById('offer-idea').value='';document.getElementById('offer-plan').value='';document.getElementById('offer-link').value='';renderTeamRecommendations(task);updateOfferReview();document.getElementById('offer-modal').classList.remove('hidden');}
function submitOffer(){const task=state.tasks.find(t=>t.id===offerTaskId);const idea=document.getElementById('offer-idea').value.trim();const plan=document.getElementById('offer-plan').value.trim();const link=document.getElementById('offer-link').value.trim();const review=reviewOffer(idea,plan,link);if(!review.complete){toast(`AI-проверка: ${review.missing.join(' и ')}`,false);return;}task.offers=task.offers||[];task.offers.push({id:'offer-'+Date.now(),taskId:task.id,teamId:document.getElementById('offer-team').value,idea,plan,link,status:'pending',aiReview:{score:review.score,complete:review.complete,reviewedAt:Date.now()}});persist();document.getElementById('offer-modal').classList.add('hidden');renderCatalog();renderOffers();toast('Отклик проверен AI и отправлен бизнесу');}
function updateCounts(){document.getElementById('catalog-count').textContent=state.tasks.filter(t=>t.published).length;document.getElementById('offers-count').textContent=state.tasks.reduce((n,t)=>n+(t.offers||[]).length,0);document.getElementById('dependent-count').textContent=(state.dependentTasks||[]).length;document.getElementById('dependent-total').textContent=(state.dependentTasks||[]).length;}
function goTo(view){currentView=view;document.querySelectorAll('.nav-btn').forEach(x=>x.classList.toggle('active',x.dataset.view===view));document.querySelectorAll('.view').forEach(x=>x.classList.toggle('active',x.id==='view-'+view));if(view==='catalog')renderCatalog();if(view==='dependent')renderDependent();if(view==='offers')renderOffers();if(view==='teams')renderData();}
function renderData(){
  document.getElementById('teams-data').innerHTML=`<table class="data-table"><thead><tr><th>Команда</th><th>Интересы</th><th>Навыки</th><th>Технологии</th></tr></thead><tbody>${state.teams.map(t=>`<tr><td><strong>${esc(t.name)}</strong></td><td>${esc(t.interests)}</td><td>${esc(t.skills)}</td><td>${esc(t.tech)}</td></tr>`).join('')}</tbody></table>`;
  document.getElementById('drafts-data').innerHTML=`<table class="data-table"><thead><tr><th>ID</th><th>Отрасль</th><th>Черновик</th></tr></thead><tbody>${state.drafts.map(d=>`<tr><td>${esc(d.id)}</td><td>${esc(d.industry)}</td><td>${esc(d.text)}</td></tr>`).join('')}</tbody></table>`;
  document.getElementById('cards-data').innerHTML=`<table class="data-table"><thead><tr><th>Задача</th><th>Отрасль</th><th>Рейтинг</th><th>Статус</th></tr></thead><tbody>${state.tasks.slice(0,5).map(t=>`<tr><td><strong>${esc(t.title)}</strong></td><td>${esc(t.industry)}</td><td>${t.score}/100</td><td>${t.published?'Опубликована':'Черновик'}</td></tr>`).join('')}</tbody></table>`;
}
function loadDemo(){document.getElementById('draft-text').value='Хотим сделать сервис для нашей клиники.';document.getElementById('draft-company').value='MedLine Clinic';document.getElementById('draft-industry').value='Здравоохранение';document.getElementById('draft-contact').value='Алия · business@example.com';activeTaskId=null;document.querySelectorAll('[data-field]').forEach(x=>x.value='');document.getElementById('confirm-check').checked=false;document.getElementById('ai-empty').classList.remove('hidden');document.getElementById('ai-result').classList.add('hidden');renderScore({});goTo('builder');toast('Слабый пример загружен — нажмите «Проверить полноту»');}
function resetDemo(){localStorage.removeItem(STORAGE_KEY);state=loadState();activeTaskId=null;loadDemo();updateCounts();toast('Данные демо восстановлены');}

document.querySelectorAll('.nav-btn').forEach(btn=>btn.addEventListener('click',()=>goTo(btn.dataset.view)));
document.querySelectorAll('.role-btn').forEach(btn=>btn.addEventListener('click',()=>{currentRole=btn.dataset.role;document.querySelectorAll('.role-btn').forEach(x=>x.classList.toggle('active',x===btn));toast(currentRole==='student'?'Режим студента: выберите задачу и отправьте предложение':'Режим бизнеса: создайте и подтвердите задачу');}));
document.getElementById('analyze-btn').addEventListener('click',aiAnalyze);document.getElementById('load-sample-btn').addEventListener('click',loadDemo);document.getElementById('publish-btn').addEventListener('click',publish);document.getElementById('save-draft-btn').addEventListener('click',()=>{const task=readCardFields();task.published=false;persist();toast('Черновик сохранён');});document.getElementById('confirm-check').addEventListener('change',()=>{const task=getTask()||readCardFields();renderScore(task);});document.querySelectorAll('[data-field]').forEach(x=>x.addEventListener('input',()=>{const task=readCardFields();renderScore(task);}));document.getElementById('catalog-search').addEventListener('input',renderCatalog);document.getElementById('catalog-level').addEventListener('change',renderCatalog);document.getElementById('catalog-sort').addEventListener('change',renderCatalog);document.getElementById('modal-close').addEventListener('click',()=>document.getElementById('offer-modal').classList.add('hidden'));document.getElementById('submit-offer-btn').addEventListener('click',submitOffer);['offer-idea','offer-plan','offer-link'].forEach(id=>document.getElementById(id).addEventListener('input',updateOfferReview));document.getElementById('progress-modal-close').addEventListener('click',()=>document.getElementById('progress-modal').classList.add('hidden'));document.getElementById('save-progress-btn').addEventListener('click',saveProgress);document.getElementById('demo-reset-btn').addEventListener('click',resetDemo);document.getElementById('dependent-modal-close').addEventListener('click',()=>document.getElementById('dependent-modal').classList.add('hidden'));document.getElementById('dependent-generate-btn').addEventListener('click',generateDependentAgent);document.getElementById('dependent-regenerate-btn').addEventListener('click',generateDependentAgent);document.getElementById('save-dependent-btn').addEventListener('click',saveDependentTask);document.querySelectorAll('.data-tab').forEach(btn=>btn.addEventListener('click',()=>{document.querySelectorAll('.data-tab').forEach(x=>x.classList.toggle('active',x===btn));document.querySelectorAll('.data-view').forEach(x=>x.classList.toggle('active',x.id===btn.dataset.dataView));}));
document.getElementById('confirm-check').addEventListener('change',()=>{const task=readCardFields();renderScore(task);});
updateCounts();renderCatalog();renderDependent();renderOffers();renderData();renderScore({});

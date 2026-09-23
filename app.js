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
    {id:'task1', title:'Умная запись в клинику', industry:'Здравоохранение', contextNeed:'Пациенты тратят время в очереди и не всегда понимают доступные слоты. Клиника хочет сделать запись удобнее.', users:'Пациенты и регистраторы клиники.', data:'Расписание врачей, типовые причины визита, примеры талонов.', expectedResult:'Интерактивный прототип записи с подбором свободного времени.', successCriteria:'Пациент находит слот не более чем за 3 шага; регистратор видит подтверждённую запись.', constraints:'MVP за 5 часов; без интеграции с медицинской системой.', format:'Контакт с Алией в Telegram дважды за время хакатона.', contact:'Алия · business@example.com', score:100, published:true, offers:[]},
    {id:'task2', title:'Дедлайн без стресса', industry:'Образование', contextNeed:'Первокурсники теряют дедлайны практических работ и поздно узнают о накопившихся задачах.', users:'Студенты первого курса и преподаватели.', data:'Список заданий, даты сдачи, статусы выполнения.', expectedResult:'Экран с приоритетами и понятным планом на неделю.', successCriteria:'Студент за 30 секунд понимает ближайший дедлайн и следующий шаг.', constraints:'Без регистрации и push-уведомлений; только прототип данных.', format:'Онлайн-консультация с преподавателем раз в час.', score:90, published:true, offers:[]},
    {id:'task3', title:'Панель остатков магазина', industry:'Ритейл', contextNeed:'Небольшому магазину сложно заранее заметить, что популярный товар заканчивается.', users:'Владелец магазина и продавцы.', data:'Остатки, продажи за неделю, минимальный порог.', expectedResult:'Дашборд с товарами риска и подсказкой по пополнению.', successCriteria:'Владелец находит 3 товара риска за 1 минуту.', constraints:'Синтетические данные; только desktop.', format:'Обратная связь в чате хакатона.', score:80, published:true, offers:[]},
    {id:'task4', title:'Почему задержалась доставка?', industry:'Логистика', contextNeed:'Менеджер видит факт задержки, но тратит много времени на поиск участка маршрута, где возникла проблема.', users:'Логисты и операторы поддержки.', data:'Статусы отправлений, временные метки, точки маршрута.', expectedResult:'Визуальная цепочка доставки с выделением проблемного этапа.', successCriteria:'Причина задержки определяется по карточке за 2 минуты.', constraints:'Без реального GPS; маршрут из 10 тестовых записей.', format:'Два коротких созвона с бизнесом.', score:80, published:true, offers:[]},
    {id:'task5', title:'Простое объяснение финансового продукта', industry:'Финансы', contextNeed:'Клиенты консультанта не понимают сложные условия финансовых продуктов и задают одни и те же вопросы.', users:'Частные клиенты 25–45 лет.', data:'Публичные описания продуктов и список частых вопросов.', expectedResult:'Прототип сравнения продуктов простым языком.', successCriteria:'Пользователь может назвать отличие двух продуктов после просмотра.', constraints:'Не давать персональных финансовых рекомендаций; использовать только тестовые данные.', format:'Письменная обратная связь и финальное интервью.', score:70, published:true, offers:[]}
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

function clone(value){return JSON.parse(JSON.stringify(value));}
function loadState(){
  try { const saved = localStorage.getItem(STORAGE_KEY); if(saved) return JSON.parse(saved); } catch(e) {}
  const tasks = clone(seed.cards);
  clone(seed.proposals).forEach(proposal => { const task = tasks.find(t => t.id === proposal.taskId); if(task) task.offers.push(proposal); });
  return { ...clone(seed), tasks, proposals: clone(seed.proposals) };
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
function setCardFields(task){ document.querySelectorAll('[data-field]').forEach(el=>el.value=task[el.dataset.field]||''); document.getElementById('draft-contact').value=task.contact||document.getElementById('draft-contact').value; document.getElementById('draft-industry').value=task.industry||'Другое'; renderScore(task); }
function readCardFields(){
  const task=getTask()||{id:'draft-'+Date.now(),offers:[]}; document.querySelectorAll('[data-field]').forEach(el=>task[el.dataset.field]=el.value);
  task.contact=document.getElementById('draft-contact').value; task.industry=document.getElementById('draft-industry').value; const calc=calculateScore(task); Object.assign(task,calc); return task;
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
  task.industry=document.getElementById('draft-industry').value; task.contact=document.getElementById('draft-contact').value; task.contextNeed=task.contextNeed||draft; task.title=task.title||draft.split(/[.!?]/)[0].slice(0,60); const calc=calculateScore(task); Object.assign(task,calc); setCardFields(task);
  const questions=calc.missing.slice(0,5).map(k=>({field:k,text:{contextNeed:'Что сейчас происходит и какое изменение нужно получить?',data:'Какие данные, примеры или источники можно дать команде?',expectedResult:'Какой конкретный результат должна показать команда?',successCriteria:'По каким измеримым признакам вы примете решение?',constraints:'Какие есть сроки, технологии, доступы или ограничения?',users:'Для кого в первую очередь создаётся решение?',businessLink:'Кто будет контактным лицом и как команда получит обратную связь?'}[k]}));
  const ai=document.getElementById('ai-result'); document.getElementById('ai-empty').classList.add('hidden'); ai.classList.remove('hidden'); ai.innerHTML=`<div class="ai-summary"><span>✦</span><span><strong>Анализ завершён.</strong> Факты не добавлялись. Найдено пробелов: ${calc.missing.length}. Ответы ниже попадут только в редактируемую карточку.</span></div><div class="question-list">${questions.length?questions.map((q,i)=>`<div class="question-item"><strong>${i+1}. ${q.text}</strong><input data-question-field="${q.field}" placeholder="Ваш ответ (необязательно сейчас)" /></div>`).join(''):'<div class="ai-summary">Карточка заполнена. Проверьте данные и подтвердите публикацию.</div>'}</div>`;
  ai.querySelectorAll('[data-question-field]').forEach(input=>input.addEventListener('change',()=>{const field=input.dataset.questionField; const value=input.value.trim(); if(value){task[field]=field==='contextNeed'&&task[field]?task[field]+' '+value:value; setCardFields(task);}}));
  document.getElementById('confirm-check').checked=false; renderScore(task); persist(); toast('AI-анализ готов: проверьте и отредактируйте карточку');
}
function publish(){const task=readCardFields(); if(!task.title||!document.getElementById('confirm-check').checked){toast('Нужны название и ручное подтверждение',false);return;} task.published=true; task.publishedAt=Date.now(); persist(); renderCatalog(); toast('Задача опубликована в общем каталоге'); goTo('catalog');}
function renderCatalog(){
  const query=(document.getElementById('catalog-search')?.value||'').toLowerCase(); const level=document.getElementById('catalog-level')?.value||'all'; const sort=document.getElementById('catalog-sort')?.value||'rating';
  let tasks=state.tasks.filter(t=>t.published).filter(t=>!query||[t.title,t.industry,t.contextNeed,t.users].join(' ').toLowerCase().includes(query)); tasks=tasks.filter(t=>level==='all'||readiness(t.score)[0]===level); tasks.sort((a,b)=>sort==='new'?(b.publishedAt||0)-(a.publishedAt||0):b.score-a.score);
  document.getElementById('catalog-total').textContent=state.tasks.filter(t=>t.published).length; const list=document.getElementById('catalog-list'); if(!tasks.length){list.innerHTML='<div class="empty-state"><div class="empty-icon">⌕</div><p>Задач по фильтру не найдено.</p></div>';return;}
  list.innerHTML=tasks.map(t=>{const [level,label]=readiness(t.score);return `<article class="task-card"><div class="task-card-top"><div><h3>${esc(t.title)}</h3><div class="industry-tag">${esc(t.industry||'Другое')}</div></div><span class="score-mini">${t.score}/100</span></div><p>${esc((t.contextNeed||'Описание пока не добавлено').slice(0,150))}${(t.contextNeed||'').length>150?'…':''}</p><div class="card-meta"><span class="meta-tag ${level}">${label}</span><span class="meta-tag">${(t.offers||[]).length} откликов</span></div><button class="primary-btn" data-offer-task="${t.id}">Подать предложение →</button></article>`}).join('');
  list.querySelectorAll('[data-offer-task]').forEach(btn=>btn.addEventListener('click',()=>openOffer(btn.dataset.offerTask)));
}
function renderOffers(){
  const published=state.tasks.filter(t=>t.published && (t.offers||[]).length); const all=published.length?published:state.tasks.filter(t=>t.published).slice(0,2); const list=document.getElementById('offers-list');
  if(!all.length){list.innerHTML='<div class="empty-state"><div class="empty-icon">↗</div><p>Пока нет опубликованных задач.</p></div>';return;}
  list.innerHTML=all.map(task=>{const offers=task.offers||[];return `<article class="offer-task"><div class="offer-task-head"><div><p class="eyebrow">${esc(task.industry||'Другое')} · ${task.score}/100</p><h3>${esc(task.title)}</h3></div><span class="meta-tag">${offers.length} предложений</span></div>${offers.length?offers.map(o=>{const team=state.teams.find(x=>x.id===o.teamId)||{name:'Команда'};return `<div class="offer-item"><div><span class="offer-label">Команда</span><h4>${esc(team.name)}</h4><p>${esc(team.skills||'')}</p></div><div><span class="offer-label">Предложение</span><p><strong>${esc(o.idea)}</strong>\n${esc(o.plan)}${o.link?`\n<a href="${esc(o.link)}" target="_blank" rel="noreferrer">Открыть прототип</a>`:''}</p></div><div class="offer-actions">${o.status==='pending'?`<button class="accept-btn" data-decision="accepted" data-task="${task.id}" data-offer="${o.id}">Принять</button><button class="reject-btn" data-decision="rejected" data-task="${task.id}" data-offer="${o.id}">Отклонить</button>`:`<span class="decision ${o.status}">${o.status==='accepted'?'Принято':'Отклонено'}</span>`}</div></div>`}).join(''):'<p class="muted">Откликов пока нет. Переключитесь в режим студента и отправьте предложение из каталога.</p>'}</article>`}).join('');
  list.querySelectorAll('[data-decision]').forEach(btn=>btn.addEventListener('click',()=>decideOffer(btn.dataset.task,btn.dataset.offer,btn.dataset.decision)));
}
function decideOffer(taskId,offerId,status){const task=state.tasks.find(t=>t.id===taskId);const offer=(task.offers||[]).find(o=>o.id===offerId);if(offer){offer.status=status;persist();renderOffers();toast(status==='accepted'?'Команда принята бизнесом':'Отклик отклонён');}}
function openOffer(taskId){offerTaskId=taskId;const task=state.tasks.find(t=>t.id===taskId);document.getElementById('offer-modal-title').textContent=`Отклик на «${task.title}»`;document.getElementById('offer-modal-subtitle').textContent=`Рейтинг задачи: ${task.score}/100 · отклики не ограничены`;document.getElementById('offer-team').innerHTML=state.teams.map(t=>`<option value="${t.id}">${esc(t.name)} · ${esc(t.skills)}</option>`).join('');document.getElementById('offer-idea').value='';document.getElementById('offer-plan').value='';document.getElementById('offer-link').value='';document.getElementById('offer-modal').classList.remove('hidden');}
function submitOffer(){const task=state.tasks.find(t=>t.id===offerTaskId);const idea=document.getElementById('offer-idea').value.trim();const plan=document.getElementById('offer-plan').value.trim();if(!idea||!plan){toast('Заполните идею и план',false);return;}task.offers=task.offers||[];task.offers.push({id:'offer-'+Date.now(),taskId:task.id,teamId:document.getElementById('offer-team').value,idea,plan,link:document.getElementById('offer-link').value.trim(),status:'pending'});persist();document.getElementById('offer-modal').classList.add('hidden');renderCatalog();renderOffers();toast('Предложение отправлено бизнесу');}
function updateCounts(){document.getElementById('catalog-count').textContent=state.tasks.filter(t=>t.published).length;document.getElementById('offers-count').textContent=state.tasks.reduce((n,t)=>n+(t.offers||[]).length,0);}
function goTo(view){currentView=view;document.querySelectorAll('.nav-btn').forEach(x=>x.classList.toggle('active',x.dataset.view===view));document.querySelectorAll('.view').forEach(x=>x.classList.toggle('active',x.id==='view-'+view));if(view==='catalog')renderCatalog();if(view==='offers')renderOffers();if(view==='teams')renderData();}
function renderData(){
  document.getElementById('teams-data').innerHTML=`<table class="data-table"><thead><tr><th>Команда</th><th>Интересы</th><th>Навыки</th><th>Технологии</th></tr></thead><tbody>${state.teams.map(t=>`<tr><td><strong>${esc(t.name)}</strong></td><td>${esc(t.interests)}</td><td>${esc(t.skills)}</td><td>${esc(t.tech)}</td></tr>`).join('')}</tbody></table>`;
  document.getElementById('drafts-data').innerHTML=`<table class="data-table"><thead><tr><th>ID</th><th>Отрасль</th><th>Черновик</th></tr></thead><tbody>${state.drafts.map(d=>`<tr><td>${esc(d.id)}</td><td>${esc(d.industry)}</td><td>${esc(d.text)}</td></tr>`).join('')}</tbody></table>`;
  document.getElementById('cards-data').innerHTML=`<table class="data-table"><thead><tr><th>Задача</th><th>Отрасль</th><th>Рейтинг</th><th>Статус</th></tr></thead><tbody>${state.tasks.slice(0,5).map(t=>`<tr><td><strong>${esc(t.title)}</strong></td><td>${esc(t.industry)}</td><td>${t.score}/100</td><td>${t.published?'Опубликована':'Черновик'}</td></tr>`).join('')}</tbody></table>`;
}
function loadDemo(){document.getElementById('draft-text').value='Хотим сделать сервис для нашей клиники.';document.getElementById('draft-industry').value='Здравоохранение';document.getElementById('draft-contact').value='Алия · business@example.com';activeTaskId=null;document.querySelectorAll('[data-field]').forEach(x=>x.value='');document.getElementById('confirm-check').checked=false;document.getElementById('ai-empty').classList.remove('hidden');document.getElementById('ai-result').classList.add('hidden');renderScore({});goTo('builder');toast('Слабый пример загружен — нажмите «Проверить полноту»');}
function resetDemo(){localStorage.removeItem(STORAGE_KEY);state=loadState();activeTaskId=null;loadDemo();updateCounts();toast('Данные демо восстановлены');}

document.querySelectorAll('.nav-btn').forEach(btn=>btn.addEventListener('click',()=>goTo(btn.dataset.view)));
document.querySelectorAll('.role-btn').forEach(btn=>btn.addEventListener('click',()=>{currentRole=btn.dataset.role;document.querySelectorAll('.role-btn').forEach(x=>x.classList.toggle('active',x===btn));toast(currentRole==='student'?'Режим студента: выберите задачу и отправьте предложение':'Режим бизнеса: создайте и подтвердите задачу');}));
document.getElementById('analyze-btn').addEventListener('click',aiAnalyze);document.getElementById('load-sample-btn').addEventListener('click',loadDemo);document.getElementById('publish-btn').addEventListener('click',publish);document.getElementById('save-draft-btn').addEventListener('click',()=>{const task=readCardFields();task.published=false;persist();toast('Черновик сохранён');});document.getElementById('confirm-check').addEventListener('change',()=>{const task=getTask()||readCardFields();renderScore(task);});document.querySelectorAll('[data-field]').forEach(x=>x.addEventListener('input',()=>{const task=readCardFields();renderScore(task);}));document.getElementById('catalog-search').addEventListener('input',renderCatalog);document.getElementById('catalog-level').addEventListener('change',renderCatalog);document.getElementById('catalog-sort').addEventListener('change',renderCatalog);document.getElementById('modal-close').addEventListener('click',()=>document.getElementById('offer-modal').classList.add('hidden'));document.getElementById('submit-offer-btn').addEventListener('click',submitOffer);document.getElementById('demo-reset-btn').addEventListener('click',resetDemo);document.querySelectorAll('.data-tab').forEach(btn=>btn.addEventListener('click',()=>{document.querySelectorAll('.data-tab').forEach(x=>x.classList.toggle('active',x===btn));document.querySelectorAll('.data-view').forEach(x=>x.classList.toggle('active',x.id===btn.dataset.dataView));}));
document.getElementById('confirm-check').addEventListener('change',()=>{const task=readCardFields();renderScore(task);});
updateCounts();renderCatalog();renderOffers();renderData();renderScore({});

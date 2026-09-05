const ROUTES = [
  { icon:'🏮', level:1, category:'人文', duration:'周末 · 1日', name:'古城漫步·非遗体验', subtitle:'逃离工位，做一天古城闲人', reward:100, price:'0.001', highlights:['古城慢行','非遗手作','本地小吃'] },
  { icon:'⛰️', level:1, category:'风景', duration:'周末 · 1日', name:'城市后山·轻徒步', subtitle:'周末不加班，上山喘口气', reward:100, price:'0.001', highlights:['轻量徒步','城市日落','山顶野餐'] },
  { icon:'🛶', level:2, category:'人文', duration:'短途 · 2日', name:'周末古镇·深度人文', subtitle:'两天一夜，假装在生活', reward:200, price:'0.005', highlights:['古镇夜游','在地访谈','传统民居'] },
  { icon:'🌲', level:2, category:'风景', duration:'短途 · 2日', name:'周末秘境·原始森林', subtitle:'关掉电脑，听鸟叫', reward:200, price:'0.005', highlights:['森林穿越','溪谷露营','自然观察'] },
  { icon:'🐫', level:3, category:'人文', duration:'长假 · 5日', name:'长假丝路·文化溯源', subtitle:'请个年假，去有风的地方', reward:300, price:'0.010', highlights:['丝路遗迹','博物馆线','城市漫游'] },
  { icon:'🏔️', level:3, category:'风景', duration:'长假 · 7日', name:'长假雪山·徒步朝圣', subtitle:'人生是旷野，不是工位', reward:300, price:'0.010', highlights:['雪山徒步','高原星空','终极徽章'] },
];
const KEY = 'escape-the-desk-demo-v2';
let state = { connected:false, address:'', category:'全部', level:'全部等级', points:0, nftCount:0, unlocked:[], completed:[], history:[] };
try { state = { ...state, ...JSON.parse(localStorage.getItem(KEY) || '{}') }; } catch (_) {}
const persist = () => localStorage.setItem(KEY, JSON.stringify(state));
const shortAddress = value => value ? `${value.slice(0,6)}…${value.slice(-4)}` : '演示账号';
const isUnlocked = id => state.unlocked.includes(id);
const isCompleted = level => state.completed.includes(level);
const canEnter = level => level === 1 || isCompleted(level - 1);
function routeState(route,id) {
  if (isCompleted(route.level)) return { status:'已完成', label:'已完成 ✓', disabled:true };
  if (!state.connected) return { status:'未连接', label:'连接钱包后解锁', disabled:false };
  if (!canEnter(route.level)) return { status:'等级未达成', label:`完成 L${route.level-1} 后解锁`, disabled:true };
  if (isUnlocked(id)) return { status:'待打卡', label:'确认打卡', disabled:false };
  return { status:'未解锁', label:`解锁路线 · ${route.price} MON`, disabled:false };
}
function toast(message,type='success') {
  document.querySelector('.demo-toast')?.remove();
  const node=document.createElement('div'); node.className=`demo-toast ${type}`; node.textContent=message; document.body.appendChild(node);
  requestAnimationFrame(()=>node.classList.add('show')); setTimeout(()=>{node.classList.remove('show');setTimeout(()=>node.remove(),250)},2800);
}
function modal(content) {
  closeModal(); const shell=document.createElement('div'); shell.className='modal-backdrop'; shell.dataset.modal='true'; shell.innerHTML=`<div class="success-modal dynamic-modal" role="dialog" aria-modal="true"><button class="modal-close" aria-label="关闭">×</button>${content}</div>`; document.body.appendChild(shell);
  shell.querySelector('.modal-close').onclick=closeModal; shell.addEventListener('click',event=>{if(event.target===shell)closeModal()}); document.addEventListener('keydown',escapeModal); return shell;
}
function closeModal(){ document.querySelector('[data-modal]')?.remove(); document.removeEventListener('keydown',escapeModal); }
function escapeModal(event){ if(event.key==='Escape')closeModal(); }
function renderRoutes() {
  const list=ROUTES.map((route,id)=>({route,id})).filter(({route})=>(state.category==='全部'||route.category===state.category)&&(state.level==='全部等级'||`L${route.level}`===state.level));
  document.querySelector('#route-grid').innerHTML=list.length ? list.map(({route,id})=>{
    const view=routeState(route,id);
    return `<article class="route-card interactive-card" tabindex="0" data-detail="${id}"><div class="card-art"><span>${route.icon}</span><div class="level-pill">L${route.level}</div><div class="status-pill">${view.status}</div></div><div class="card-body"><div class="route-meta"><span>${route.category}</span><span>${route.duration}</span></div><h3>${route.name}</h3><p class="subtitle">“${route.subtitle}”</p><div class="reward-line"><span>完成奖励</span><strong>${route.reward} 积分 + NFT</strong></div><div class="card-actions"><button class="detail-button" data-detail-button="${id}">查看详情</button><button class="preview-card-button" data-action="${id}" ${view.disabled?'disabled':''}>${view.label}</button></div></div></article>`;
  }).join('') : '<div class="empty-state"><span>🧭</span><strong>暂时没有符合条件的路线</strong><p>换个筛选条件看看，旷野总会出现。</p></div>';
}
function syncUI() {
  document.querySelectorAll('.preview-wallet').forEach(button=>button.textContent=state.connected?shortAddress(state.address):'连接钱包');
  const walletEmpty=document.querySelector('.wallet-empty'); if(walletEmpty)walletEmpty.style.display=state.connected?'none':'flex';
  const stats=document.querySelectorAll('.stats-bar strong'); stats[0].textContent=String(state.points); stats[1].innerHTML=`${state.unlocked.length}<small> / 6</small>`; stats[2].innerHTML=`${state.nftCount}<small> / 3</small>`;
  document.querySelectorAll('.filter-group').forEach((group,index)=>group.querySelectorAll('button').forEach(button=>button.classList.toggle('active',button.textContent.trim()===(index===0?state.category:state.level))));
  renderRoutes(); persist();
}
function walletModal() {
  if (state.connected) {
    const shell=modal(`<span class="section-index">MY ESCAPE PASS</span><h2>我的出逃身份</h2><p class="account-address">${state.address||'Demo Traveler'}</p><div class="success-reward"><b>${state.points} 积分</b><span>${state.nftCount} 枚 NFT</span></div><div class="modal-actions"><button data-progress>查看进度</button><button class="danger-action" data-reset>重置演示</button><button data-disconnect>断开连接</button></div>`);
    shell.querySelector('[data-progress]').onclick=progressModal; shell.querySelector('[data-reset]').onclick=resetDemo; shell.querySelector('[data-disconnect]').onclick=()=>{state.connected=false;state.address='';closeModal();syncUI();toast('钱包已断开','info')}; return;
  }
  const shell=modal(`<span class="success-icon">👛</span><span class="section-index">CONNECT · DEMO</span><h2>选择连接方式</h2><p>真实钱包仅用于展示地址；路线操作仍是本地比赛演示，不会签名或扣款。</p><div class="wallet-options"><button data-injected>🦊 连接浏览器钱包</button><button data-demo>⚡ 使用演示账号</button></div>`);
  shell.querySelector('[data-demo]').onclick=()=>connect('0x7A11DE5C00000000000000000000DApp');
  shell.querySelector('[data-injected]').onclick=connectInjected;
}
function connect(address){ state.connected=true;state.address=address;closeModal();syncUI();toast('连接成功，开始你的第一次出逃！'); }
async function connectInjected(){
  if(!window.ethereum){toast('未检测到浏览器钱包，请使用演示账号','error');return}
  try{const accounts=await window.ethereum.request({method:'eth_requestAccounts'});connect(accounts[0])}catch(error){toast('你取消了钱包连接','error')}
}
function detailModal(id) {
  const route=ROUTES[id], view=routeState(route,id), requirements=route.level===1?'无需前置等级':`需先完成 L${route.level-1}`;
  const shell=modal(`<span class="success-icon">${route.icon}</span><span class="section-index">L${route.level} · ${route.category}</span><h2>${route.name}</h2><p>“${route.subtitle}”</p><div class="detail-grid"><div><small>行程</small><b>${route.duration}</b></div><div><small>价格</small><b>${route.price} MON</b></div><div><small>奖励</small><b>${route.reward} 积分</b></div><div><small>条件</small><b>${requirements}</b></div></div><ul class="highlights">${route.highlights.map(item=>`<li>✓ ${item}</li>`).join('')}</ul><div class="modal-actions"><button data-modal-action ${view.disabled?'disabled':''}>${view.label}</button></div>`);
  shell.querySelector('[data-modal-action]').onclick=()=>{closeModal();routeAction(id)};
}
function routeAction(id) {
  const route=ROUTES[id], view=routeState(route,id); if(view.disabled)return;
  if(!state.connected){walletModal();return}
  if(isUnlocked(id)) confirmComplete(id); else confirmUnlock(id);
}
function confirmUnlock(id) {
  const route=ROUTES[id], shell=modal(`<span class="success-icon">🔓</span><span class="section-index">DEMO UNLOCK</span><h2>确认解锁路线</h2><p>${route.name}</p><div class="detail-grid"><div><small>演示金额</small><b>${route.price} MON</b></div><div><small>网络</small><b>Monad Testnet</b></div></div><p class="demo-warning">演示模式不会发送交易或扣除资产。</p><div class="modal-actions"><button data-confirm>确认演示解锁</button></div>`);
  shell.querySelector('[data-confirm]').onclick=async event=>{event.target.disabled=true;event.target.textContent='模拟确认中…';await new Promise(resolve=>setTimeout(resolve,650));state.unlocked.push(id);state.history.unshift({type:'unlock',name:route.name,time:Date.now()});closeModal();syncUI();toast('路线已解锁，出发后回来打卡吧！')};
}
function confirmComplete(id) {
  const route=ROUTES[id], shell=modal(`<span class="success-icon">📍</span><span class="section-index">DEMO CHECK-IN</span><h2>确认完成打卡</h2><p>${route.name}</p><div class="success-reward"><b>L${route.level} NFT</b><span>+${route.reward} 积分</span></div><p class="demo-warning">本操作只更新本地演示进度。</p><div class="modal-actions"><button data-confirm>确认打卡</button></div>`);
  shell.querySelector('[data-confirm]').onclick=async event=>{event.target.disabled=true;event.target.textContent='铸造徽章中…';await new Promise(resolve=>setTimeout(resolve,800));state.completed.push(route.level);state.points+=route.reward;state.nftCount++;state.history.unshift({type:'complete',name:route.name,time:Date.now()});closeModal();syncUI();successModal(route)};
}
function successModal(route) {
  const shell=modal(`<span class="success-icon">🎉</span><span class="section-index">ESCAPE SUCCESS</span><h2>逃离成功！</h2><p>“工位之外，皆是旷野”</p><div class="success-reward"><b>L${route.level} NFT</b><span>+${route.reward} 积分</span></div><div class="modal-actions"><button data-share>分享出逃</button><button data-next>继续探索</button></div>`);
  shell.querySelector('[data-next]').onclick=closeModal; shell.querySelector('[data-share]').onclick=shareDemo;
}
async function shareDemo(){const text=`我在「逃离工位」完成了一次链上旅行闯关！`;try{if(navigator.share)await navigator.share({title:'逃离工位',text,url:location.href});else{await navigator.clipboard.writeText(`${text} ${location.href}`);toast('分享文案已复制')}}catch(_){} }
function progressModal() {
  closeModal(); const next=[1,2,3].find(level=>!isCompleted(level)); const history=state.history.length?state.history.slice(0,5).map(item=>`<li><b>${item.type==='complete'?'完成':'解锁'}</b>${item.name}<small>${new Date(item.time).toLocaleString()}</small></li>`).join(''):'<li class="no-history">还没有出逃记录，从 L1 开始吧。</li>';
  modal(`<span class="success-icon">🏆</span><span class="section-index">MY PROGRESS</span><h2>出逃进度</h2><div class="progress-track"><i style="width:${Math.round(state.nftCount/3*100)}%"></i></div><p>已完成 ${state.nftCount} / 3 个等级${next?`，下一目标 L${next}`:'，旷野已全部解锁！'}</p><ul class="history-list">${history}</ul>`);
}
function resetDemo(){ if(!confirm('确定重置所有演示进度吗？'))return; const connected=state.connected,address=state.address;state={connected,address,category:'全部',level:'全部等级',points:0,nftCount:0,unlocked:[],completed:[],history:[]};closeModal();syncUI();toast('演示进度已重置','info'); }
document.querySelectorAll('.preview-wallet').forEach(button=>button.addEventListener('click',walletModal));
document.querySelector('#route-grid').addEventListener('click',event=>{const action=event.target.closest('[data-action]'),detail=event.target.closest('[data-detail-button]');if(action)routeAction(Number(action.dataset.action));else if(detail)detailModal(Number(detail.dataset.detailButton))});
document.querySelector('#route-grid').addEventListener('keydown',event=>{if((event.key==='Enter'||event.key===' ')&&event.target.matches('[data-detail]'))detailModal(Number(event.target.dataset.detail))});
document.querySelectorAll('.filter-group').forEach((group,index)=>group.querySelectorAll('button').forEach(button=>button.addEventListener('click',()=>{if(index===0)state.category=button.textContent.trim();else state.level=button.textContent.trim();syncUI()})));
document.querySelector('.stats-bar').addEventListener('click',progressModal);document.querySelector('.stats-bar').setAttribute('title','点击查看出逃进度');
syncUI();
'use strict';
const CONFIG=Object.freeze({channel:'odedsvr',channelId:7685090,kick:'https://kick.com/OdedSVR',channelAPI:'https://kick.com/api/v2/channels/odedsvr',emoteAPI:'https://kick.com/emotes/odedsvr',snapshotDate:'22.09.2026',
  // Latest YouTube uploads: /api/videos (server function reading the channel's public feed, no API key),
  // falling back to the bundled snapshot when the function isn't available (e.g. local preview).
  videoAPI:'/api/videos',videoSnapshot:'assets/data/videos.json',videoCount:10,videoCacheMinutes:10});
const SNAPSHOT={"followers": "61597"};
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const number=n=>Number.isFinite(Number(n))?Number(n).toLocaleString('he-IL'):'-';
let toastTimer;function toast(t){$('#toast').textContent=t;$('#toast').hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').hidden=true,3000)}
const menu=$('.menu-toggle');function closeMenu(){ $('#nav').classList.remove('open');menu.setAttribute('aria-expanded','false');menu.setAttribute('aria-label','פתיחת תפריט') }
menu.addEventListener('click',()=>{const open=$('#nav').classList.toggle('open');menu.setAttribute('aria-expanded',String(open));menu.setAttribute('aria-label',open?'סגירת תפריט':'פתיחת תפריט')});$$('#nav a').forEach(a=>a.addEventListener('click',closeMenu));document.addEventListener('keydown',e=>{if(e.key==='Escape')closeMenu()});document.addEventListener('click',e=>{if(!e.target.closest('header'))closeMenu()});
if('IntersectionObserver' in window){const observer=new IntersectionObserver(entries=>{for(const entry of entries)if(entry.isIntersecting){$$('#nav a').forEach(a=>a.classList.toggle('active',a.hash==='#'+entry.target.id))}},{rootMargin:'-15% 0px -60% 0px'});$$('section[id]').forEach(s=>observer.observe(s))}
const videoWindow=$('#video-window'),track=$('#video-track'),videoStatus=$('#video-status');
let videoList=[],videoLayoutWidth=0;
const pad2=n=>String(n).padStart(2,'0');
const VIDEO_CACHE='odedsvr-youtube-v2';
function readVideoCache(){try{const c=JSON.parse(localStorage.getItem(VIDEO_CACHE));if(c&&Array.isArray(c.videos)&&c.videos.length&&Date.now()-c.time<CONFIG.videoCacheMinutes*60000)return c.videos}catch{}return null}
function writeVideoCache(videos){try{localStorage.setItem(VIDEO_CACHE,JSON.stringify({time:Date.now(),videos}))}catch{}}
function cleanVideos(data){return (Array.isArray(data?.videos)?data.videos:[]).filter(v=>v&&/^[\w-]{11}$/.test(v.id||'')&&typeof v.title==='string').slice(0,CONFIG.videoCount)}
/* Latest uploads: live list from /api/videos, then the bundled snapshot as a fallback. */
async function fetchVideos(){
  const cached=readVideoCache();if(cached)return cached;
  try{const live=cleanVideos(await getJSON(CONFIG.videoAPI));if(live.length){writeVideoCache(live);return live}}catch{}
  const snap=cleanVideos(await getJSON(CONFIG.videoSnapshot));
  if(!snap.length)throw Error('No videos');
  return snap;
}
const relTime=new Intl.RelativeTimeFormat('he',{numeric:'auto'});
function ago(iso){const d=new Date(iso);if(Number.isNaN(d.getTime()))return '';const s=(d-Date.now())/1000;
  for(const [u,n] of [['year',31536000],['month',2592000],['week',604800],['day',86400],['hour',3600],['minute',60]])if(Math.abs(s)>=n)return relTime.format(Math.round(s/n),u);
  return 'עכשיו'}
function videoCard(v,duplicate){
  const a=document.createElement('a');a.className='video-card';a.href='https://www.youtube.com/watch?v='+v.id;a.target='_blank';a.rel='noopener noreferrer';
  if(duplicate){a.setAttribute('aria-hidden','true');a.tabIndex=-1}
  const thumb=document.createElement('div');thumb.className='thumb';
  const img=document.createElement('img');img.src='https://i.ytimg.com/vi/'+v.id+'/hqdefault.jpg';img.alt='';img.decoding='async';img.loading='lazy';img.width=480;img.height=360;thumb.append(img);
  if(Number(v.views)>0){const d=document.createElement('span');d.className='duration';d.textContent=number(v.views)+' צפיות';thumb.append(d)}
  const h=document.createElement('h3');h.textContent=v.title;
  const c=document.createElement('small');c.textContent=[ago(v.published),'ODEDSVR LIVE ↗'].filter(Boolean).join(' · ');
  a.append(thumb,h,c);return a;
}
/* Two identical halves scroll by -50%. Each half repeats the list until it is wider than the window, so the loop never shows a gap. */
function renderVideos(videos){
  videoList=videos;videoLayoutWidth=innerWidth;
  videoWindow.hidden=false;videoStatus.hidden=true;
  const first=document.createElement('div');first.className='video-group';first.append(...videos.map(v=>videoCard(v,false)));
  track.replaceChildren(first);
  for(let reps=1;first.scrollWidth<videoWindow.clientWidth&&reps<8;reps++)first.append(...videos.map(v=>videoCard(v,true)));
  const copy=first.cloneNode(true);copy.setAttribute('aria-hidden','true');copy.querySelectorAll('a').forEach(a=>a.tabIndex=-1);track.append(copy);
  track.style.animationDuration=Math.max(24,Math.round(first.scrollWidth/36))+'s';
  videoWindow.setAttribute('aria-busy','false');
}
function videosFailed(err){
  console.warn('YouTube videos unavailable:',err&&err.message||err);
  videoWindow.hidden=true;videoStatus.hidden=false;
  const msg=document.createElement('span');msg.textContent='לא הצלחנו לטעון את הסרטונים כרגע.';
  const link=document.createElement('a');link.href='https://www.youtube.com/@OdedSVRLive/videos';link.target='_blank';link.rel='noopener noreferrer';link.textContent='לכל הסרטונים ב־YouTube ↗';
  videoStatus.replaceChildren(msg,link);
}
async function refreshVideos(){try{renderVideos(await fetchVideos())}catch(err){videosFailed(err)}}
let videoResize;addEventListener('resize',()=>{clearTimeout(videoResize);videoResize=setTimeout(()=>{if(videoList.length&&Math.abs(innerWidth-videoLayoutWidth)>40)renderVideos(videoList)},250)});

function filterEmotes(){const term=$('#emote-search').value.trim().toLowerCase();let count=0;$$('.emote').forEach(el=>{const show=el.dataset.name.toLowerCase().includes(term);el.hidden=!show;if(show)count++});$('#emotes-empty').hidden=count>0}
$('#emote-search').addEventListener('input',filterEmotes);
async function copyEmote(name){try{if(!navigator.clipboard)throw Error();await navigator.clipboard.writeText(name);toast('שם האימוט הועתק: '+name)}catch{toast('שם האימוט: '+name)}}$('#emotes').addEventListener('click',e=>{const card=e.target.closest('.emote');if(card)copyEmote(card.dataset.name)});
/* ---- Last stream + gifted-subs leaderboard, straight from Kick's public channel endpoints ---- */
const KICK_VIDEOS=CONFIG.channelAPI+'/videos',KICK_BOARDS=CONFIG.channelAPI+'/leaderboards';
const kickTime=s=>{const d=new Date(String(s||'').replace(' ','T')+'Z');return Number.isNaN(d.getTime())?null:d};
function streamLength(ms){const m=Math.round((Number(ms)||0)/60000);if(!m)return '-';const h=Math.floor(m/60),r=m%60;return h?`${h}:${pad2(r)}`:`${r} דק׳`}
function kickImage(url){try{const u=new URL(url);return u.protocol==='https:'&&/(^|\.)kick\.com$/.test(u.hostname)?u.href:null}catch{return null}}
async function refreshLastStream(){
  const box=$('#last-stream');
  try{
    const list=await getJSON(KICK_VIDEOS);
    if(!Array.isArray(list))throw Error();
    const v=list.find(x=>x&&x.is_live===false&&x.channel_id===CONFIG.channelId);
    if(!v)throw Error('none');
    const start=kickTime(v.start_time||v.created_at);
    const uuid=v.video?.uuid,link=/^[0-9a-f-]{36}$/i.test(uuid||'')?`https://kick.com/${CONFIG.channel}/videos/${uuid}`:CONFIG.kick;
    $('#ls-title').textContent=v.session_title||'השידור האחרון';
    $('#ls-duration').textContent=streamLength(v.duration);
    $('#ls-views').textContent=number(v.views);
    $('#ls-date').textContent=start?start.toLocaleDateString('he-IL',{day:'numeric',month:'short'}):'-';
    $('#ls-when').textContent=start?start.toLocaleDateString('he-IL',{weekday:'long',day:'numeric',month:'long'}):'';
    $('#ls-cta').href=link;$('#ls-thumb').href=link;
    const img=$('#ls-img'),src=kickImage(v.thumbnail?.src);
    if(src){img.src=src;img.alt='תמונה מתוך השידור: '+(v.session_title||'');img.hidden=false}
    $('#ls-badge').textContent=streamLength(v.duration);$('#ls-badge').hidden=!v.duration;
    box.setAttribute('aria-busy','false');box.classList.remove('is-loading');
  }catch{
    $('#ls-title').textContent='לא הצלחנו לטעון את השידור האחרון כרגע. כל השידורים החוזרים נמצאים בערוץ.';
    box.setAttribute('aria-busy','false');box.classList.remove('is-loading');
  }
}
const BOARD={week:{key:'gifts_week',label:'השבוע'},month:{key:'gifts_month',label:'החודש'},all:{key:'gifts',label:'מאז ומעולם'}};
let boardPeriod='week',boardData=null,boardTime=null;
function renderBoard(){
  const cfg=BOARD[boardPeriod],list=$('#lb-list'),empty=$('#lb-empty'),text=$('#lb-empty-text');
  $('#lb-caption').textContent='מנויים שחולקו במתנה · '+cfg.label;
  if(!boardData){list.replaceChildren();empty.hidden=false;return}
  const rows=(Array.isArray(boardData[cfg.key])?boardData[cfg.key]:[]).filter(r=>r&&typeof r.username==='string'&&Number(r.quantity)>0).slice(0,10);
  if(!rows.length){list.replaceChildren();empty.hidden=false;text.textContent='עוד אין מתנות '+cfg.label+'. אולי אתם הראשונים?';return}
  empty.hidden=true;
  const top=Number(rows[0].quantity)||1,frag=document.createDocumentFragment();
  rows.forEach((r,i)=>{
    const li=document.createElement('li');li.className='lb-row'+(i<3?' top top-'+(i+1):'');
    const rank=document.createElement('span');rank.className='lb-rank';rank.textContent=String(i+1);
    const name=document.createElement(/^[\w.-]{2,30}$/.test(r.username)?'a':'span');name.className='lb-name';name.dir='ltr';name.textContent=r.username;
    if(name.tagName==='A'){name.href='https://kick.com/'+encodeURIComponent(r.username);name.target='_blank';name.rel='noopener noreferrer'}
    const qty=document.createElement('span');qty.className='lb-qty';if(Number(r.quantity)===1){qty.textContent='מנוי אחד'}else{const b=document.createElement('b');b.textContent=number(r.quantity);qty.append(b,' מנויים')}
    const bar=document.createElement('span');bar.className='lb-bar';bar.setAttribute('aria-hidden','true');bar.style.inlineSize=Math.max(4,Math.round(Number(r.quantity)/top*100))+'%';
    li.append(rank,name,qty,bar);frag.append(li)});
  list.replaceChildren(frag);
}
async function refreshLeaderboard(){
  const panel=$('#leaderboard');
  try{
    const data=await getJSON(KICK_BOARDS);
    if(!data||typeof data!=='object')throw Error();
    boardData=data;boardTime=new Date();
    $('#lb-time').textContent='עודכן מ־Kick ב־'+boardTime.toLocaleTimeString('he-IL',{hour:'2-digit',minute:'2-digit'});
  }catch{
    if(!boardData)$('#lb-empty-text').textContent='לוח המובילים לא זמין כרגע. אפשר לראות אותו ישירות בערוץ.';
  }finally{panel.setAttribute('aria-busy','false');renderBoard()}
}
$$('[data-period]').forEach(b=>b.addEventListener('click',()=>{boardPeriod=b.dataset.period;$$('[data-period]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));renderBoard()}));
const dialog=$('#info-dialog');$$('[data-dialog]').forEach(b=>b.addEventListener('click',()=>dialog.showModal()));$('.dialog-close').addEventListener('click',()=>dialog.close());dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close()}});
async function getJSON(url){const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),9000);try{const r=await fetch(url,{signal:controller.signal,credentials:'omit',cache:'no-store',headers:{Accept:'application/json'}});if(!r.ok)throw Error('Unavailable');return await r.json()}finally{clearTimeout(timer)}}
function unknownState(){ $('#hero-status').textContent='מצב הלייב לא זמין';$('#hero-status').parentElement.classList.remove('is-live');$('#live-word').textContent='KICK';$('#live-title').textContent='מצב הלייב אינו זמין כאן כרגע. אפשר לבדוק ישירות בערוץ.';$('#viewers').textContent='-';$('#followers').textContent=number(SNAPSHOT.followers);$('#data-time').textContent='עוקבים: עותק מ־'+CONFIG.snapshotDate+' · עדכון חי לא זמין'; }
function channelState(data){if(data.slug?.toLowerCase()!==CONFIG.channel||data.id!==CONFIG.channelId)throw Error('Wrong channel');const live=data.livestream?.is_live===true;$('#hero-status').textContent=live?'בלייב עכשיו':'כרגע אופליין';$('#hero-status').parentElement.classList.toggle('is-live',live);$('#live-word').textContent=live?'LIVE ↗':'OFFLINE';$('#live-title').textContent=live?data.livestream.session_title:'הלייב הבא בדרך. עוקבים ב־Kick ונפגשים שם.';$('#viewers').textContent=live?number(data.livestream.viewer_count):'-';$('#followers').textContent=number(data.followers_count);$('#data-time').textContent='עודכן מ־Kick ב־'+new Date().toLocaleTimeString('he-IL',{hour:'2-digit',minute:'2-digit'});if(Array.isArray(data.subscriber_badges))updateBadges(data.subscriber_badges)}
function safeImage(url){try{const u=new URL(url);return u.protocol==='https:'&&u.hostname==='files.kick.com'?u.href:null}catch{return null}}
function updateBadges(badges){const existing=new Map($$('#badges .badge').map(el=>[el.dataset.months,el]));const frag=document.createDocumentFragment();for(const b of badges){if(b.channel_id!==CONFIG.channelId)continue;const old=existing.get(String(b.months));if(old){frag.append(old);continue}const src=safeImage(b.badge_image?.src);if(!src)continue;const d=document.createElement('div');d.className='badge';d.dataset.months=b.months;const img=document.createElement('img');img.src=src;img.alt='תג מנוי '+b.months+' חודשים';img.loading='lazy';const span=document.createElement('span');span.textContent=String(b.months);d.append(img,span);frag.append(d)}if(frag.childNodes.length)$('#badges').replaceChildren(frag)}
async function refreshEmotes(){try{const groups=await getJSON(CONFIG.emoteAPI);if(!Array.isArray(groups))throw Error();const group=groups.find(x=>x.slug?.toLowerCase()===CONFIG.channel&&x.id===CONFIG.channelId);if(!group||!Array.isArray(group.emotes))throw Error();const old=new Map($$('.emote').map(el=>[Number(el.dataset.id),el]));const frag=document.createDocumentFragment();for(const e of group.emotes){if(e.channel_id!==CONFIG.channelId||!Number.isInteger(e.id))continue;let el=old.get(e.id);if(!el){el=document.createElement('button');el.type='button';el.className='emote';el.dataset.id=e.id;const im=document.createElement('img');im.src='https://files.kick.com/emotes/'+e.id+'/fullsize';im.alt=e.name;im.loading='lazy';const title=document.createElement('span');title.textContent=e.name.replace(/^odedsvr/i,'');el.append(im,title)}el.dataset.name=e.name;el.dataset.sub=String(e.subscribers_only);el.setAttribute('aria-label','העתקת '+e.name);frag.append(el)}if(frag.childNodes.length){$('#emotes').replaceChildren(frag);$('.emote-head h3 span').textContent='/ '+group.emotes.length;filterEmotes();$('#assets-time').textContent='האימוטים עודכנו מ־Kick · '+new Date().toLocaleString('he-IL')+' · התגים מתעדכנים עם נתוני הערוץ'}}catch{/* Retain the verified embedded channel assets and the dated label. */}}
let refreshing=false;async function refreshChannel(){if(refreshing)return;refreshing=true;try{channelState(await getJSON(CONFIG.channelAPI))}catch{unknownState()}finally{refreshing=false}}
unknownState();refreshChannel();refreshEmotes();refreshVideos();refreshLastStream();refreshLeaderboard();setInterval(()=>{if(!document.hidden)refreshChannel()},60000);setInterval(()=>{if(!document.hidden){refreshLastStream();refreshLeaderboard()}},300000);setInterval(()=>{if(!document.hidden)refreshVideos()},900000);document.addEventListener('visibilitychange',()=>{if(!document.hidden)refreshChannel()});

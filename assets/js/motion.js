/* Scroll reveal: .reveal elements fade up once when they enter the viewport. Skipped for reduced motion. */
(()=>{
  const root=document.documentElement;
  if(!('IntersectionObserver' in window)||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  root.classList.add('js');
  const items=[...document.querySelectorAll('.reveal')];
  // stagger siblings that enter together
  const groups=new Map();
  for(const el of items){const p=el.parentElement;const n=groups.get(p)||0;el.style.setProperty('--i',String(Math.min(n,5)));groups.set(p,n+1)}
  const io=new IntersectionObserver(entries=>{for(const e of entries)if(e.isIntersecting){e.target.classList.add('is-in');io.unobserve(e.target)}},{rootMargin:'0px 0px -8% 0px',threshold:.08});
  items.forEach(el=>io.observe(el));
  // safety: never leave content hidden (print, anchor jumps, a11y "stop animations")
  const reveal=()=>items.forEach(el=>el.classList.add('is-in'));
  addEventListener('beforeprint',reveal);
  setTimeout(()=>{for(const el of items){const r=el.getBoundingClientRect();if(r.top<innerHeight&&r.bottom>0)el.classList.add('is-in')}},1200);
  new MutationObserver(()=>{if(root.classList.contains('a11y-stop'))reveal()}).observe(root,{attributes:true,attributeFilter:['class']});
})();

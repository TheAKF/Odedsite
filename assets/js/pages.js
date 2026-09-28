'use strict';
// Shared behaviour for privacy / terms / accessibility / 404.
const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];

// Mobile menu (same markup and classes as the home page header)
const menu = $('.menu-toggle'), nav = $('#nav');
if (menu && nav) {
  const close = () => { nav.classList.remove('open'); menu.setAttribute('aria-expanded', 'false'); menu.setAttribute('aria-label', 'פתיחת תפריט'); };
  menu.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    menu.setAttribute('aria-expanded', String(open));
    menu.setAttribute('aria-label', open ? 'סגירת תפריט' : 'פתיחת תפריט');
  });
  $$('#nav a').forEach(a => a.addEventListener('click', close));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
  document.addEventListener('click', e => { if (!e.target.closest('header')) close(); });
}

// Table of contents: mark the section currently in view
const tocLinks = $$('.toc a');
if (tocLinks.length && 'IntersectionObserver' in window) {
  const byId = new Map(tocLinks.map(a => [a.hash.slice(1), a]));
  const io = new IntersectionObserver(entries => {
    for (const e of entries) if (e.isIntersecting) {
      tocLinks.forEach(a => a.removeAttribute('aria-current'));
      byId.get(e.target.id)?.setAttribute('aria-current', 'true');
    }
  }, { rootMargin: '-20% 0px -65% 0px' });
  $$('.legal-section[id]').forEach(s => io.observe(s));
}

// Footer easter egg, same as the home page
const sleep = $('#sleep'), sleepText = $('#sleep-text');
if (sleep && sleepText) {
  let wake = 0;
  sleep.addEventListener('click', () => {
    wake++;
    sleepText.textContent = wake % 2 ? 'מי העיר אותי? טוב, עוד סיבוב אחד.' : 'אם אני לא בלייב, כנראה שאני טוען אנרגיה לגל הבא.';
  });
}

import { svgIcon } from './icons.js';
import { categoryByKey } from './categories.js';

export const $ = (selector, root = document) => root.querySelector(selector);

export function escapeHtml(text) {
  return String(text).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
}

const TOAST_MS = 3200;
const MAX_TOASTS = 4;

/** Top-left notification, like "Location discovered". */
export function toast(title, sub = '') {
  const container = $('#toasts');
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = title;
  if (sub) {
    const s = document.createElement('span');
    s.className = 'toast__sub';
    s.textContent = sub;
    el.append(s);
  }
  container.append(el);
  while (container.children.length > MAX_TOASTS) container.firstElementChild.remove();
  setTimeout(() => {
    el.classList.add('is-leaving');
    el.addEventListener('animationend', () => el.remove(), { once: true });
  }, TOAST_MS);
}

/** Full-screen message for states the app cannot recover from (missing key etc.). */
export function showBlocker(title, html) {
  const el = $('#blocker');
  $('.blocker__title', el).textContent = title;
  $('.blocker__text', el).innerHTML = html;
  el.classList.remove('is-hidden');
}

/** Skyrim-style yes/no prompt. Resolves true on E/Enter/Yes, false on Esc/No. */
export function confirmModal(text) {
  const el = $('#modal');
  const yes = $('[data-action="modal-yes"]', el);
  const no = $('[data-action="modal-no"]', el);
  $('.modal__text', el).textContent = text;
  el.classList.remove('is-hidden');

  return new Promise((resolve) => {
    const done = (answer) => {
      el.classList.add('is-hidden');
      yes.removeEventListener('click', onYes);
      no.removeEventListener('click', onNo);
      document.removeEventListener('keydown', onKey, true);
      resolve(answer);
    };
    const onYes = () => done(true);
    const onNo = () => done(false);
    const onKey = (e) => {
      const key = e.key.toLowerCase();
      if (key !== 'e' && key !== 'enter' && key !== 'escape') return;
      e.preventDefault();
      e.stopPropagation(); // keep the app's own shortcuts out of it
      done(key !== 'escape');
    };
    yes.addEventListener('click', onYes);
    no.addEventListener('click', onNo);
    document.addEventListener('keydown', onKey, true);
  });
}

export function stars(rating) {
  const full = Math.max(0, Math.min(5, Math.round(rating)));
  return '★'.repeat(full) + '☆'.repeat(5 - full);
}

/** Renders place records as a Skyrim-style list. */
export function renderPlaceList(ul, records, { activeId, emptyText, subtitle, isFav, onClick, onHover }) {
  ul.replaceChildren();
  if (!records.length) {
    const li = document.createElement('li');
    li.className = 'empty';
    li.textContent = emptyText;
    ul.append(li);
    return;
  }
  for (const r of records) {
    const li = document.createElement('li');
    li.dataset.id = r.id;
    li.classList.toggle('is-active', r.id === activeId);
    li.classList.toggle('is-fav', isFav(r));
    li.innerHTML = '<div class="name"></div><div class="meta"></div>';
    li.firstElementChild.textContent = r.name;
    li.lastElementChild.textContent = subtitle(r);
    li.addEventListener('click', () => onClick(r));
    li.addEventListener('mouseenter', () => onHover(r, true));
    li.addEventListener('mouseleave', () => onHover(r, false));
    ul.append(li);
  }
}

/** Renders the category menu once; use setCategoryState() for highlight changes. */
export function renderCategories(ul, categories, { onClick }) {
  ul.replaceChildren();
  for (const c of categories) {
    const li = document.createElement('li');
    li.dataset.key = c.key;
    li.innerHTML = `<span class="label"></span>${svgIcon(c.icon)}`;
    li.firstElementChild.textContent = c.label;
    li.addEventListener('click', () => onClick(c));
    ul.append(li);
  }
}

export function setCategoryState(ul, { activeKey, loadingKey }) {
  for (const li of ul.children) {
    li.classList.toggle('is-active', li.dataset.key === activeKey);
    li.classList.toggle('is-loading', li.dataset.key === loadingKey);
  }
}

/** Fills (or hides) the selected-place card. */
export function renderDetail(el, record, { distanceText, isFav }) {
  if (!record) {
    el.classList.add('is-hidden');
    return;
  }
  const cat = categoryByKey(record.category);
  $('.detail__icon', el).innerHTML = svgIcon(cat.icon);
  $('.detail__name', el).textContent = record.name;
  $('.detail__sub', el).textContent = [cat.label, distanceText, isFav ? 'Discovered' : ''].filter(Boolean).join('  ·  ');
  $('.detail__address', el).textContent = record.address;

  const ratingEl = $('.detail__rating', el);
  ratingEl.replaceChildren();
  if (record.rating) {
    const s = document.createElement('span');
    s.className = 'stars';
    s.textContent = stars(record.rating);
    ratingEl.append(s, ` ${record.rating.toFixed(1)} (${record.ratingCount ?? 0})`);
  }
  el.classList.remove('is-hidden');
}

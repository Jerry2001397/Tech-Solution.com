function getSavedNews() {
  try {
    const raw = localStorage.getItem('news_items');
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
  } catch (e) { /* ignore */ }
  return null;
}

function saveNews(items) {
  try { localStorage.setItem('news_items', JSON.stringify(items)); } catch (e) { console.warn('Could not save news', e); }
}

function getNewsItems() {
  const persisted = getSavedNews();
  if (persisted) return persisted;
  return window.NEWS_ITEMS || [];
}

function renderTicker(maxItems = 5) {
  const container = document.getElementById('newsTicker');
  if (!container) return;

  const inner = document.createElement('div');
  inner.className = 'ticker-inner';

  const items = getNewsItems().slice(0, maxItems);
  items.forEach(item => {
    const a = document.createElement('a');
    a.href = 'News.html#' + encodeURIComponent(item.id);
    a.className = 'ticker-item';
    a.innerText = item.title + ' — ' + item.date;
    inner.appendChild(a);
    const sep = document.createElement('span');
    sep.className = 'ticker-sep';
    sep.innerText = ' • ';
    inner.appendChild(sep);
  });

  inner.appendChild(inner.cloneNode(true));
  container.appendChild(inner);
}

function renderNewsList() {
  const list = document.getElementById('newsList');
  if (!list) return;
  list.innerHTML = '';
  getNewsItems().forEach(item => {
    const article = document.createElement('article');
    article.id = item.id;
    article.className = 'news-article';

    const h2 = document.createElement('h2');
    h2.innerText = item.title;
    article.appendChild(h2);

    const meta = document.createElement('div');
    meta.className = 'news-meta';
    meta.innerText = item.date;
    article.appendChild(meta);

    // Display image if present
    if (item.image) {
      const img = document.createElement('img');
      img.src = item.image;
      img.alt = item.title;
      img.className = 'news-image';
      article.appendChild(img);
    }

    const content = document.createElement('div');
    content.className = 'news-content';
    content.innerHTML = item.content;
    article.appendChild(content);

    list.appendChild(article);
  });
}

function addNewsItem(item) {
  const items = getNewsItems();
  items.unshift(item);
  saveNews(items);
  // update rendered areas if present
  const ticker = document.getElementById('newsTicker');
  if (ticker) {
    ticker.innerHTML = '';
    renderTicker();
  }
  const list = document.getElementById('newsList');
  if (list) renderNewsList();
}

function deleteNewsItem(itemId) {
  const items = getNewsItems().filter(i => i.id !== itemId);
  saveNews(items);
  const ticker = document.getElementById('newsTicker');
  if (ticker) {
    ticker.innerHTML = '';
    renderTicker();
  }
  const list = document.getElementById('newsList');
  if (list) renderNewsList();
}

document.addEventListener('DOMContentLoaded', function() {
  renderTicker();
  renderNewsList();
});

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

function getShareUrl(itemId) {
  const baseUrl = 'https://jerry2001397.github.io/Tech-Bridge-Liberia-TBL';
  return baseUrl + '/news/' + encodeURIComponent(itemId) + '.html';
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
  const hashId = window.location.hash ? decodeURIComponent(window.location.hash.slice(1)) : '';
  const items = getNewsItems();
  const visibleItems = hashId ? items.filter(item => item.id === hashId) : items;
  const showAllBtn = document.getElementById('showAllNews');
  if (showAllBtn) {
    showAllBtn.style.display = hashId ? 'inline-flex' : 'none';
  }
  const adminSection = document.getElementById('newsAdmin');
  if (adminSection) {
    if (hashId) {
      adminSection.classList.add('single-view-hidden');
      adminSection.classList.remove('gate-visible', 'unlocked');
    } else {
      adminSection.classList.remove('single-view-hidden');
      if (!adminSection.classList.contains('gate-visible') && !adminSection.classList.contains('unlocked')) {
        if (typeof createAdminGate === 'function') {
          createAdminGate();
        }
      }
    }
  }
  visibleItems.forEach(item => {
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

    const actions = document.createElement('div');
    actions.className = 'news-actions';

    const link = document.createElement('button');
    link.type = 'button';
    link.className = 'news-link';
    link.innerText = 'Copy link';
    link.style.cursor = 'pointer';
    link.addEventListener('click', function() {
      const url = getShareUrl(item.id);
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(function() {
          const originalText = link.innerText;
          link.innerText = 'Copied!';
          setTimeout(function() { link.innerText = originalText; }, 1200);
        });
      } else {
        const temp = document.createElement('input');
        temp.value = url;
        document.body.appendChild(temp);
        temp.select();
        document.execCommand('copy');
        document.body.removeChild(temp);
        link.innerText = 'Copied!';
        setTimeout(function() { link.innerText = 'Copy link'; }, 1200);
      }
    });
    actions.appendChild(link);

    const copyBtn = document.createElement('button');
    copyBtn.type = 'button';
    copyBtn.className = 'copy-link-btn';
    copyBtn.innerText = 'Share';
    copyBtn.addEventListener('click', function() {
      const url = getShareUrl(item.id);
      const shareData = {
        title: item.title,
        text: item.title + ' — ' + item.date,
        url: url
      };

      if (navigator.share) {
        navigator.share(shareData).catch(function() {
          // Fall back to copy if share is cancelled or fails
          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(url).then(function() {
              copyBtn.innerText = 'Copied!';
              setTimeout(function() { copyBtn.innerText = 'Share'; }, 1200);
            });
          }
        });
        return;
      }

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(function() {
          copyBtn.innerText = 'Copied!';
          setTimeout(function() { copyBtn.innerText = 'Share'; }, 1200);
        });
      } else {
        const temp = document.createElement('input');
        temp.value = url;
        document.body.appendChild(temp);
        temp.select();
        document.execCommand('copy');
        document.body.removeChild(temp);
        copyBtn.innerText = 'Copied!';
        setTimeout(function() { copyBtn.innerText = 'Share'; }, 1200);
      }
    });
    actions.appendChild(copyBtn);
    article.appendChild(actions);

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

  const showAllBtn = document.getElementById('showAllNews');
  if (showAllBtn) {
    showAllBtn.addEventListener('click', function(e) {
      e.preventDefault();
      if (window.location.hash) {
        history.replaceState(null, document.title, window.location.pathname);
      }
      renderNewsList();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
});

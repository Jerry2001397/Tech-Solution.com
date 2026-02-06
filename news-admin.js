// Simple admin gate: change `ADMIN_PASSWORD` to your preferred passphrase.
let ADMIN_PASSWORD = 'Emma@5';

function buildAdminForm(container) {
  const wrapper = document.createElement('div');
  wrapper.className = 'admin-wrapper';

  // Close button
  const closeBtn = document.createElement('button');
  closeBtn.type = 'button';
  closeBtn.className = 'admin-close-btn';
  closeBtn.innerHTML = '&times;';
  closeBtn.title = 'Close admin panel';
  closeBtn.setAttribute('aria-label', 'Close admin panel');
  closeBtn.tabIndex = 0;
  closeBtn.addEventListener('click', function() {
    sessionStorage.removeItem('news_admin_unlocked');
    container.classList.remove('unlocked');
    container.classList.add('gate-visible');
    container.innerHTML = '';
    createAdminGate();
  });

  // Keyboard support: Enter, Space or Escape when focused
  closeBtn.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar' || e.key === 'Escape') {
      e.preventDefault();
      closeBtn.click();
    }
  });
  wrapper.appendChild(closeBtn);

  // Add News Form
  const formSection = document.createElement('div');
  const formTitle = document.createElement('h3');
  formTitle.innerText = 'Add New Article';
  formSection.appendChild(formTitle);

  const form = document.createElement('form');
  form.id = 'newsAdminForm';

  const titleLabel = document.createElement('label'); titleLabel.innerText = 'Title';
  const title = document.createElement('input'); title.type = 'text'; title.required = true; title.name = 'title';

  const dateLabel = document.createElement('label'); dateLabel.innerText = 'Date';
  const date = document.createElement('input'); date.type = 'date'; date.name = 'date'; date.required = true;

  const contentLabel = document.createElement('label'); contentLabel.innerText = 'Content (HTML allowed)';
  const content = document.createElement('textarea'); content.name = 'content'; content.rows = 4; content.required = true;

  const imageLabel = document.createElement('label'); imageLabel.innerText = 'Article Image (Optional)';
  const image = document.createElement('input'); image.type = 'file'; image.name = 'image'; image.accept = 'image/*';

  const submit = document.createElement('button'); submit.type = 'submit'; submit.innerText = 'Add News';

  form.appendChild(titleLabel); form.appendChild(title);
  form.appendChild(dateLabel); form.appendChild(date);
  form.appendChild(contentLabel); form.appendChild(content);
  form.appendChild(imageLabel); form.appendChild(image);
  form.appendChild(submit);

  form.addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Handle image if selected
    if (image.files && image.files[0]) {
      const fileReader = new FileReader();
      fileReader.onload = function(event) {
        const item = {
          id: 'news-' + Date.now(),
          title: title.value.trim(),
          date: date.value || new Date().toISOString().slice(0,10),
          content: content.value.trim(),
          image: event.target.result
        };
        if (!item.title || !item.content) return;
        addNewsItem(item);
        form.reset();
        alert('News item added and saved locally.');
      };
      fileReader.readAsDataURL(image.files[0]);
    } else {
      const item = {
        id: 'news-' + Date.now(),
        title: title.value.trim(),
        date: date.value || new Date().toISOString().slice(0,10),
        content: content.value.trim()
      };
      if (!item.title || !item.content) return;
      addNewsItem(item);
      form.reset();
      alert('News item added and saved locally.');
    }
  });

  formSection.appendChild(form);
  wrapper.appendChild(formSection);

  // Manage News Items
  const manageSection = document.createElement('div');
  const manageTitle = document.createElement('h3');
  manageTitle.innerText = 'Manage Articles';
  manageSection.appendChild(manageTitle);

  const itemsList = document.createElement('div');
  itemsList.id = 'adminItemsList';
  itemsList.className = 'admin-items-list';
  getNewsItems().forEach(item => {
    const itemDiv = document.createElement('div');
    itemDiv.className = 'admin-item';
    itemDiv.id = 'admin-' + item.id;
    const itemTitle = document.createElement('strong');
    itemTitle.innerText = item.title;
    const deleteBtn = document.createElement('button');
    deleteBtn.type = 'button';
    deleteBtn.innerText = 'Delete';
    deleteBtn.addEventListener('click', function(){
      if (confirm('Delete "' + item.title + '"?')) {
        deleteNewsItem(item.id);
        itemDiv.remove();
        alert('Article deleted.');
      }
    });
    itemDiv.appendChild(itemTitle);
    itemDiv.appendChild(deleteBtn);
    itemsList.appendChild(itemDiv);
  });
  manageSection.appendChild(itemsList);
  wrapper.appendChild(manageSection);

  container.appendChild(wrapper);
}

function loadAdminPassword() {
  const saved = localStorage.getItem('news_admin_password');
  if (saved) ADMIN_PASSWORD = saved;
}

function createAdminGate() {
  loadAdminPassword();
  const container = document.getElementById('newsAdmin');
  if (!container) return;

  // Clear any existing content
  container.innerHTML = '';
  // Remove all classes first
  container.classList.remove('unlocked', 'gate-visible');

  // If already unlocked in this session, show unlocked state with form
  if (sessionStorage.getItem('news_admin_unlocked') === '1') {
    container.classList.add('unlocked');
    buildAdminForm(container);
    return;
  }

  // Show password gate only
  container.classList.add('gate-visible');
  
  const gateDiv = document.createElement('div');
  gateDiv.className = 'news-admin-gate';

  const info = document.createElement('p');
  info.innerText = 'Enter admin password to manage news.';
  
  const pw = document.createElement('input');
  pw.type = 'password';
  pw.placeholder = 'Password';
  pw.name = 'admin_pw';
  
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.innerText = 'Unlock';

  gateDiv.appendChild(info);
  gateDiv.appendChild(pw);
  gateDiv.appendChild(btn);
  container.appendChild(gateDiv);

  btn.addEventListener('click', function(){
    if (pw.value === ADMIN_PASSWORD) {
      sessionStorage.setItem('news_admin_unlocked', '1');
      container.classList.remove('gate-visible');
      container.classList.add('unlocked');
      container.innerHTML = '';
      buildAdminForm(container);
    } else {
      alert('Incorrect password');
      pw.value = '';
      pw.focus();
    }
  });
  
  // Allow Enter key to submit
  pw.addEventListener('keypress', function(e){
    if (e.key === 'Enter') btn.click();
  });
}

document.addEventListener('DOMContentLoaded', createAdminGate);

// Highlights the nav link that matches the current page
(function(){
  function markActive() {
    const links = document.querySelectorAll('.nav-links a');
    if (!links) return;
    const current = location.pathname.split('/').pop();
    links.forEach(a => {
      const href = a.getAttribute('href').split('/').pop();
      if (!href) return;
      if (href.toLowerCase() === current.toLowerCase()) {
        a.classList.add('active-nav-link');
      }
    });
    // add simple style if not present
    if (!document.getElementById('active-nav-style')){
      const s = document.createElement('style');
      s.id = 'active-nav-style';
      s.innerText = '.nav-links a.active-nav-link{color:#f39c12;font-weight:700;text-decoration:underline;}';
      document.head.appendChild(s);
    }
  }
  document.addEventListener('DOMContentLoaded', markActive);
})();

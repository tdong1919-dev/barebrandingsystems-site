// Bare Branding — site interactions
(function () {
  // Mobile nav toggle
  var btn = document.querySelector('.nav-toggle');
  var body = document.body;
  if (btn) {
    btn.addEventListener('click', function () {
      body.classList.toggle('nav-open');
      btn.setAttribute('aria-expanded', body.classList.contains('nav-open'));
    });
    // Close on link click (mobile)
    document.querySelectorAll('.nav-links a').forEach(function (a) {
      a.addEventListener('click', function () {
        body.classList.remove('nav-open');
        btn.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // Nav dropdown (Ventures)
  document.querySelectorAll('.nav-dropdown').forEach(function (dd) {
    var ddBtn = dd.querySelector('.nav-dropdown-btn');
    if (!ddBtn) return;
    ddBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      var isOpen = dd.classList.contains('open');
      document.querySelectorAll('.nav-dropdown.open').forEach(function (o) { o.classList.remove('open'); o.querySelector('.nav-dropdown-btn').setAttribute('aria-expanded','false'); });
      if (!isOpen) { dd.classList.add('open'); ddBtn.setAttribute('aria-expanded','true'); }
    });
    // Close on panel link click
    dd.querySelectorAll('.nav-dropdown-panel a').forEach(function (a) {
      a.addEventListener('click', function () {
        dd.classList.remove('open');
        ddBtn.setAttribute('aria-expanded','false');
        body.classList.remove('nav-open');
        if (btn) btn.setAttribute('aria-expanded','false');
      });
    });
    // Mark active if current page is a ventures sub-page
    var path = window.location.pathname.replace(/\/$/,'');
    var panel = dd.querySelector('.nav-dropdown-panel');
    if (panel) {
      var matched = Array.from(panel.querySelectorAll('a')).some(function (a) {
        var href = a.getAttribute('href') || '';
        return href && path.endsWith(href.replace(/^\//,'').replace(/\.html$/,'')) || path === '/' + href.replace(/^\//,'');
      });
      if (matched) dd.classList.add('active');
    }
  });
  document.addEventListener('click', function () {
    document.querySelectorAll('.nav-dropdown.open').forEach(function (o) { o.classList.remove('open'); var b = o.querySelector('.nav-dropdown-btn'); if(b) b.setAttribute('aria-expanded','false'); });
  });

  // Sticky header shadow on scroll
  var header = document.querySelector('.site-header');
  function onScroll() {
    if (!header) return;
    if (window.scrollY > 8) header.classList.add('scrolled');
    else header.classList.remove('scrolled');
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Reveal-on-scroll
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    document.querySelectorAll('.reveal').forEach(function (el) { io.observe(el); });
  } else {
    document.querySelectorAll('.reveal').forEach(function (el) { el.classList.add('in'); });
  }

  // Year stamp
  var y = document.querySelectorAll('[data-year]');
  y.forEach(function (n) { n.textContent = new Date().getFullYear(); });

  // Polite contact form (mailto fallback when no backend wired)
  var form = document.querySelector('[data-contact-form]');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var data = new FormData(form);
      var name = encodeURIComponent(data.get('name') || '');
      var email = encodeURIComponent(data.get('email') || '');
      var company = encodeURIComponent(data.get('company') || '');
      var topic = encodeURIComponent(data.get('topic') || 'Inquiry');
      var msg = encodeURIComponent(data.get('message') || '');
      var subject = 'Inquiry — ' + decodeURIComponent(topic) + ' — ' + decodeURIComponent(name);
      var body = 'Name: ' + decodeURIComponent(name) + '\n' +
                 'Email: ' + decodeURIComponent(email) + '\n' +
                 'Company: ' + decodeURIComponent(company) + '\n' +
                 'Topic: ' + decodeURIComponent(topic) + '\n\n' +
                 decodeURIComponent(msg);
      window.location.href = 'mailto:hello@barebrandingsystems.com?subject=' +
        encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
    });
  }
})();

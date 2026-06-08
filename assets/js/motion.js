/* ============================================================
   Bare Branding Systems — Motion System v2
   Restrained · Architectural · Premium
   ============================================================ */
(function () {
  'use strict';

  /* ── Subtle particle canvas ── */
  function initParticles() {
    var canvas = document.createElement('canvas');
    canvas.id = 'particle-canvas';
    Object.assign(canvas.style, {
      position: 'fixed', inset: '0', width: '100%', height: '100%',
      pointerEvents: 'none', zIndex: '0', opacity: '1'
    });
    document.body.prepend(canvas);
    var ctx = canvas.getContext('2d');
    var COUNT = window.innerWidth < 600 ? 16 : 28;
    var P = [];

    function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
    resize();
    window.addEventListener('resize', resize, { passive: true });

    function r(a, b) { return Math.random() * (b - a) + a; }
    for (var i = 0; i < COUNT; i++) {
      P.push({
        x: r(0, canvas.width), y: r(0, canvas.height),
        radius: r(0.3, 1.0),
        vx: r(-0.06, 0.06), vy: r(-0.06, 0.06),
        alpha: r(0.04, 0.14),
        warm: Math.random() > 0.5
      });
    }

    var raf;
    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      var isDark = document.documentElement.getAttribute('data-theme') !== 'light';
      if (!isDark) { raf = requestAnimationFrame(draw); return; }
      P.forEach(function (p) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.warm
          ? 'rgba(142,115,91,' + (p.alpha * 0.5) + ')'
          : 'rgba(85,85,85,' + (p.alpha * 0.35) + ')';
        ctx.fill();
        p.x += p.vx; p.y += p.vy;
        if (p.x < -4) p.x = canvas.width + 4;
        if (p.x > canvas.width + 4) p.x = -4;
        if (p.y < -4) p.y = canvas.height + 4;
        if (p.y > canvas.height + 4) p.y = -4;
      });
      raf = requestAnimationFrame(draw);
    }
    draw();
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) cancelAnimationFrame(raf); else draw();
    });
  }

  /* ── Magnetic hover on CTA buttons ── */
  function initMagnetic() {
    document.querySelectorAll('.btn-gold').forEach(function (btn) {
      btn.addEventListener('mousemove', function (e) {
        var r = btn.getBoundingClientRect();
        var dx = (e.clientX - (r.left + r.width / 2)) * 0.12;
        var dy = (e.clientY - (r.top + r.height / 2)) * 0.12;
        btn.style.transform = 'translate(' + dx + 'px,' + dy + 'px) translateY(-1px)';
      });
      btn.addEventListener('mouseleave', function () { btn.style.transform = ''; });
    });
  }

  /* ── Restrained parallax on hero orbs ── */
  function initParallax() {
    var orbs = document.querySelectorAll('.hero-orb');
    if (!orbs.length) return;
    var ticking = false;
    window.addEventListener('scroll', function () {
      if (ticking) return;
      requestAnimationFrame(function () {
        var y = window.scrollY;
        orbs.forEach(function (o, i) {
          o.style.transform = 'translateY(' + (y * (i % 2 === 0 ? 0.04 : 0.025)) + 'px)';
        });
        ticking = false;
      });
      ticking = true;
    }, { passive: true });
  }

  /* ── Gentle gradient drift on hero orb ── */
  function initGradientFlow() {
    var orb1 = document.querySelector('.hero-orb-1');
    if (!orb1) return;
    var t = 0;
    (function tick() {
      t += 0.002;
      var x = 50 + Math.sin(t) * 6;
      var y = 50 + Math.cos(t * 0.7) * 5;
      var isDark = document.documentElement.getAttribute('data-theme') !== 'light';
      if (isDark) {
        orb1.style.background = 'radial-gradient(circle at ' + x + '% ' + y + '%, rgba(142,115,91,.14) 0%, rgba(107,84,67,.06) 50%, transparent 70%)';
      }
      requestAnimationFrame(tick);
    })();
  }

  /* ── Stagger cards on reveal ── */
  function initStagger() {
    var grids = document.querySelectorAll('.grid-2 .reveal, .grid-3 .reveal, .grid-4 .reveal');
    // Cards inside a grid get staggered delay
    document.querySelectorAll('.grid-2, .grid-3, .grid-4').forEach(function (grid) {
      grid.querySelectorAll('.card, .feature-card, .profile, .person-card').forEach(function (el, i) {
        el.style.transitionDelay = (i * 0.06) + 's';
      });
    });
  }

  /* ── Smooth hover lift on cards ── */
  function initCardHover() {
    document.querySelectorAll('.card, .feature-card').forEach(function (card) {
      card.addEventListener('mouseenter', function () {
        card.style.transform = 'translateY(-2px)';
        card.style.transition = 'transform .3s cubic-bezier(.4,0,.2,1), box-shadow .3s cubic-bezier(.4,0,.2,1), border-color .3s cubic-bezier(.4,0,.2,1)';
        card.style.boxShadow = '0 8px 32px rgba(0,0,0,.4)';
        card.style.borderColor = 'rgba(142,115,91,.2)';
      });
      card.addEventListener('mouseleave', function () {
        card.style.transform = '';
        card.style.boxShadow = '';
        card.style.borderColor = '';
      });
    });
  }

  function boot() {
    initParticles();
    initMagnetic();
    initParallax();
    initGradientFlow();
    initStagger();
    initCardHover();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();

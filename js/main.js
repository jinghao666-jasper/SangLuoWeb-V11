;(function () {
  'use strict';

  /* ══════════════════════════════════════════════════
     AGE GATE
  ══════════════════════════════════════════════════ */
  (function initAgeGate() {
    if (localStorage.getItem('slj_age_ok') === '1') return;

    var gate = document.createElement('div');
    gate.id  = 'ageGate';
    gate.innerHTML = [
      '<div class="ag-wrap">',
      /* ── Left: Brand identity ── */
      '  <div class="ag-brand-panel">',
      '    <div class="ag-seal"><span class="ag-seal-char">桑</span></div>',
      '    <div class="ag-cn-name">桑落酒</div>',
      '    <div class="ag-en-name">SANG LUO JIU &nbsp;·&nbsp; YONGJI SHANXI</div>',
      '    <div class="ag-brand-divider"></div>',
      '    <div class="ag-company-name">Yongji Sangluowang Distillery Co., Ltd.<br>永济桑落王酒业有限公司</div>',
      '  </div>',
      /* ── Right: Simple age confirmation ── */
      '  <div class="ag-form-panel">',
      '    <p class="ag-maori">Kia ora &nbsp;·&nbsp; Nau mai, haere mai</p>',
      '    <h2 class="ag-title">AGE VERIFICATION</h2>',
      '    <div class="ag-divider"></div>',
      '    <p class="ag-desc">This website contains information about alcoholic beverages.',
      '      In New Zealand you must be 18 years or older to purchase or consume alcohol.</p>',
      '    <p class="ag-question">Are you 18 years of age or older?</p>',
      '    <div class="ag-btns">',
      '      <button id="agOk" class="ag-btn-primary">Yes, I am 18 or older &nbsp;—&nbsp; Enter</button>',
      '      <button id="agNo" class="ag-btn-ghost">No, I am under 18</button>',
      '    </div>',
      '    <p class="ag-note">Ngā mihi &nbsp;·&nbsp; By entering you agree to our Terms of Use and Privacy Policy.</p>',
      '  </div>',
      '</div>'
    ].join('');
    document.body.appendChild(gate);
    document.body.style.overflow = 'hidden';

    document.getElementById('agOk').addEventListener('click', function () {
      localStorage.setItem('slj_age_ok', '1');
      gate.style.opacity = '0'; gate.style.pointerEvents = 'none';
      setTimeout(function () { gate.remove(); document.body.style.overflow = ''; }, 600);
    });
    document.getElementById('agNo').addEventListener('click', function () {
      gate.innerHTML = [
        '<div class="ag-box ag-denied">',
        '  <div class="ag-logo-icon" style="margin:0 auto 18px">桑</div>',
        '  <h2 class="ag-title" style="font-size:1.4rem">Sorry — you must be 18 or older to enter.</h2>',
        '  <p class="ag-desc" style="margin-top:12px">Please come back when you reach the legal drinking age.</p>',
        '  <p class="ag-maori" style="margin-top:24px">Ngā mihi · With warm regards</p>',
        '</div>'
      ].join('');
    });
  })();

  /* ══════════════════════════════════════════════════
     NAVIGATION
  ══════════════════════════════════════════════════ */
  var nav       = document.querySelector('.site-nav');
  var navToggle = document.querySelector('.nav-toggle');
  var navMenu   = document.querySelector('.nav-menu');

  function updateNav(onCover) {
    if (!nav) return;
    nav.classList.toggle('on-cover', onCover);
    nav.classList.toggle('on-inner', !onCover);
  }

  if (navToggle && navMenu) {
    navToggle.addEventListener('click', function () {
      navToggle.classList.toggle('open');
      navMenu.classList.toggle('open');
      document.body.style.overflow = navMenu.classList.contains('open') ? 'hidden' : '';
    });
    document.addEventListener('click', function (e) {
      if (nav && !nav.contains(e.target) && navMenu.classList.contains('open')) {
        navToggle.classList.remove('open');
        navMenu.classList.remove('open');
        document.body.style.overflow = '';
      }
    });
    document.querySelectorAll('.nav-item.has-dropdown').forEach(function (item) {
      var link = item.querySelector('.nav-link');
      link && link.addEventListener('click', function (e) {
        if (window.innerWidth <= 768) { e.preventDefault(); item.classList.toggle('open'); }
      });
    });
  }

  /* ══════════════════════════════════════════════════
     FULL-PAGE SCROLL ENGINE (homepage only)
  ══════════════════════════════════════════════════ */
  var cont     = document.getElementById('fpCont');
  var sections = cont ? Array.from(cont.querySelectorAll('.fp-section')) : [];

  /* Swap sections at index 2 and 3: Enterprise Overview (s-about) before Service Centre (s-service) */
  if (cont && sections.length >= 4) {
    cont.insertBefore(sections[3], sections[2]);
    sections = Array.from(cont.querySelectorAll('.fp-section'));
  }

  var total    = sections.length;
  var current  = 0;
  var busy     = false;
  var touchSY  = 0;

  /* Full-page hijack scroll is desktop-only. On phones/tablets we fall back to
     normal native scrolling so no content gets clipped and the page feels right. */
  var fpEnabled = cont && window.innerWidth > 900;

  if (cont && !fpEnabled) {
    /* ── MOBILE: native scroll, reveal content on scroll ── */
    document.body.classList.add('fp-native');
    if ('IntersectionObserver' in window) {
      var fio = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.querySelectorAll('[data-anim]').forEach(function (el, j) {
              el.style.transitionDelay = (j * 0.08) + 's';
              el.classList.add('anim-in');
            });
            fio.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12 });
      sections.forEach(function (sec) { fio.observe(sec); });
    } else {
      document.querySelectorAll('[data-anim]').forEach(function (el) { el.classList.add('anim-in'); });
    }
  }

  if (total > 0 && fpEnabled) {
    /* Build dot navigation */
    var dotsWrap = document.querySelector('.fp-dots');
    if (dotsWrap) {
      for (var i = 0; i < total; i++) {
        var d = document.createElement('span');
        d.className = 'fp-dot';
        d.dataset.idx = i;
        dotsWrap.appendChild(d);
      }
      dotsWrap.addEventListener('click', function (e) {
        if (e.target.classList.contains('fp-dot')) {
          goTo(parseInt(e.target.dataset.idx, 10));
        }
      });
    }

    goTo(0, true);

    /* Wheel — passive:true so renderer is never blocked */
    var lastWheel = 0;
    window.addEventListener('wheel', function (e) {
      var now = Date.now();
      if (busy || now - lastWheel < 900) return;
      lastWheel = now;
      if (e.deltaY > 0) goTo(current + 1);
      else goTo(current - 1);
    }, { passive: true });

    /* Touch */
    window.addEventListener('touchstart', function (e) {
      touchSY = e.touches[0].clientY;
    }, { passive: true });
    window.addEventListener('touchend', function (e) {
      var dy = touchSY - e.changedTouches[0].clientY;
      if (Math.abs(dy) > 48) { if (dy > 0) goTo(current + 1); else goTo(current - 1); }
    }, { passive: true });

    /* Keys */
    window.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown' || e.key === 'PageDown') { e.preventDefault(); goTo(current + 1); }
      if (e.key === 'ArrowUp'   || e.key === 'PageUp')   { e.preventDefault(); goTo(current - 1); }
    });
  }

  function goTo(idx, instant) {
    if (idx < 0 || idx >= total) return;
    if (busy && !instant) return;
    busy = true;
    current = idx;

    /* Slide container */
    cont.style.transition = instant ? 'none' : 'transform .9s cubic-bezier(.77,0,.175,1)';
    cont.style.transform  = 'translateY(-' + (idx * 100) + 'vh)';

    /* Update nav colour */
    updateNav(idx === 0);

    /* Dots */
    document.querySelectorAll('.fp-dot').forEach(function (d, i) {
      d.classList.toggle('active', i === idx);
    });

    /* Counter */
    var counter = document.querySelector('.fp-counter');
    if (counter) counter.textContent = pad(idx + 1) + '/' + pad(total);

    /* Sidebar slots */
    document.querySelectorAll('.fp-sidebar-slot').forEach(function (s, i) {
      s.classList.toggle('visible', i === idx);
    });

    /* PPT content animations */
    /* First: reset all sections except target */
    sections.forEach(function (sec, i) {
      if (i !== idx) {
        sec.querySelectorAll('[data-anim]').forEach(function (el) {
          el.classList.remove('anim-in');
          el.style.transitionDelay = '0s';
        });
      }
    });

    /* Then animate target section */
    var delay = instant ? 0 : 150;
    setTimeout(function () {
      var sec = sections[idx];
      sec.querySelectorAll('[data-anim]').forEach(function (el, j) {
        el.style.transitionDelay = (j * 0.1) + 's';
        el.classList.add('anim-in');
      });
    }, delay);

    setTimeout(function () { busy = false; }, instant ? 0 : 1000);
  }

  function pad(n) { return n < 10 ? '0' + n : '' + n; }

  /* ══════════════════════════════════════════════════
     SUB-PAGE SCROLL ANIMATIONS (products/service/about)
  ══════════════════════════════════════════════════ */
  if (document.body.classList.contains('subpage')) {
    updateNav(false);

    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var sec = entry.target;
            sec.querySelectorAll('[data-anim]').forEach(function (el, j) {
              el.style.transitionDelay = (j * 0.1) + 's';
              el.classList.add('anim-in');
            });
            io.unobserve(sec);
          }
        });
      }, { threshold: 0.12 });

      document.querySelectorAll('.sp-section').forEach(function (sec) {
        io.observe(sec);
      });
    } else {
      document.querySelectorAll('[data-anim]').forEach(function (el) { el.classList.add('anim-in'); });
    }
  }

  /* ══════════════════════════════════════════════════
     HERO VIDEO — intro-only loop (stops at LIMIT_SEC)
  ══════════════════════════════════════════════════ */
  var LIMIT_SEC = 6;
  var heroVid = document.querySelector('.cover-video');
  if (heroVid) {
    heroVid.addEventListener('timeupdate', function () {
      if (heroVid.currentTime >= LIMIT_SEC) heroVid.currentTime = 0;
    });

    /* Mobile / in-app browsers (WeChat, QQ…) often block muted autoplay.
       Try to play immediately, retry when ready, and — as a last resort —
       start playback on the user's first touch/click anywhere on the page. */
    heroVid.muted = true;
    function kickPlay() {
      var p = heroVid.play();
      if (p && typeof p.catch === 'function') { p.catch(function () {}); }
    }
    kickPlay();
    heroVid.addEventListener('canplay', kickPlay, { once: true });
    heroVid.addEventListener('loadeddata', kickPlay, { once: true });

    var started = false;
    function startOnce() {
      if (started) return;
      started = true;
      kickPlay();
    }
    ['touchstart', 'click', 'scroll'].forEach(function (ev) {
      document.addEventListener(ev, startOnce, { once: true, passive: true });
    });
    /* WeChat's webview fires this when its JS bridge is ready */
    document.addEventListener('WeixinJSBridgeReady', kickPlay, false);

    /* Parallax only when on cover section */
    window.addEventListener('scroll', function () {}, { passive: true });
  }

  /* ══════════════════════════════════════════════════
     COUNTER ANIMATION
  ══════════════════════════════════════════════════ */
  function animCount(el) {
    var target = parseInt(el.dataset.target, 10) || 0;
    var dur = 1800, t0 = performance.now();
    (function tick(now) {
      var t = Math.min((now - t0) / dur, 1);
      el.textContent = Math.round(target * (1 - Math.pow(1 - t, 3)));
      if (t < 1) requestAnimationFrame(tick);
      else el.textContent = target;
    })(t0);
  }
  var counters = document.querySelectorAll('.counter');
  if (counters.length && 'IntersectionObserver' in window) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting && !entry.target.dataset.counted) {
          entry.target.dataset.counted = '1';
          animCount(entry.target);
          cio.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    counters.forEach(function (c) { cio.observe(c); });
  }

  /* ══════════════════════════════════════════════════
     VIDEO MODAL
  ══════════════════════════════════════════════════ */
  var vmodal  = document.getElementById('vmodal');
  var mvideo  = document.getElementById('modalVideo');
  var mclose  = document.querySelector('.vmodal-close');

  function openModal(src) {
    if (!vmodal || !mvideo) return;
    mvideo.src = src;
    vmodal.classList.add('active');
    document.body.style.overflow = 'hidden';
    setTimeout(function () { mvideo.play().catch(function () {}); }, 350);
  }
  function closeModal() {
    if (!vmodal || !mvideo) return;
    vmodal.classList.remove('active');
    mvideo.pause();
    document.body.style.overflow = '';
    setTimeout(function () { mvideo.src = ''; }, 420);
  }
  document.querySelectorAll('[data-video]').forEach(function (t) {
    t.addEventListener('click', function () { openModal(t.dataset.video); });
  });
  if (mclose) mclose.addEventListener('click', closeModal);
  if (vmodal) {
    vmodal.addEventListener('click', function (e) { if (e.target === vmodal) closeModal(); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && vmodal.classList.contains('active')) closeModal();
    });
  }

  /* ══════════════════════════════════════════════════
     CONTACT FORM
  ══════════════════════════════════════════════════ */
  var form    = document.getElementById('contactForm');
  var formMsg = document.getElementById('formMsg');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var btn = form.querySelector('.btn-submit');
      var old = btn.textContent;
      btn.textContent = 'Sending…';
      btn.disabled = true;
      var data = {};
      new FormData(form).forEach(function (v, k) { data[k] = v; });
      fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      .then(function (r) { return r.json(); })
      .then(function (res) {
        if (formMsg) {
          formMsg.textContent = res.success
            ? "Message received — we'll be in touch shortly!"
            : (res.message || 'Submission failed, please try again.');
          formMsg.className    = 'form-message ' + (res.success ? 'success' : 'error');
          formMsg.style.display = 'block';
        }
        if (res.success) form.reset();
      })
      .catch(function () {
        if (formMsg) {
          formMsg.textContent = 'Network error — please try again.';
          formMsg.className   = 'form-message error';
          formMsg.style.display = 'block';
        }
      })
      .finally(function () {
        btn.textContent = old; btn.disabled = false;
        setTimeout(function () { if (formMsg) formMsg.style.display = 'none'; }, 6000);
      });
    });
  }

  /* ══════════════════════════════════════════════════
     ABOUT TABS (sub-page)
  ══════════════════════════════════════════════════ */
  document.querySelectorAll('.sp-tab').forEach(function (tab) {
    tab.addEventListener('click', function () {
      var group = tab.closest('[data-tab-group]');
      if (!group) return;
      group.querySelectorAll('.sp-tab').forEach(function (t) { t.classList.remove('active'); });
      group.querySelectorAll('.tab-panel').forEach(function (p) { p.style.display = 'none'; });
      tab.classList.add('active');
      var panel = group.querySelector('[data-panel="' + tab.dataset.tab + '"]');
      if (panel) panel.style.display = '';
    });
  });

  /* About section tabs on homepage */
  document.querySelectorAll('.fp-tab').forEach(function (tab) {
    tab.addEventListener('click', function () {
      var parent = tab.closest('.fp-sidebar-slot');
      if (!parent) return;
      parent.querySelectorAll('.fp-tab').forEach(function (t) { t.classList.remove('active'); });
      tab.classList.add('active');
      var sec = document.querySelector('.s-about');
      if (!sec) return;
      var panels = sec.querySelectorAll('.about-tab-panel');
      panels.forEach(function (p) { p.style.display = 'none'; });
      var target = sec.querySelector('[data-panel="' + tab.dataset.tab + '"]');
      if (target) target.style.display = '';
    });
  });

  /* Product filter tabs (sub-page) */
  document.querySelectorAll('.sp-tab[data-filter]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      document.querySelectorAll('.sp-tab[data-filter]').forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      var f = btn.dataset.filter;
      document.querySelectorAll('.sp-prod-card[data-cat]').forEach(function (c) {
        c.style.display = (f === 'all' || c.dataset.cat === f) ? '' : 'none';
      });
    });
  });

})();

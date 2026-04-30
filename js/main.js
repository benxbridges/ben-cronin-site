/* =========================================
   Ben Cronin — Interactions
   ========================================= */

document.addEventListener('DOMContentLoaded', () => {

  // ---- Reveal Observer ----
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  function observeReveals(scope = document) {
    scope.querySelectorAll('.reveal:not(.revealed)').forEach(el => revealObserver.observe(el));
  }
  observeReveals();

  // ---- Page Switcher (nav-driven) ----
  const pages = document.querySelectorAll('.page');
  const allNavLinks = document.querySelectorAll('[data-page]');

  function showPage(pageId) {
    pages.forEach(p => {
      p.classList.toggle('active', p.dataset.page === pageId);
    });
    document.querySelectorAll('.topnav-link').forEach(link => {
      link.classList.toggle('active', link.dataset.page === pageId);
    });
    // Re-trigger reveals on the now-visible page
    requestAnimationFrame(() => {
      const active = document.querySelector('.page.active');
      if (active) {
        // Reset reveals so they animate in fresh each time
        active.querySelectorAll('.reveal').forEach(el => el.classList.remove('revealed'));
        observeReveals(active);
      }
    });
    window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
  }

  function pageFromHash() {
    const h = window.location.hash.replace('#', '');
    const valid = Array.from(pages).map(p => p.dataset.page);
    return valid.includes(h) ? h : 'about';
  }

  showPage(pageFromHash());

  allNavLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const target = link.dataset.page;
      if (!target) return;
      e.preventDefault();
      window.location.hash = target;
      showPage(target);
      closeMobileMenu();
    });
  });

  window.addEventListener('hashchange', () => showPage(pageFromHash()));

  // ---- Mobile Hamburger Menu ----
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobile-menu');

  function closeMobileMenu() {
    if (!hamburger || !mobileMenu) return;
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    mobileMenu.classList.remove('open');
    document.body.style.overflow = '';
  }

  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      const isOpen = hamburger.classList.toggle('open');
      hamburger.setAttribute('aria-expanded', isOpen);
      mobileMenu.classList.toggle('open');
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });
  }

  // ---- Cover Tile → Info Tray ----
  document.querySelectorAll('.cover-tile').forEach(tile => {
    tile.addEventListener('click', () => {
      const projectId = tile.dataset.project;
      if (projectId) openTray(projectId, tile);
    });
  });

  // ---- Custom Cursor ----
  const hasFineCursor = window.matchMedia('(pointer: fine)').matches;
  const cursor = document.querySelector('.cursor-dot');

  if (hasFineCursor && cursor) {
    let curX = 0, curY = 0, targetX = 0, targetY = 0;
    document.addEventListener('mousemove', (e) => { targetX = e.clientX; targetY = e.clientY; });
    function updateCursor() {
      curX += (targetX - curX) * 0.15;
      curY += (targetY - curY) * 0.15;
      cursor.style.left = curX + 'px';
      cursor.style.top = curY + 'px';
      requestAnimationFrame(updateCursor);
    }
    updateCursor();

    const interactives = document.querySelectorAll('a, button, .cover-tile');
    interactives.forEach(el => {
      el.addEventListener('mouseenter', () => cursor.classList.add('hover'));
      el.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
    });
  } else if (cursor) {
    cursor.style.display = 'none';
  }

  // ---- Scribble Canvas (Pen Cursor Drawing) ----
  const scribbleCanvas = document.getElementById('scribble-canvas');

  if (hasFineCursor && scribbleCanvas) {
    const ctx = scribbleCanvas.getContext('2d');
    let strokes = [];
    let lastX = null, lastY = null;
    const FADE_DURATION = 3000;

    function resizeCanvas() {
      scribbleCanvas.width = window.innerWidth;
      scribbleCanvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    let overInteractive = false;
    function bindInteractives() {
      document.querySelectorAll('a, button, .cover-tile, .info-tray').forEach(el => {
        if (el.dataset.scribbleBound) return;
        el.dataset.scribbleBound = '1';
        el.addEventListener('mouseenter', () => { overInteractive = true; });
        el.addEventListener('mouseleave', () => { overInteractive = false; });
      });
    }
    bindInteractives();

    document.addEventListener('mousemove', (e) => {
      if (overInteractive) { lastX = null; lastY = null; return; }
      const x = e.clientX, y = e.clientY;
      if (lastX !== null) {
        strokes.push({ x1: lastX, y1: lastY, x2: x, y2: y, time: performance.now() });
      }
      lastX = x; lastY = y;
    });
    document.addEventListener('mouseleave', () => { lastX = null; lastY = null; });

    function drawScribbles() {
      const now = performance.now();
      ctx.clearRect(0, 0, scribbleCanvas.width, scribbleCanvas.height);
      strokes = strokes.filter(s => now - s.time < FADE_DURATION);
      strokes.forEach(s => {
        const age = now - s.time;
        const alpha = 1 - (age / FADE_DURATION);
        ctx.beginPath();
        ctx.moveTo(s.x1, s.y1);
        ctx.lineTo(s.x2, s.y2);
        ctx.strokeStyle = `rgba(224, 168, 46, ${alpha * 0.6})`; // warm gold
        ctx.lineWidth = 2.25;
        ctx.lineCap = 'round';
        ctx.stroke();
      });
      requestAnimationFrame(drawScribbles);
    }
    drawScribbles();
  }

  // ---- Info Tray Data ----
  const projectData = {
    gilliganmoss: {
      title: 'Gilligan Moss',
      desc: 'One half of Gilligan Moss — an electronic duo on Foreign Family Collective / Ninja Tune with 100M+ streams. Known for inventive production and remixes for Glass Animals, ODESZA, Sébastien Tellier, and Yoke Lore. Toured with ODESZA and Sylvan Esso, played Coachella.',
      subs: [
        { label: 'Self-Titled (2021)', href: 'https://gilliganmoss.bandcamp.com/album/gilligan-moss' },
        { label: 'Speaking Across Time (2024)', href: 'https://gilliganmoss.bandcamp.com/album/speaking-across-time' },
        { label: 'A La Mode EP (2025)', href: 'https://gilliganmoss.bandcamp.com/album/a-la-mode' },
        { label: 'Ceremonial EP (2018)', href: 'https://gilliganmoss.bandcamp.com/album/ceremonial' }
      ],
      credits: [
        { label: 'Orly Anan', role: 'Art Direction', href: 'https://www.orlyanan.com/dos/' },
        { label: 'Nejc Prah', role: 'Art Direction', href: 'https://www.nejcprah.com/projects/gilligan-moss/' }
      ],
      links: [
        { label: 'Bandcamp', href: 'https://gilliganmoss.bandcamp.com/music' },
        { label: 'Spotify', href: 'https://open.spotify.com/artist/2fo0F81pRzdXjmWP6MkQqB' },
        { label: 'Instagram', href: 'https://www.instagram.com/gilliganmoss/' }
      ]
    },
    speaking: {
      title: 'Speaking Across Time',
      desc: 'The second Gilligan Moss LP (2024) — released on Foreign Family Collective.',
      subs: [],
      links: [
        { label: 'Bandcamp', href: 'https://gilliganmoss.bandcamp.com/album/speaking-across-time' }
      ]
    },
    alamode: {
      title: 'A La Mode',
      desc: 'The 2025 Gilligan Moss EP.',
      subs: [],
      links: [
        { label: 'Bandcamp', href: 'https://gilliganmoss.bandcamp.com/album/a-la-mode' }
      ]
    },
    ceremonial: {
      title: 'Ceremonial',
      desc: 'The 2018 Gilligan Moss debut EP.',
      subs: [],
      links: [
        { label: 'Bandcamp', href: 'https://gilliganmoss.bandcamp.com/album/ceremonial' }
      ]
    },
    bmo: {
      title: "Adventure Time: BMO's Mixtape",
      desc: "Gilligan Moss wrote and produced an album of original songs for BMO, the beloved character from Cartoon Network's Adventure Time. Bridging electronic production with the show's playful, emotional world.",
      subs: [
        { label: 'Variety', href: 'https://variety.com/2020/music/news/adventure-time-mixtape-gilligan-moss-1234775811/' },
        { label: 'Paste Magazine', href: 'https://www.pastemagazine.com/music/adventure-time/adventure-time-bmos-mixtape' }
      ],
      links: [
        { label: 'Spotify', href: 'https://open.spotify.com/album/1h2gxTbV9HF01Ci9IaXGJt' }
      ]
    },
    rain1: {
      title: 'Will You Bring The Rain? Pt. 1',
      desc: 'Yellow Shoots EP — first installment of a three-part series. Production by Ben.',
      subs: [],
      links: [
        { label: 'Yellow Shoots', href: 'https://yellowshootsmusic.bandcamp.com/' }
      ]
    },
    rain2: {
      title: 'Will You Bring The Rain? Pt. 2',
      desc: 'Second installment in the Yellow Shoots EP series — recorded straight to tape, exploring identity and vulnerability. Production by Ben.',
      subs: [],
      links: [
        { label: 'Yellow Shoots', href: 'https://yellowshootsmusic.bandcamp.com/' }
      ]
    },
    production: {
      title: 'Production & Songwriting',
      desc: 'Outside of Gilligan Moss, I write and produce for a range of artists across indie pop, electronic, and alternative. Work ranges from full production to co-writing and mixing.',
      subs: [],
      links: [],
      essay: `<div class="tray-essay"><h5>Production Credits</h5><ul class="tray-credits-list"><li>Chloe French — <em>forthcoming</em></li><li>Pollena — <em>forthcoming</em></li><li>Yellow Shoots</li><li>Love Language</li></ul></div>`
    },
    recipeindex: {
      title: 'Recipe Index',
      desc: 'A tool to make cooking and following recipes easier. Built from scratch with a focus on readability, a step-by-step cook mode that keeps your screen awake, and zero ads.',
      subs: [
        { label: 'Cook Mode' },
        { label: 'Typography system' },
        { label: 'Zero-ad design' }
      ],
      links: [
        { label: 'recipeindex.org', href: 'https://www.recipeindex.org' }
      ]
    },
    twosongs: {
      title: 'Two Songs',
      desc: 'A music newsletter I wrote for several years. Each issue featured two songs — one familiar and one new — with context about why they mattered, how they were made, or what they meant to me. Part music criticism, part personal essay.',
      subs: [],
      links: []
    },
    scaperadio: {
      title: 'scape.radio',
      desc: 'A generative music project that produces 10,000 unique, continuous pieces of ambient and electronic music. Built with algorithmic composition tools — the system creates evolving soundscapes that never repeat.',
      subs: [
        { label: 'Algorithmic composition' },
        { label: '10,000 unique pieces' }
      ],
      links: [
        { label: 'scape.radio', href: 'https://scape.radio' }
      ]
    }
  };

  // ---- Info Tray Open/Close ----
  const infoTray = document.getElementById('info-tray');
  const infoTrayInner = document.getElementById('info-tray-inner');

  function openTray(projectId, tile) {
    const data = projectData[projectId];
    if (!data || !infoTray) return;

    const imgEl = tile.querySelector('.cover-art img');
    const tileSub = tile.querySelector('.cover-sub')?.textContent || '';

    let previewHTML = '<div class="tray-card-preview">';
    if (imgEl && imgEl.src) {
      previewHTML += `<img src="${imgEl.src}" alt="${imgEl.alt || ''}">`;
    } else {
      previewHTML += `<div class="tray-card-gradient" style="background:linear-gradient(135deg,var(--bg-deep),#D6C5EC);aspect-ratio:1/1;display:flex;align-items:center;justify-content:center;color:var(--violet);font-family:var(--font-display);font-weight:800;">${data.title}</div>`;
    }
    previewHTML += `<div class="tray-card-info"><div class="tray-card-title">${data.title}</div><div class="tray-card-desc">${tileSub}</div></div></div>`;

    const sheetHeaderHTML = `<div class="sheet-header">
      <div class="sheet-handle"></div>
      <button class="sheet-close" aria-label="Close">&times;</button>
    </div>`;

    let infoHTML = `<div class="tray-header"><h3 class="tray-title">${data.title}</h3><p class="tray-desc">${data.desc}</p></div>`;

    if (data.subs && data.subs.length) {
      infoHTML += '<div class="tray-subs">';
      data.subs.forEach(s => {
        if (s.href) infoHTML += `<a href="${s.href}" target="_blank" rel="noopener" class="tray-sub">${s.label} &rarr;</a>`;
        else infoHTML += `<span class="tray-sub">${s.label}</span>`;
      });
      infoHTML += '</div>';
    }

    if (data.credits && data.credits.length) {
      infoHTML += '<div class="tray-credits"><span class="tray-credits-label">Credits</span>';
      data.credits.forEach(c => {
        if (c.href) infoHTML += `<a href="${c.href}" target="_blank" rel="noopener" class="tray-credit">${c.role}: ${c.label} &rarr;</a>`;
        else infoHTML += `<span class="tray-credit">${c.role}: ${c.label}</span>`;
      });
      infoHTML += '</div>';
    }

    if (data.links && data.links.length) {
      infoHTML += '<div class="tray-links">';
      data.links.forEach(l => {
        infoHTML += `<a href="${l.href}" target="_blank" rel="noopener">${l.label} &rarr;</a>`;
      });
      infoHTML += '</div>';
    }

    if (data.essay) infoHTML += data.essay;

    infoTrayInner.innerHTML = sheetHeaderHTML + previewHTML + `<div class="info-tray-content">${infoHTML}</div>`;

    const closeBtn = document.createElement('button');
    closeBtn.className = 'info-tray-close';
    closeBtn.setAttribute('aria-label', 'Close');
    closeBtn.innerHTML = '&times;';
    closeBtn.addEventListener('click', closeTray);
    infoTrayInner.querySelector('.info-tray-content').appendChild(closeBtn);

    const sheetClose = infoTrayInner.querySelector('.sheet-close');
    if (sheetClose) sheetClose.addEventListener('click', closeTray);

    infoTray.classList.add('open');
    infoTray.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeTray() {
    if (!infoTray) return;
    infoTray.classList.remove('open');
    infoTray.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && infoTray && infoTray.classList.contains('open')) closeTray();
  });

  if (infoTray) {
    let touchStartY = 0;
    infoTray.addEventListener('touchstart', (e) => { touchStartY = e.touches[0].clientY; }, { passive: true });
    infoTray.addEventListener('touchend', (e) => {
      const delta = e.changedTouches[0].clientY - touchStartY;
      if (delta > 80) closeTray();
    }, { passive: true });

    infoTray.addEventListener('click', (e) => {
      if (!infoTrayInner.contains(e.target)) closeTray();
    });
  }

  // ---- Dark Mode Toggle ----
  const darkToggle = document.getElementById('dark-toggle');
  const darkIcon = darkToggle ? darkToggle.querySelector('.dark-toggle-icon') : null;

  if (darkToggle) {
    function syncIcon() {
      if (!darkIcon) return;
      const isLight = document.body.classList.contains('light');
      darkIcon.textContent = isLight ? '☾' : '☀';
    }

    const saved = localStorage.getItem('theme');
    if (saved === 'dark') document.body.classList.remove('light');
    syncIcon();

    darkToggle.addEventListener('click', () => {
      document.body.classList.toggle('light');
      const isLight = document.body.classList.contains('light');
      localStorage.setItem('theme', isLight ? 'light' : 'dark');
      syncIcon();
    });
  }

  // ---- Secret Easter Egg: Draw 3 Circles ----
  if (hasFineCursor) {
    const secretSection = document.getElementById('secret-section');
    const secretClose = secretSection ? secretSection.querySelector('.secret-close') : null;
    let circlesDetected = 0;
    let gesturePoints = [];
    const GESTURE_WINDOW = 2000;
    const MIN_POINTS = 25;
    let secretRevealed = false;

    document.addEventListener('mousemove', (e) => {
      if (secretRevealed) return;
      gesturePoints.push({ x: e.clientX, y: e.clientY, time: performance.now() });
      const now = performance.now();
      gesturePoints = gesturePoints.filter(p => now - p.time < GESTURE_WINDOW);

      if (gesturePoints.length >= MIN_POINTS && gesturePoints.length % 5 === 0) {
        if (detectCircle(gesturePoints)) {
          circlesDetected++;
          gesturePoints = [];
          if (circlesDetected >= 3 && secretSection) {
            secretRevealed = true;
            secretSection.classList.add('revealed');
            secretSection.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden';
          }
        }
      }
    });

    function detectCircle(points) {
      let cx = 0, cy = 0;
      points.forEach(p => { cx += p.x; cy += p.y; });
      cx /= points.length; cy /= points.length;

      let totalR = 0;
      const radii = points.map(p => {
        const r = Math.sqrt((p.x - cx) ** 2 + (p.y - cy) ** 2);
        totalR += r; return r;
      });
      const avgR = totalR / points.length;
      if (avgR < 30) return false;

      let variance = 0;
      radii.forEach(r => { variance += (r - avgR) ** 2; });
      variance = Math.sqrt(variance / points.length);
      const cv = variance / avgR;

      const start = points[0];
      const end = points[points.length - 1];
      const closeDist = Math.sqrt((start.x - end.x) ** 2 + (start.y - end.y) ** 2);
      const closeEnough = closeDist < avgR * 0.8;

      return cv < 0.25 && closeEnough;
    }

    if (secretClose) {
      secretClose.addEventListener('click', () => {
        secretSection.classList.remove('revealed');
        secretSection.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        circlesDetected = 0;
        secretRevealed = false;
      });
    }
  }

});

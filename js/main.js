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
      desc: 'A music newsletter I wrote for several years. Each issue featured a couple songs at the top, plus a longer dispatch of whatever I was listening to that week — part recommendation, part personal essay.',
      subs: [],
      links: [],
      essay: `<div class="tray-essay tray-essay-newsletter">
        <h5>Sample issue · 062 — "He's British and a Lord"</h5>

        <p>Hello friends! I was in Los Angeles last week so forgive the absence of new music in your inboxes. California is a dream… I tried surfing (it's really hard!), enjoyed a couple MDW BBQs and saw a really horrid ska band at Topanga Days, which was fine because Topanga is heaven on earth. Enough about me, here are some tunes! Two at the top, and a bunch more at the bottom. xx, ben.</p>

        <div class="ts-track">
          <h6>Erika de Casier — Do My Thing</h6>
          <span class="ts-source">(Apple Music)</span>
          <p>Moodboard: dark night jelly shoes, butterfly hair clips, 14 year-old Timbaland, XL airbrush t-shirts. The video for this tune is extremely fresh — it's Erika biking around town, doing her thing… this is an absolute TUNE of the highest order. Shout out to Eric Chen for showing it to me. Her whole debut album just dropped, it's called Essentials. Perfect.</p>
        </div>

        <div class="ts-track">
          <h6>Jai Paul — Do You Love Her Now</h6>
          <span class="ts-source">(Apple Music)</span>
          <p>This one drips with night magic. It has every element that makes a great Jai Paul song — weird samples, an extremely tight groove, abrasively loud & strange synths, aggressive use of sidechain compression… I have to start it over at 2:30 every time I listen because i am worried i haven't soaked up every bit of it. It's the A-side of a two single release. The other tune "He" is also a true gem.</p>
        </div>

        <aside class="ts-callout">
          <p><strong>Red alert</strong> — this Jai Paul album link below is probably my most recommended thing I have ever sent. The album was leaked in 2013 but didn't have an official release (meaning it wasn't available to buy or stream) until this past Saturday. He is one of my single greatest musical heroes, so imagine my delight when I read the news on Saturday that he was releasing new music and officially releasing the leaked album. There is a great article on the Fader from a couple years ago to give you a bit of context.</p>
        </aside>

        <div class="ts-track">
          <h6>Album: Jai Paul — Leak 04-13 (Bait Ones)</h6>
          <span class="ts-source">(Apple Music)</span>
          <p>It is hard to overstate the importance of Jai Paul… he is probably the single most influential musician of the last ten years who you have never heard of. I will spare you the gushy details, but he is responsible for so much of the sonic landscape of modern pop, experimental, r&b… you name it, and up until this past Saturday he only had two official songs released to his name. An unfinished collection of his songs were leaked in 2013 without his consent and though it was tragic what happened, the songs were immediately injected into the cultural & musical zeitgeists. They were raw, highly experimental & unique in production style & beyond all of it, extremely well written. It literally (don't use the word lightly!) made me misty-eyed to read his statement on the leak and his subsequent mental health problems. These songs have felt like a great secret stash & though it feels strange to see them released (especially with revisions! major demo-itis), I am happy for the man. I cannot recommend the album in its entirety enough — it is amazing how modern it sounds, six years later. You will be surprised what jewels are in his treasure chest.</p>
        </div>

        <div class="ts-track">
          <h6>Cautious Clay — Sidewinder</h6>
          <span class="ts-source">(Apple Music)</span>
          <p>Cautious Clay is a contender for best artist name of all time. He's also great at writing music — his lyrics are unique feeling but casual & the production is interesting enough to elevate the tunes without overcomplicating them. This one could have easily been blown out, and there are certainly grand moments, but it keeps its cool which i like. Great chord progressions, nice falsetto too :) i found this because he posted it on his instagram.</p>
        </div>

        <div class="ts-track">
          <h6>Mattias Aguayo — Support Alien Invasion (album)</h6>
          <span class="ts-source">(Apple Music)</span>
          <p>If you like drums, i think you will like this record. I read a review on Pitchfork by Phillip Sherbourne (who is one of the few authors i read w some consistency at Pitchfork) which encouraged the listen. I was much more familiar with humor & joy-rich Aguayo (try "Roller-Skate" and "Ay Ay Ay") but this is a straight ahead drum orgy the whole way through. There is a video for a wild polyrhythmic track called "Pikin" which is pretty playful and involves some freaky interpretation of an already strange track. I would recommend this album if you are really into dance music, or if you're in law school and in need of something agro & mindless to draw you into your texts.</p>
        </div>

        <div class="ts-track">
          <h6>Funkadelic — Music 4 My Mother (Underground Resistance Mix)</h6>
          <span class="ts-source">(Apple Music)</span>
          <p>I heard this at work the other night & it reminded me of that Daft Punk tune "Teachers." Drums sound great, it is a jammer. Recommended if you like Detroit.</p>
        </div>

        <div class="ts-track">
          <h6>Shlohmo — Against the Clock</h6>
          <span class="ts-source">(Fact Mag)</span>
          <p>This isn't a song, but if you are a musician or a voyeur who wants to learn a bit more about how the sausage is made, Fact Mag's "Against the Clock" series is a really neat way to do that. It pits musicians against the clock, challenging them to make a song in 10 minutes. It ends up being less about the song they make & more about the process of songwriting for a range of musicians. It is a terrifying prospect but yields neat results & I thought this one with Shlohmo was worth the watch.</p>
        </div>

        <p class="ts-signoff">Thanks for reading, let me know if you like these tunes or what else I should be listening to!</p>
      </div>`
    },
    scaperadio: {
      title: 'scape.radio',
      desc: 'A generative music project that produces 10,000 unique, continuous pieces of ambient and electronic music. Built with algorithmic composition tools — the system creates evolving soundscapes that never repeat.',
      subs: [],
      links: [
        { label: 'scape.radio', href: 'https://scapes.xyz/about/scape-radio' }
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

/* =========================================
   Ben Cronin Portfolio — Interactions
   ========================================= */

document.addEventListener('DOMContentLoaded', () => {

  // ---- Scroll Reveal ----
  const revealElements = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  revealElements.forEach(el => revealObserver.observe(el));

  // ---- Nav Scroll Behavior ----
  const nav = document.getElementById('nav');
  const hero = document.getElementById('hero');
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  const heroObserver = new IntersectionObserver(([entry]) => {
    nav.classList.toggle('scrolled', !entry.isIntersecting);
  }, { threshold: 0.1 });

  heroObserver.observe(hero);

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navLinks.forEach(link => {
          link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
        });
      }
    });
  }, { threshold: 0.3, rootMargin: '-80px 0px -40% 0px' });

  sections.forEach(s => sectionObserver.observe(s));

  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.querySelector(link.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
        closeMobileMenu();
      }
    });
  });

  // ---- Hero Parallax Blobs ----
  const hasFineCursor = window.matchMedia('(pointer: fine)').matches;
  const blobs = document.querySelectorAll('.blob');

  if (hasFineCursor && blobs.length) {
    const factors = [20, 30, 15];
    let mouseX = 0.5, mouseY = 0.5;
    let animating = false;

    hero.addEventListener('mousemove', (e) => {
      const rect = hero.getBoundingClientRect();
      mouseX = (e.clientX - rect.left) / rect.width;
      mouseY = (e.clientY - rect.top) / rect.height;

      if (!animating) {
        animating = true;
        requestAnimationFrame(() => {
          blobs.forEach((blob, i) => {
            const fx = factors[i] || 15;
            const dx = (mouseX - 0.5) * fx;
            const dy = (mouseY - 0.5) * fx;
            blob.style.transform = `translate(${dx}px, ${dy}px)`;
          });
          animating = false;
        });
      }
    });
  }

  // ---- Custom Cursor ----
  const cursor = document.querySelector('.cursor-dot');

  if (hasFineCursor && cursor) {
    let curX = 0, curY = 0;
    let targetX = 0, targetY = 0;

    document.addEventListener('mousemove', (e) => {
      targetX = e.clientX;
      targetY = e.clientY;
    });

    function updateCursor() {
      curX += (targetX - curX) * 0.15;
      curY += (targetY - curY) * 0.15;
      cursor.style.left = curX + 'px';
      cursor.style.top = curY + 'px';
      requestAnimationFrame(updateCursor);
    }
    updateCursor();

    const interactives = document.querySelectorAll('a, button, .filter-pill, .progress-container, .project-card');
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
    let strokes = []; // { x, y, time }
    let lastX = null, lastY = null;
    let isDrawing = false;
    const FADE_DURATION = 3000; // 3 seconds

    function resizeCanvas() {
      scribbleCanvas.width = window.innerWidth;
      scribbleCanvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Track if we're over an interactive element
    let overInteractive = false;
    const interactiveEls = document.querySelectorAll('a, button, .filter-pill, .progress-container, input, .info-tray');
    interactiveEls.forEach(el => {
      el.addEventListener('mouseenter', () => { overInteractive = true; });
      el.addEventListener('mouseleave', () => { overInteractive = false; });
    });

    document.addEventListener('mousemove', (e) => {
      if (overInteractive) {
        lastX = null;
        lastY = null;
        return;
      }

      const x = e.clientX;
      const y = e.clientY;

      if (lastX !== null) {
        strokes.push({ x1: lastX, y1: lastY, x2: x, y2: y, time: performance.now() });
      }

      lastX = x;
      lastY = y;
    });

    // Stop drawing on mouseup/leave
    document.addEventListener('mouseleave', () => { lastX = null; lastY = null; });

    function drawScribbles() {
      const now = performance.now();
      ctx.clearRect(0, 0, scribbleCanvas.width, scribbleCanvas.height);

      // Remove old strokes
      strokes = strokes.filter(s => now - s.time < FADE_DURATION);

      strokes.forEach(s => {
        const age = now - s.time;
        const alpha = 1 - (age / FADE_DURATION);

        ctx.beginPath();
        ctx.moveTo(s.x1, s.y1);
        ctx.lineTo(s.x2, s.y2);
        ctx.strokeStyle = `rgba(255, 87, 51, ${alpha * 0.4})`; // coral with fade
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.stroke();
      });

      requestAnimationFrame(drawScribbles);
    }
    drawScribbles();
  }

  // ---- Info Tray System ----
  const infoTray = document.getElementById('info-tray');
  const infoTrayInner = document.getElementById('info-tray-inner');
  const infoTrayContent = document.getElementById('info-tray-content');
  // infoTrayClose is created dynamically in openTray()

  const projectData = {
    gilliganmoss: {
      title: 'Gilligan Moss',
      desc: 'One half of Gilligan Moss — an electronic duo on Foreign Family Collective / Ninja Tune with 100M+ streams. Known for inventive production and remixes for Glass Animals, ODESZA, S\u00e9bastian Tellier, and Yoke Lore. Toured with ODESZA and Sylvan Esso, played Coachella.',
      subs: [
        { label: 'Ceremonial EP (2018)', href: 'https://gilliganmoss.bandcamp.com/album/ceremonial' },
        { label: 'Self-Titled Album (2021)', href: 'https://gilliganmoss.bandcamp.com/album/gilligan-moss' },
        { label: 'Speaking Across Time (2024)', href: 'https://gilliganmoss.bandcamp.com/album/speaking-across-time' },
        { label: 'A La Mode EP (2025)', href: 'https://gilliganmoss.bandcamp.com/album/a-la-mode' }
      ],
      credits: [
        { label: 'Orly Anan', role: 'Art Direction', href: 'https://www.orlyanan.com/dos/' },
        { label: 'Nejc Prah', role: 'Art Direction', href: 'https://www.nejcprah.com/projects/gilligan-moss/' },
        { label: 'World Service (feat. Betsy)', role: 'Music Video', href: 'https://www.youtube.com/watch?v=3y-dTwiL2AM' },
        { label: 'Slow Down', role: 'Music Video', href: 'https://www.youtube.com/watch?v=knGb5h3ukw0' },
        { label: 'Who Loves You — edited by Ben', role: 'Music Video', href: 'https://www.youtube.com/watch?v=D5eWdXEMDqA' }
      ],
      links: [
        { label: 'Bandcamp', href: 'https://gilliganmoss.bandcamp.com/music' },
        { label: 'Spotify', href: 'https://open.spotify.com/artist/2fo0F81pRzdXjmWP6MkQqB' },
        { label: 'Instagram', href: 'https://www.instagram.com/gilliganmoss/' }
      ]
    },
    bmo: {
      title: 'Adventure Time: BMO\'s Mixtape',
      desc: 'Gilligan Moss wrote and produced an album of original songs for BMO, the beloved character from Cartoon Network\'s Adventure Time. Bridging electronic production with the show\'s playful, emotional world.',
      subs: [
        { label: 'Variety', href: 'https://variety.com/2020/music/news/adventure-time-mixtape-gilligan-moss-1234775811/' },
        { label: 'Paste Magazine', href: 'https://www.pastemagazine.com/music/adventure-time/adventure-time-bmos-mixtape' },
        { label: 'Spotify', href: 'https://open.spotify.com/album/1h2gxTbV9HF01Ci9IaXGJt' }
      ],
      links: []
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
      desc: 'A personal project born out of frustration with recipe websites. Built from scratch with a focus on readability, a step-by-step cook mode that keeps your screen awake, and zero ads. Designed to be the recipe site I actually wanted to use.',
      subs: [
        { label: 'Cook Mode' },
        { label: 'Typography system' },
        { label: 'Zero-ad design' }
      ],
      links: []
    },
    twosongs: {
      title: 'Two Songs',
      desc: 'A music newsletter I wrote for several years. Each issue featured two songs — one familiar and one new — with context about why they mattered, how they were made, or what they meant to me. Part music criticism, part personal essay.',
      subs: [],
      links: [],
      essay: `<div class="tray-essay"><h5>Two Songs 062 — He's British and a Lord</h5><p class="tray-essay-intro">Hello friends! I was in Los Angeles last week so forgive the absence of new music in your inboxes. California is a dream... I tried surfing (it's really hard!), enjoyed a couple MDW BBQs and saw a really horrid ska band at Topanga Days, which was fine because Topanga is heaven on earth. Enough about me, here are some tunes!</p><div class="tray-essay-track"><strong>Erika de Casier — Do My Thing</strong><p>Moodboard: dark night jelly shoes, butterfly hair clips, 14 year-old Timbaland, XL airbrush t-shirts. The video for this tune is extremely fresh. This is an absolute TUNE of the highest order. Her whole debut album just dropped, it's called Essentials. Perfect.</p></div><div class="tray-essay-track"><strong>Jai Paul — Do You Love Her Now</strong><p>This one drips with night magic. It has every element that makes a great Jai Paul song — weird samples, an extremely tight groove, abrasively loud & strange synths, aggressive use of sidechain compression. I have to start it over at 2:30 every time because I'm worried I haven't soaked up every bit of it.</p></div><p class="tray-essay-note">He is probably the single most influential musician of the last ten years who you have never heard of. It literally made me misty-eyed to read his statement on the leak and his subsequent mental health problems. These songs have felt like a great secret stash.</p></div>`
    },
    scaperadio: {
      title: 'scape.radio',
      desc: 'A generative music project that produces 10,000 unique, continuous pieces of ambient and electronic music. Built with algorithmic composition tools — the system creates evolving soundscapes that never repeat. An experiment in letting software compose.',
      subs: [
        { label: 'Algorithmic composition' },
        { label: '10,000 unique pieces' }
      ],
      links: []
    }
  };

  function openTray(projectId, btn) {
    const data = projectData[projectId];
    if (!data || !infoTray) return;

    const card = btn.closest('.project-card');

    // Build left card preview
    const thumbEl = card.querySelector('.card-thumbnail');
    const imgEl = thumbEl ? thumbEl.querySelector('img') : null;
    const gradientStyle = thumbEl ? thumbEl.getAttribute('style') : '';
    const thumbText = thumbEl ? (thumbEl.querySelector('.thumbnail-text')?.textContent || '') : '';
    const cardDesc = card.querySelector('.card-desc')?.textContent || '';

    let previewHTML = '<div class="tray-card-preview">';
    if (imgEl) {
      previewHTML += `<img src="${imgEl.src}" alt="${imgEl.alt || ''}">`;
    } else if (gradientStyle) {
      previewHTML += `<div class="tray-card-gradient" style="${gradientStyle}">${thumbText}</div>`;
    }
    previewHTML += `<div class="tray-card-info"><div class="tray-card-title">${data.title}</div><div class="tray-card-desc">${cardDesc}</div></div></div>`;

    // Build right info panel content
    let infoHTML = `<div class="tray-header"><h3 class="tray-title">${data.title}</h3></div>`;

    if (data.subs.length) {
      infoHTML += '<div class="tray-subs">';
      data.subs.forEach(s => {
        if (s.href) {
          infoHTML += `<a href="${s.href}" target="_blank" rel="noopener" class="tray-sub">${s.label} &rarr;</a>`;
        } else {
          infoHTML += `<span class="tray-sub">${s.label}</span>`;
        }
      });
      infoHTML += '</div>';
    }

    if (data.credits && data.credits.length) {
      infoHTML += '<div class="tray-credits"><span class="tray-credits-label">Credits</span>';
      data.credits.forEach(c => {
        if (c.href) {
          infoHTML += `<a href="${c.href}" target="_blank" rel="noopener" class="tray-credit">${c.role}: ${c.label} &rarr;</a>`;
        } else {
          infoHTML += `<span class="tray-credit">${c.role}: ${c.label}</span>`;
        }
      });
      infoHTML += '</div>';
    }

    if (data.links.length) {
      infoHTML += '<div class="tray-links">';
      data.links.forEach(l => {
        infoHTML += `<a href="${l.href}" target="_blank" rel="noopener">${l.label} &rarr;</a>`;
      });
      infoHTML += '</div>';
    }

    if (data.essay) {
      infoHTML += data.essay;
    }

    // Assemble tray inner: card preview on left, info on right
    infoTrayInner.innerHTML = previewHTML + `<div class="info-tray-content">${infoHTML}</div>`;

    // Re-add close button (it was inside tray-inner which we just replaced)
    const closeBtn = document.createElement('button');
    closeBtn.className = 'info-tray-close';
    closeBtn.setAttribute('aria-label', 'Close');
    closeBtn.innerHTML = '&times;';
    closeBtn.addEventListener('click', closeTray);
    infoTrayInner.appendChild(closeBtn);

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

  document.querySelectorAll('.info-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const projectId = btn.dataset.project;
      openTray(projectId, btn);
    });
  });

  if (infoTray) {
    // Close on backdrop click (outside the inner panel)
    infoTray.addEventListener('click', (e) => {
      if (!infoTrayInner.contains(e.target)) closeTray();
    });
  }

  // ---- Sound-Reactive System ----
  const allCards = document.querySelectorAll('.project-card');
  let audioIsPlaying = false;
  let beatAnimationId = null;

  function startDemoBeat() {
    audioIsPlaying = true;
    allCards.forEach(c => c.classList.add('audio-active'));
    document.body.classList.add('now-playing');

    const bpm = 120;
    const beatInterval = 60000 / bpm;
    let lastBeat = performance.now();

    function animate(now) {
      if (!audioIsPlaying) {
        allCards.forEach(c => {
          c.classList.remove('audio-active');
          c.style.setProperty('--beat', '0');
        });
        return;
      }

      const elapsed = now - lastBeat;
      const progress = elapsed / beatInterval;

      let beat;
      if (progress < 0.1) {
        beat = progress / 0.1;
      } else if (progress < 1) {
        beat = 1 - ((progress - 0.1) / 0.9);
        beat = beat * beat;
      } else {
        beat = 0;
        lastBeat = now;
      }

      allCards.forEach(c => {
        c.style.setProperty('--beat', beat.toFixed(3));
      });

      beatAnimationId = requestAnimationFrame(animate);
    }

    beatAnimationId = requestAnimationFrame(animate);
  }

  function stopDemoBeat() {
    audioIsPlaying = false;
    if (beatAnimationId) {
      cancelAnimationFrame(beatAnimationId);
      beatAnimationId = null;
    }
    allCards.forEach(c => {
      c.classList.remove('audio-active');
      c.style.setProperty('--beat', '0');
    });
    document.body.classList.remove('now-playing');
  }

  // ---- Audio Players ----
  const audioPlayers = document.querySelectorAll('.audio-player');
  let currentAudio = null;
  let currentBtn = null;

  audioPlayers.forEach(player => {
    const playBtn = player.querySelector('.play-btn');
    const progressContainer = player.querySelector('.progress-container');
    const progressBar = player.querySelector('.progress-bar');
    const timeDisplay = player.querySelector('.audio-time');

    const audio = new Audio();
    const src = player.dataset.src;
    if (src) audio.src = src;

    function formatTime(seconds) {
      const mins = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60);
      return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    playBtn.addEventListener('click', () => {
      if (!src) {
        runDemoPlayback(playBtn, progressBar, timeDisplay);
        return;
      }

      if (audio.paused) {
        if (currentAudio && currentAudio !== audio) {
          currentAudio.pause();
          currentBtn.classList.remove('playing');
        }
        audio.play();
        playBtn.classList.add('playing');
        currentAudio = audio;
        currentBtn = playBtn;
        startDemoBeat();
      } else {
        audio.pause();
        playBtn.classList.remove('playing');
        stopDemoBeat();
      }
    });

    audio.addEventListener('timeupdate', () => {
      const pct = (audio.currentTime / audio.duration) * 100;
      progressBar.style.width = pct + '%';
      timeDisplay.textContent = formatTime(audio.currentTime);
    });

    audio.addEventListener('ended', () => {
      playBtn.classList.remove('playing');
      progressBar.style.width = '0%';
      timeDisplay.textContent = '0:00';
      stopDemoBeat();
    });

    progressContainer.addEventListener('click', (e) => {
      if (!src) return;
      const rect = progressContainer.getBoundingClientRect();
      const pct = (e.clientX - rect.left) / rect.width;
      audio.currentTime = pct * audio.duration;
    });
  });

  function runDemoPlayback(btn, bar, timeEl) {
    if (btn.classList.contains('playing')) {
      btn.classList.remove('playing');
      stopDemoBeat();
      return;
    }

    if (currentBtn && currentBtn !== btn) {
      currentBtn.classList.remove('playing');
    }

    btn.classList.add('playing');
    currentBtn = btn;
    startDemoBeat();

    // Sync cassette visual
    if (cassette && !cassette.classList.contains('playing')) {
      cassette.classList.add('playing');
      cassetteIsPlaying = true;
      if (cassettePlay) cassettePlay.innerHTML = '&#9646;&#9646;';
      updateCassetteTrack();
    }

    const duration = 30;
    let elapsed = 0;
    const interval = setInterval(() => {
      if (!btn.classList.contains('playing')) {
        clearInterval(interval);
        if (cassette) {
          cassette.classList.remove('playing');
          cassetteIsPlaying = false;
          if (cassettePlay) cassettePlay.innerHTML = '&#9654;';
          updateCassetteTrack();
        }
        return;
      }
      elapsed += 0.1;
      const pct = (elapsed / duration) * 100;
      bar.style.width = Math.min(pct, 100) + '%';

      const mins = Math.floor(elapsed / 60);
      const secs = Math.floor(elapsed % 60);
      timeEl.textContent = `${mins}:${secs.toString().padStart(2, '0')}`;

      if (elapsed >= duration) {
        clearInterval(interval);
        btn.classList.remove('playing');
        bar.style.width = '0%';
        timeEl.textContent = '0:00';
        stopDemoBeat();
        if (cassette) {
          cassette.classList.remove('playing');
          cassetteIsPlaying = false;
          if (cassettePlay) cassettePlay.innerHTML = '&#9654;';
          updateCassetteTrack();
        }
      }
    }, 100);
  }

  // ---- Cassette Player ----
  const cassette = document.getElementById('cassette');
  const cassettePlay = document.getElementById('cassette-play');
  const cassettePrev = document.getElementById('cassette-prev');
  const cassetteNext = document.getElementById('cassette-next');
  const cassetteTrack = document.getElementById('cassette-track');

  const playlist = [
    'Choreograph — Gilligan Moss',
    'Slow Down — Gilligan Moss',
    'World Service — Gilligan Moss',
    'Speaking Across Time — Gilligan Moss',
    'A La Mode — Gilligan Moss',
    'Do It For Yourself — Gilligan Moss',
    'Robot Love — BMO\'s Mixtape',
    'Who Loves You — Gilligan Moss'
  ];
  let currentTrackIdx = 0;
  let cassetteIsPlaying = false;

  function updateCassetteTrack() {
    if (cassetteTrack) {
      cassetteTrack.textContent = cassetteIsPlaying ? playlist[currentTrackIdx] : 'Click to play';
    }
  }

  const spotifyPanel = document.getElementById('spotify-panel');

  if (cassettePlay) {
    cassettePlay.addEventListener('click', (e) => {
      e.stopPropagation();
      cassetteIsPlaying = !cassetteIsPlaying;
      cassette.classList.toggle('playing', cassetteIsPlaying);
      cassettePlay.innerHTML = cassetteIsPlaying ? '&#9646;&#9646;' : '&#9654;';

      // Toggle Spotify panel
      if (spotifyPanel) {
        spotifyPanel.classList.toggle('open', cassetteIsPlaying);
      }

      if (cassetteIsPlaying) {
        if (cassetteTrack) cassetteTrack.textContent = 'playing from spotify';
        startDemoBeat();
      } else {
        if (cassetteTrack) cassetteTrack.textContent = 'press play';
        stopDemoBeat();
      }
    });
  }

  if (cassettePrev) {
    cassettePrev.addEventListener('click', (e) => {
      e.stopPropagation();
      currentTrackIdx = (currentTrackIdx - 1 + playlist.length) % playlist.length;
      updateCassetteTrack();
    });
  }

  if (cassetteNext) {
    cassetteNext.addEventListener('click', (e) => {
      e.stopPropagation();
      currentTrackIdx = (currentTrackIdx + 1) % playlist.length;
      updateCassetteTrack();
    });
  }

  // Drag the entire player-float (cassette + spotify together)
  const playerFloat = document.getElementById('player-float');
  if (playerFloat && hasFineCursor) {
    let isDragging = false;
    let dragOffsetX = 0, dragOffsetY = 0;

    playerFloat.addEventListener('mousedown', (e) => {
      if (e.target.closest('button') || e.target.closest('iframe')) return;
      isDragging = true;
      const rect = playerFloat.getBoundingClientRect();
      dragOffsetX = e.clientX - rect.left;
      dragOffsetY = e.clientY - rect.top;
      playerFloat.style.transition = 'none';
      e.preventDefault();
    });

    document.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      const x = e.clientX - dragOffsetX;
      const y = e.clientY - dragOffsetY;
      playerFloat.style.left = x + 'px';
      playerFloat.style.top = y + 'px';
      playerFloat.style.right = 'auto';
      playerFloat.style.bottom = 'auto';
    });

    document.addEventListener('mouseup', () => {
      if (isDragging) {
        isDragging = false;
        playerFloat.style.transition = '';
      }
    });
  }

  // ---- Scroll Arrows ----
  const projectsGrid = document.getElementById('projects-grid');
  const scrollLeft = document.getElementById('scroll-left');
  const scrollRight = document.getElementById('scroll-right');

  if (scrollLeft && projectsGrid) {
    scrollLeft.addEventListener('click', () => {
      projectsGrid.scrollBy({ left: -300, behavior: 'smooth' });
    });
  }
  if (scrollRight && projectsGrid) {
    scrollRight.addEventListener('click', () => {
      projectsGrid.scrollBy({ left: 300, behavior: 'smooth' });
    });
  }

  // ---- Video Lazy Load ----
  document.querySelectorAll('.video-play-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const videoUrl = btn.dataset.video;
      if (!videoUrl) return;

      const media = btn.closest('.card-media');
      const thumbnail = media.querySelector('.card-thumbnail');

      const container = document.createElement('div');
      container.className = 'video-container';
      container.innerHTML = `<iframe src="${videoUrl}?autoplay=1" allow="autoplay; encrypted-media" allowfullscreen></iframe>`;

      thumbnail.replaceWith(container);
    });
  });

  // ---- Project Filtering ----
  const filterPills = document.querySelectorAll('.filter-pill');
  const projectCards = document.querySelectorAll('.project-card');

  filterPills.forEach(pill => {
    pill.addEventListener('click', () => {
      filterPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');

      const filter = pill.dataset.filter;

      projectCards.forEach(card => {
        if (filter === 'all' || card.dataset.category === filter) {
          card.classList.remove('hidden');
        } else {
          card.classList.add('hidden');
        }
      });
    });
  });

  // ---- Mobile Hamburger Menu ----
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobile-menu');

  function closeMobileMenu() {
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    mobileMenu.classList.remove('open');
    document.body.style.overflow = '';
  }

  hamburger.addEventListener('click', () => {
    const isOpen = hamburger.classList.toggle('open');
    hamburger.setAttribute('aria-expanded', isOpen);
    mobileMenu.classList.toggle('open');
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  document.querySelectorAll('.mobile-link').forEach(link => {
    link.addEventListener('click', closeMobileMenu);
  });

  // ---- Dark Mode Toggle ----
  const darkToggle = document.getElementById('dark-toggle');
  const darkIcon = darkToggle ? darkToggle.querySelector('.dark-toggle-icon') : null;

  // Default is dark (no .light class)
  if (darkToggle) {
    darkToggle.addEventListener('click', () => {
      document.body.classList.toggle('light');
      const isLight = document.body.classList.contains('light');
      if (darkIcon) darkIcon.textContent = isLight ? '\u2600' : '\u263E'; // sun vs moon
      localStorage.setItem('theme', isLight ? 'light' : 'dark');
    });

    // Restore saved preference
    const saved = localStorage.getItem('theme');
    if (saved === 'light') {
      document.body.classList.add('light');
      if (darkIcon) darkIcon.textContent = '\u2600';
    }
  }

  // ---- Secret Easter Egg: Draw 3 Circles ----
  if (hasFineCursor) {
    const secretSection = document.getElementById('secret-section');
    const secretClose = secretSection ? secretSection.querySelector('.secret-close') : null;
    let circlesDetected = 0;
    let gesturePoints = [];
    let gestureTimeout = null;
    const GESTURE_WINDOW = 2000; // ms to complete a circle gesture
    const MIN_POINTS = 25; // minimum points to form a circle
    let secretRevealed = false;

    // Collect points during mouse movement (reuse the mousemove from scribble)
    document.addEventListener('mousemove', (e) => {
      if (secretRevealed) return;

      gesturePoints.push({ x: e.clientX, y: e.clientY, time: performance.now() });

      // Only keep recent points
      const now = performance.now();
      gesturePoints = gesturePoints.filter(p => now - p.time < GESTURE_WINDOW);

      // Check for circle gesture every 10 points
      if (gesturePoints.length >= MIN_POINTS && gesturePoints.length % 5 === 0) {
        if (detectCircle(gesturePoints)) {
          circlesDetected++;
          gesturePoints = []; // reset for next circle

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
      // Calculate centroid
      let cx = 0, cy = 0;
      points.forEach(p => { cx += p.x; cy += p.y; });
      cx /= points.length;
      cy /= points.length;

      // Calculate average radius and variance
      let totalR = 0;
      const radii = points.map(p => {
        const r = Math.sqrt((p.x - cx) ** 2 + (p.y - cy) ** 2);
        totalR += r;
        return r;
      });
      const avgR = totalR / points.length;

      // Reject if too small (less than 30px radius)
      if (avgR < 30) return false;

      // Check that radii are roughly consistent (low variance = circle)
      let variance = 0;
      radii.forEach(r => { variance += (r - avgR) ** 2; });
      variance = Math.sqrt(variance / points.length);

      // Coefficient of variation should be low for a circle
      const cv = variance / avgR;

      // Also check that the path roughly closes (start near end)
      const start = points[0];
      const end = points[points.length - 1];
      const closeDist = Math.sqrt((start.x - end.x) ** 2 + (start.y - end.y) ** 2);
      const closeEnough = closeDist < avgR * 0.8;

      return cv < 0.25 && closeEnough;
    }

    // Close secret section
    if (secretClose) {
      secretClose.addEventListener('click', () => {
        secretSection.classList.remove('revealed');
        secretSection.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        // Reset so they can trigger it again
        circlesDetected = 0;
        secretRevealed = false;
      });
    }
  }

});

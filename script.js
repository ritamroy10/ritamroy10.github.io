// ============================================================
// RITAM ROY PORTFOLIO v2 — JavaScript
// ============================================================

(function () {
  'use strict';

  /* ──────────────────────────────────────────
     CURSOR GLOW EFFECT
  ────────────────────────────────────────── */
  const cursorGlow = document.getElementById('cursorGlow');
  let mouseX = 0, mouseY = 0, glowX = 0, glowY = 0;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  function animateCursor() {
    glowX += (mouseX - glowX) * 0.07;
    glowY += (mouseY - glowY) * 0.07;
    if (cursorGlow) {
      cursorGlow.style.left = glowX + 'px';
      cursorGlow.style.top = glowY + 'px';
    }
    requestAnimationFrame(animateCursor);
  }
  animateCursor();

  /* ──────────────────────────────────────────
     PARTICLE CANVAS
  ────────────────────────────────────────── */
  const canvas = document.getElementById('particleCanvas');
  const ctx = canvas.getContext('2d');
  let particles = [];
  let animFrame;

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  class Particle {
    constructor() { this.reset(); }
    reset() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.vx = (Math.random() - 0.5) * 0.3;
      this.vy = (Math.random() - 0.5) * 0.3;
      this.radius = Math.random() * 1.5 + 0.3;
      this.alpha = Math.random() * 0.5 + 0.1;
      this.color = Math.random() > 0.6 ? '#00d4ff' : '#7c3aed';
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) {
        this.reset();
      }
    }
    draw() {
      ctx.globalAlpha = this.alpha;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.fill();
    }
  }

  function initParticles(count = 80) {
    particles = Array.from({ length: count }, () => new Particle());
  }

  function drawConnections() {
    const maxDist = 120;
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < maxDist) {
          const alpha = (1 - dist / maxDist) * 0.12;
          ctx.globalAlpha = alpha;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = '#00d4ff';
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
  }

  function renderParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawConnections();
    particles.forEach(p => { p.update(); p.draw(); });
    ctx.globalAlpha = 1;
    animFrame = requestAnimationFrame(renderParticles);
  }

  initParticles();
  renderParticles();

  /* ──────────────────────────────────────────
     NAVBAR SCROLL BEHAVIOR
  ────────────────────────────────────────── */
  const navbar = document.getElementById('navbar');
  const backTop = document.getElementById('backTop');

  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;

    if (scrollY > 60) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    if (scrollY > 400) {
      backTop.classList.add('visible');
    } else {
      backTop.classList.remove('visible');
    }

    // Active nav link
    const sections = document.querySelectorAll('section[id]');
    sections.forEach(section => {
      const rect = section.getBoundingClientRect();
      if (rect.top <= 100 && rect.bottom >= 100) {
        document.querySelectorAll('.nav-link').forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === '#' + section.id) {
            link.classList.add('active');
          }
        });
      }
    });
  });

  /* ──────────────────────────────────────────
     MOBILE MENU
  ────────────────────────────────────────── */
  const hamburger = document.getElementById('hamburger');
  const navMenu = document.getElementById('navMenu');

  if (hamburger) {
    hamburger.addEventListener('click', () => {
      navMenu.classList.toggle('open');
    });
  }

  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      navMenu.classList.remove('open');
    });
  });

  /* ──────────────────────────────────────────
     BACK TO TOP
  ────────────────────────────────────────── */
  if (backTop) {
    backTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ──────────────────────────────────────────
     TYPEWRITER EFFECT
  ────────────────────────────────────────── */
  const typedEl = document.getElementById('typedTitle');
  const titles = [
    'Junior AI Engineer',
    'Data Scientist',
    'SLM & RAG Specialist',
    'ML Engineer',
    'Python Developer'
  ];
  let titleIdx = 0, charIdx = 0, isDeleting = false;

  function typeWrite() {
    if (!typedEl) return;
    const current = titles[titleIdx];

    if (!isDeleting) {
      typedEl.textContent = current.slice(0, charIdx + 1);
      charIdx++;
      if (charIdx === current.length) {
        isDeleting = true;
        setTimeout(typeWrite, 2200);
        return;
      }
      setTimeout(typeWrite, 70);
    } else {
      typedEl.textContent = current.slice(0, charIdx - 1);
      charIdx--;
      if (charIdx === 0) {
        isDeleting = false;
        titleIdx = (titleIdx + 1) % titles.length;
        setTimeout(typeWrite, 400);
        return;
      }
      setTimeout(typeWrite, 35);
    }
  }
  typeWrite();

  /* ──────────────────────────────────────────
     SCROLL REVEAL ANIMATIONS
  ────────────────────────────────────────── */
  function setupReveal() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const delay = parseInt(el.dataset.delay) || 0;
          setTimeout(() => {
            el.classList.add('visible');
            // Trigger skill bars when visible
            el.querySelectorAll('.skill-fill').forEach(bar => {
              const targetWidth = bar.style.width;
              bar.style.width = '0';
              setTimeout(() => { bar.style.width = targetWidth; }, 50);
            });
          }, delay);
          observer.unobserve(el);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });

    document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right').forEach(el => {
      observer.observe(el);
    });
  }
  setupReveal();

  /* ──────────────────────────────────────────
     SKILL BAR OBSERVER
  ────────────────────────────────────────── */
  const skillObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.querySelectorAll('.skill-fill').forEach(bar => {
          const w = bar.style.width;
          bar.style.width = '0';
          setTimeout(() => { bar.style.width = w; }, 200);
        });
        skillObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  document.querySelectorAll('.skill-group').forEach(g => skillObserver.observe(g));

  /* ──────────────────────────────────────────
     PROJECT FILTER
  ────────────────────────────────────────── */
  const filterPills = document.querySelectorAll('.filter-pill');
  const projCards = document.querySelectorAll('.proj-card');

  filterPills.forEach(pill => {
    pill.addEventListener('click', () => {
      filterPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      const cat = pill.dataset.cat;

      projCards.forEach(card => {
        const cardCat = card.dataset.category;
        if (cat === 'all' || cardCat === cat) {
          card.style.display = '';
          card.style.animation = 'fadeInUp 0.4s ease both';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  /* ──────────────────────────────────────────
     SMOOTH ANCHOR SCROLL
  ────────────────────────────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const href = anchor.getAttribute('href');
      if (href === '#') return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  /* ──────────────────────────────────────────
     CARD TILT EFFECT ON HOVER
  ────────────────────────────────────────── */
  document.querySelectorAll('.proj-card, .skill-group, .edu-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const cx = rect.width / 2;
      const cy = rect.height / 2;
      const tiltX = (y - cy) / cy * 3;
      const tiltY = (cx - x) / cx * 3;
      card.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateZ(6px)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });

  /* ──────────────────────────────────────────
     COUNTER ANIMATION (STATS BAR)
  ────────────────────────────────────────── */
  const statObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.querySelectorAll('[data-count]').forEach(el => {
          const target = parseInt(el.dataset.count);
          let count = 0;
          const interval = setInterval(() => {
            count++;
            el.textContent = count;
            if (count >= target) clearInterval(interval);
          }, 200);
        });
        statObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  const statsBar = document.querySelector('.stats-bar');
  if (statsBar) statObserver.observe(statsBar);

  /* ──────────────────────────────────────────
     HERO PARALLAX ON SCROLL
  ────────────────────────────────────────── */
  const heroBg = document.querySelector('.hero-bg-image');
  window.addEventListener('scroll', () => {
    if (heroBg && window.scrollY < window.innerHeight) {
      heroBg.style.transform = `translateY(${window.scrollY * 0.3}px)`;
    }
  }, { passive: true });

})();

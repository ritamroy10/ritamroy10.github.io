/**
 * RITAM ROY — LUXURY CREATIVE DEVELOPER & AI ENGINEER PORTFOLIO
 * High-precision interactive logic matching the Instagram reel experience
 */

document.addEventListener('DOMContentLoaded', () => {

  // =========================================================================
  // 1. PRELOADER ANIMATION SEQUENCE (Exact Frame 3 -> 6 -> 12 -> 15 sequence)
  // =========================================================================
  const preloader = document.getElementById('preloader');
  const counterEl = document.getElementById('preloaderCounter');
  const arcProgress = document.getElementById('preloaderArc');
  const spinnerWrap = document.getElementById('preloaderSpinnerWrap');
  const greetingEl = document.getElementById('preloaderGreeting');
  const body = document.body;

  // If nopreloader is requested in URL, skip animation instantly
  if (window.location.search.includes('nopreloader')) {
    if (preloader) {
      preloader.style.display = 'none';
      preloader.classList.add('completed');
    }
    body.classList.remove('loading-state');
    return;
  }

  let currentPercent = 0;
  const targetPercent = 100;
  const totalDuration = 1000; // ms snappy counter
  const intervalTime = 16;
  const increment = targetPercent / (totalDuration / intervalTime);

  // SVG arc dasharray constant (2 * PI * r = 2 * 3.14159 * 40 = 251.32)
  const fullCircumference = 251.32;

  const countTimer = setInterval(() => {
    currentPercent += increment;
    if (currentPercent >= 100) {
      currentPercent = 100;
      clearInterval(countTimer);
      counterEl.textContent = '100%';
      arcProgress.style.strokeDashoffset = '0';

      // Step 2: Transition from 100% to cursive "hello"
      setTimeout(() => {
        counterEl.classList.add('hide');
        spinnerWrap.classList.add('hide');
        greetingEl.classList.add('show');

        // Step 3: Slide up the preloader curtain
        setTimeout(() => {
          preloader.classList.add('completed');
          body.classList.remove('loading-state');
          setTimeout(() => {
            preloader.style.display = 'none';
          }, 800);
        }, 550);

      }, 250);

    } else {
      const displayVal = Math.floor(currentPercent);
      counterEl.textContent = `${displayVal}%`;
      // Animate arc stroke offset
      const offset = fullCircumference - (currentPercent / 100) * fullCircumference;
      arcProgress.style.strokeDashoffset = offset;
    }
  }, intervalTime);


  // =========================================================================
  // 2. SMOOTH CUSTOM CURSOR WITH LERP INTERPOLATION
  // =========================================================================
  const cursorDot = document.getElementById('customCursor');
  const cursorFollower = document.getElementById('cursorFollower');

  let mouseX = -100;
  let mouseY = -100;
  let followerX = -100;
  let followerY = -100;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursorDot.style.left = `${mouseX}px`;
    cursorDot.style.top = `${mouseY}px`;
  });

  function renderCursor() {
    // Lerp smoothing (0.16 factor)
    followerX += (mouseX - followerX) * 0.16;
    followerY += (mouseY - followerY) * 0.16;

    cursorFollower.style.left = `${followerX}px`;
    cursorFollower.style.top = `${followerY}px`;

    requestAnimationFrame(renderCursor);
  }
  requestAnimationFrame(renderCursor);

  // Interactive Hover Targets for Cursor Expansion
  const hoverTargets = document.querySelectorAll(
    'a, button, input, textarea, .project-card, .expertise-row, .contact-info-card, .portrait-card, .tech-chip'
  );

  hoverTargets.forEach((target) => {
    target.addEventListener('mouseenter', () => {
      cursorDot.classList.add('hovering');
      cursorFollower.classList.add('hovering');
    });
    target.addEventListener('mouseleave', () => {
      cursorDot.classList.remove('hovering');
      cursorFollower.classList.remove('hovering');
    });
  });


  // =========================================================================
  // 3. FULLSCREEN HAMBURGER OVERLAY MENU
  // =========================================================================
  const hamburgerBtn = document.getElementById('hamburgerBtn');
  const menuCloseBtn = document.getElementById('menuCloseBtn');
  const menuOverlay = document.getElementById('menuOverlay');
  const menuLinks = document.querySelectorAll('.menu-link');

  function openMenu() {
    menuOverlay.classList.add('open');
    body.style.overflow = 'hidden';
  }

  function closeMenu() {
    menuOverlay.classList.remove('open');
    body.style.overflow = '';
  }

  if (hamburgerBtn) {
    hamburgerBtn.addEventListener('click', openMenu);
  }
  if (menuCloseBtn) {
    menuCloseBtn.addEventListener('click', closeMenu);
  }

  menuLinks.forEach((link) => {
    link.addEventListener('click', () => {
      closeMenu();
    });
  });


  // =========================================================================
  // 4. FLOATING REACTION PREVIEW CARD (Section 03 - EXPERTISE Frame 60/75)
  // =========================================================================
  const expertiseSection = document.getElementById('expertise');
  const expertiseRows = document.querySelectorAll('.expertise-row');
  const floatingPreview = document.getElementById('floatingPreview');

  if (expertiseSection && floatingPreview) {
    expertiseRows.forEach((row) => {
      row.addEventListener('mouseenter', (e) => {
        floatingPreview.classList.add('active');
        positionPreview(e);
      });

      row.addEventListener('mousemove', (e) => {
        positionPreview(e);
      });

      row.addEventListener('mouseleave', () => {
        floatingPreview.classList.remove('active');
      });
    });

    function positionPreview(e) {
      const rect = expertiseSection.getBoundingClientRect();
      const x = e.clientX - rect.left + 50;
      const y = e.clientY - rect.top;
      floatingPreview.style.left = `${x}px`;
      floatingPreview.style.top = `${y}px`;
    }
  }


  // =========================================================================
  // 5. CONTACT FORM INTERACTIVE SUBMISSION
  // =========================================================================
  const contactForm = document.getElementById('contactForm');
  const submitBtn = document.getElementById('submitBtn');
  const formStatus = document.getElementById('formStatus');

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const nameInput = document.getElementById('contactName').value.trim();
      const emailInput = document.getElementById('contactEmail').value.trim();
      const messageInput = document.getElementById('contactMessage').value.trim();

      if (!nameInput || !emailInput || !messageInput) {
        return;
      }

      // Button loading state
      const originalText = submitBtn.innerHTML;
      submitBtn.innerHTML = '<span>Sending...</span>';
      submitBtn.disabled = true;

      // Construct mailto link as fallback to guarantee direct contact
      const subject = encodeURIComponent(`Portfolio Inquiry from ${nameInput}`);
      const bodyText = encodeURIComponent(
        `Hi Ritam,\n\nName: ${nameInput}\nEmail: ${emailInput}\n\nMessage:\n${messageInput}`
      );
      const mailtoUrl = `mailto:ritamroy.work@gmail.com?subject=${subject}&body=${bodyText}`;

      setTimeout(() => {
        // Show success notification
        formStatus.innerHTML = `✓ Thank you, <strong>${nameInput}</strong>! Your message is ready. Opening your email client to deliver to Ritam...`;
        formStatus.className = 'form-status success';
        formStatus.style.display = 'block';

        // Trigger mailto link
        window.location.href = mailtoUrl;

        // Reset form
        contactForm.reset();
        submitBtn.innerHTML = '<span>Message Prepared ✓</span>';

        setTimeout(() => {
          submitBtn.innerHTML = originalText;
          submitBtn.disabled = false;
        }, 4000);
      }, 600);
    });
  }


  // =========================================================================
  // 6. SCROLL REVEALS & ACTIVE NAVBAR HIGHLIGHTS
  // =========================================================================
  const observerOptions = {
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px'
  };

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
      }
    });
  }, observerOptions);

  document.querySelectorAll('.about-section, .expertise-section, .work-section, .contact-section, .project-card').forEach((el) => {
    revealObserver.observe(el);
  });

});

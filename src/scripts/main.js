'use strict';

// 1. Selectors
// 2. Helper functions
//      2.1. Header scrolled state
//      2.2. Toggle Menu
//      2.3. Focus Trap & Keyboard Handler
//      2.4. Proximity detection for burger/X
//      2.5. Scroll Lock
//      2.6. Soundwave icon animation
// 3. Handlers
// 4. Init

// =================================================
//      SELECTORS
// =================================================

const burger = document.querySelector('.burger');
const header = document.querySelector('.header');
const menu = document.querySelector('.menu');
const menuLinks = document.querySelectorAll('.menu__link');
const menuOverlay = document.querySelector('.menu-overlay');

// =================================================
//      HELPER FUNCTIONS
// =================================================

const getFocusableElements = () => {
  return menu.querySelectorAll(
    'a[href], button:not([disabled]), input, textarea, select, [tabindex]:not([tabindex="-1"])'
  );
};

// -------------------------------------------------
//      HEADER SCROLLED STATE (throttle)
// -------------------------------------------------

let ticking = false;

const handleScroll = () => {
  if (!ticking) {
    ticking = true;
    window.requestAnimationFrame(() => {
      if (window.scrollY > 50) {
        header.classList.add('is-scrolled');
      } else {
        header.classList.remove('is-scrolled');
      }
      ticking = false;
    });
  }
};

// -------------------------------------------------
//      TOGGLE MENU
// -------------------------------------------------

const toggleMenu = (forceClose = false) => {
  const isOpen = forceClose ? true : burger.getAttribute('aria-expanded') === 'true';
  const newState = !isOpen;

  burger.setAttribute('aria-expanded', String(newState));
  menu.classList.toggle('is-open', newState);
  document.body.classList.toggle('menu-is-open', newState);
  header.classList.toggle('menu-is-open', newState);

  toggleScrollLock(newState);

  if (newState) {
    document.addEventListener('keydown', handleFocusTrap);

    const handleTransitionEnd = (e) => {
      if (e.propertyName === 'transform') {
        const focusable = getFocusableElements();
        focusable[0]?.focus();
        menu.removeEventListener('transitionend', handleTransitionEnd);
      }
    };

    menu.addEventListener('transitionend', handleTransitionEnd);
  } else {
    document.removeEventListener('keydown', handleFocusTrap)
  }
};

// -------------------------------------------------
//      FOCUS TRAP & KEYBOARD HANDLER
// -------------------------------------------------

const handleFocusTrap = (e) => {
  const focusable = getFocusableElements();
  const firstElement = focusable[0];
  const lastElement = focusable[focusable.length - 1];

// -------------------------------------------------
//      ESC key handle (closing)
// -------------------------------------------------

  if (e.key === 'Escape') {
    toggleMenu(true);
    burger.focus(); // add focus to open menu button

    return;
  }

// -------------------------------------------------
//      TAB key handle
// -------------------------------------------------

  if (e.key === 'Tab') {
    if (e.shiftKey) {
      if (document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      }
    } else {
      if (document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    }
  }
};

// -------------------------------------------------
//      PROXIMITY DETECTION for BURGER/X
// -------------------------------------------------

const initProximitySignal = () => {
  if (!burger) return;

  if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
    return;
  }

  let ticking = false;

  window.addEventListener('mousemove', (e) => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        const rect = burger.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const distance = Math.hypot(e.clientX - centerX, e.clientY - centerY);

        if (burger.getAttribute('aria-expanded') === 'true' && distance < 200) {
          burger.classList.add('is-nearby');
        } else {
          burger.classList.remove('is-nearby');
        }
        ticking = false;
      });
      ticking = true;
    }
  });
};

// -------------------------------------------------
//      SCROLL LOCK
// -------------------------------------------------

const toggleScrollLock = (isLocked) => {
  const body = document.body;

  if (isLocked) {
    const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
    body.style.paddingRight = `${scrollBarWidth}px`;
    body.classList.add('scroll-locked');
  } else {
    body.style.paddingRight = '';
    body.classList.remove('scroll-locked');
  }
};

// -------------------------------------------------
//      FISHER-YATES helper
// -------------------------------------------------

function fisherYatesShuffle(array) {
  const shuffled = [...array];

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled;
}

// -------------------------------------------------
//      SOUNDWAVE icon ANIMATION (TODO: rAF + offsetHeight)
// -------------------------------------------------

const animateSoundwave = () => {
  const bars = document.querySelectorAll('.wave-bar');
  const barsArray = Array.from(bars);
  if (!barsArray.length) {
    return;
  }

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return;
  }

  const shuffled = fisherYatesShuffle(barsArray);
  const selected = [];
  const minDistance = 2;
  const maxBars = 4;

  for (const candidate of shuffled) {
    if (selected.length >= maxBars) break;
    const candIdx = barsArray.indexOf(candidate);
    const tooClose = selected.some(s => Math.abs(barsArray.indexOf(s) - candIdx) < minDistance);
    if (!tooClose) selected.push(candidate);
  }

  selected.forEach((bar, index) => {
    const staggerDelay = (index * 0.15 + Math.random() * 0.2).toFixed(2) + 's';
    const duration = (Math.random() * 1 + 1.5).toFixed(2) + 's';
    const randomOpacity = (Math.random() * 0.6 + 0.1).toFixed(2);

    bar.style.setProperty('--target-opacity', randomOpacity);
    bar.style.setProperty('--delay', staggerDelay);
    bar.style.setProperty('--duration', duration);

    setTimeout(() => {
      bar.classList.add('is-animating');
    }, 10);
  });
};



// -------------------------------------------------
//      FY-algorithm animation: pure JS (backup)
// -------------------------------------------------

// let soundwaveIntervals = [];

// const animateSoundwave = () => {
//   const bars = document.querySelectorAll('.wave-bar');
//   const barsArray = Array.from(bars);

//   if (!barsArray.length) return;

//   // --- cleanup ---

//   soundwaveIntervals.forEach(clearInterval);
//   soundwaveIntervals = [];

//   // --- Fisher-Yates shuffle ---

//   const shuffledBars = fisherYatesShuffle(barsArray);
//   const selectedBars = [];
//   const minDistance = 2;
//   const maxBars = 4;

//   // select bars with minDistance constraint

//   for (const bar of shuffledBars) {
//     if (selectedBars.length >= maxBars) break;

//     const candidateIndex = barsArray.indexOf(bar);

//     const isTooClose = selectedBars.some(selectedBar => {
//       const alreadySelectedIndex = barsArray.indexOf(selectedBar);
//       return Math.abs(candidateIndex - alreadySelectedIndex) < minDistance;
//     });

//     if (!isTooClose) {
//       selectedBars.push(bar);
//     }
//   }

//   // --- fallback ---

//   if (selectedBars.length === 0) {
//     console.warn('Soundwave: No bars selected with minDistance. Using first 4.');
//     for (let i = 0; i < Math.min(maxBars, barsArray.length); i++) {
//       selectedBars.push(barsArray[i]);
//     }
//   }

//   // --- animation ---

//   selectedBars.forEach((bar) => {
//     bar.style.transition = 'opacity 0.35s ease';

//     const flickerInterval = setInterval(() => {
//       bar.style.opacity = (Math.random() * 0.8 + 0.2);
//       bar.style.transitionDelay = Math.random() * 180 + 'ms';
//     }, 220);

//     soundwaveIntervals.push(flickerInterval);

//     setTimeout(() => {
//       clearInterval(flickerInterval);
//       bar.style.opacity = '1';
//       bar.style.transitionDelay = '0ms';
//     }, 2000);
//   });
// };

// =================================================
//     HANDLERS
// =================================================

const handleBurgerClick = () => toggleMenu();

const handleLinkClick = (e) => {
  toggleMenu(true);
};

// =================================================
//      INIT
// =================================================

const init = () => {
  if (burger) {
    burger.addEventListener('click', handleBurgerClick);
  }

  if (menuOverlay) {
    menuOverlay.addEventListener('click', () => toggleMenu(true));
  }

  if (menuLinks) {
    menuLinks.forEach(link => link.addEventListener('click', handleLinkClick));
  }

  initProximitySignal();
  animateSoundwave();

  window.addEventListener('scroll', handleScroll);
};

document.addEventListener('DOMContentLoaded', init);

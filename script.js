// ===========================
// PERFORMANCE CONFIG
// ===========================
if (typeof gsap !== "undefined") {
  gsap.ticker.lagSmoothing(0);
}

// ===========================
// MOBILE KILL-SWITCH (gsap.matchMedia)
// ===========================
const mm = gsap.matchMedia();

mm.add("(min-width: 800px)", () => {
  // Desktop-only animations
  initDesktopAnimations();
  initSmoothScrollDesktop();

  return () => {
    // This runs when the media query no longer matches (< 800px)
    // GSAP matchMedia automatically reverts and kills all ScrollTriggers created inside
  };
});

mm.add("(max-width: 799px)", () => {
  // Mobile-only logic
  initMobileLogic();
});

// ===========================
// MOBILE LOGIC (Lightweight)
// ===========================
function initMobileLogic() {
  // Simple intersection observer for reveals instead of heavy GSAP
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1 }
  );

  document.querySelectorAll("[data-scroll-reveal], .fade-up").forEach((el) => {
    observer.observe(el);
  });
}

// ===========================
// DESKTOP ANIMATIONS
// ===========================
function initDesktopAnimations() {
  if (typeof gsap === "undefined") return;
  gsap.registerPlugin(ScrollTrigger);

  // 1. Scroll Text Reveal
  const revealElements = document.querySelectorAll("[data-scroll-reveal]");
  revealElements.forEach((el) => {
    splitTextNodes(el);
    const wordEls = el.querySelectorAll(".word");
    
    gsap.fromTo(
      wordEls,
      { autoAlpha: 0, y: 20 },
      {
        autoAlpha: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.04,
        ease: "power2.out",
        scrollTrigger: {
          trigger: el,
          start: "top 85%",
          toggleActions: "play none none none"
        }
      }
    );
  });

  // 2. Testimonial Scroll
  const testimonialSection = document.querySelector(".testimonials");
  if (testimonialSection) {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: testimonialSection,
        start: "top 80%",
        scrub: 1,
        anticipatePin: 1
      }
    });
    tl.from(".testimonial-left", { x: -30, autoAlpha: 0, duration: 0.8 }, 0)
      .from(".testimonial-quote", { x: 30, autoAlpha: 0, duration: 0.8 }, 0.2)
      .from(".testimonial-attribution", { y: 10, autoAlpha: 0, duration: 0.6 }, 0.4)
      .from(".testimonial-cta", { y: 10, autoAlpha: 0, duration: 0.6 }, 0.5);
  }

  // 3. Work Grid
  const workCards = document.querySelectorAll(".work-card");
  workCards.forEach((card) => {
    gsap.fromTo(
      card,
      { y: 30, autoAlpha: 0 },
      {
        y: 0,
        autoAlpha: 1,
        duration: 0.8,
        ease: "power2.out",
        scrollTrigger: {
          trigger: card,
          start: "top 85%",
          scrub: 1,
          fastScrollEnd: true
        }
      }
    );
  });

  // 4. Custom Cursor
  initCustomCursor();
}

// ===========================
// VANILLA SMOOTH SCROLL (Desktop Only)
// ===========================
function initSmoothScrollDesktop() {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      const href = this.getAttribute("href");
      if (href === "#" || href === "#edit-consent") return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - 80;
        const startPosition = window.pageYOffset;
        const distance = targetPosition - startPosition;
        let startTime = null;

        function animation(currentTime) {
          if (startTime === null) startTime = currentTime;
          const timeElapsed = currentTime - startTime;
          const run = ease(timeElapsed, startPosition, distance, 1200);
          window.scrollTo(0, run);
          if (timeElapsed < 1200) requestAnimationFrame(animation);
        }

        function ease(t, b, c, d) {
          t /= d / 2;
          if (t < 1) return (c / 2) * t * t + b;
          t--;
          return (-c / 2) * (t * (t - 2) - 1) + b;
        }

        requestAnimationFrame(animation);
      }
    });
  });
}

// ===========================
// MISC UTILITIES
// ===========================

function splitTextNodes(node) {
  if (node.nodeType === 3) {
    const raw = node.textContent;
    const trimmed = raw.trim();
    if (trimmed.length === 0) return;
    const words = trimmed.split(/\s+/);
    const fragment = document.createDocumentFragment();
    words.forEach((word, index) => {
      const span = document.createElement("span");
      span.className = "word";
      span.style.display = "inline-block";
      span.style.opacity = "0"; 
      span.style.visibility = "hidden";
      span.textContent = word;
      fragment.appendChild(span);
      if (index < words.length - 1) fragment.appendChild(document.createTextNode(" "));
    });
    node.replaceWith(fragment);
  } else if (node.nodeType === 1) {
    Array.from(node.childNodes).forEach((child) => splitTextNodes(child));
  }
}

function initCustomCursor() {
  const customCursor = document.getElementById("custom-cursor");
  const caseCards = document.querySelectorAll(".case-card[data-cursor]");
  if (!customCursor) return;
  let targetX = 0, targetY = 0, currX = 0, currY = 0;

  document.addEventListener("mousemove", (e) => {
    targetX = e.clientX;
    targetY = e.clientY;
  });

  function update() {
    currX += (targetX - currX) * 0.15;
    currY += (targetY - currY) * 0.15;
    customCursor.style.transform = `translate3d(${currX}px, ${currY}px, 0)`;
    requestAnimationFrame(update);
  }
  update();

  caseCards.forEach((card) => {
    card.addEventListener("mouseenter", () => {
      customCursor.textContent = card.dataset.cursor || "View";
      customCursor.classList.add("visible");
    });
    card.addEventListener("mouseleave", () => {
      customCursor.classList.remove("visible");
    });
  });
}

// ===========================
// MOBILE MENU TOGGLE
// ===========================
const menuToggle = document.getElementById("menu-toggle");
const mobileOverlay = document.getElementById("mobile-nav-overlay");
if (menuToggle && mobileOverlay) {
  menuToggle.addEventListener("click", () => {
    const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", !isOpen);
    mobileOverlay.classList.toggle("active");
    document.body.style.overflow = isOpen ? "" : "hidden";
  });
  mobileOverlay.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      menuToggle.setAttribute("aria-expanded", "false");
      mobileOverlay.classList.remove("active");
      document.body.style.overflow = "";
    });
  });
}

// ===========================
// HEADER & NAV LOGIC
// ===========================
const header = document.getElementById("site-header");
let lastS = 0;
window.addEventListener("scroll", () => {
  const currS = window.scrollY;
  if (currS > lastS && currS > 100) header.classList.add("hidden");
  else header.classList.remove("hidden");
  if (currS > 500) header.classList.add("scrolled");
  else header.classList.remove("scrolled");
  lastS = currS;
}, { passive: true });

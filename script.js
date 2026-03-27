// ===========================
// GSAP CONFIG & PERFORMANCE
// ===========================
if (typeof gsap !== "undefined") {
  gsap.ticker.lagSmoothing(1000, 16);
}

// ===========================
// LENIS SMOOTH SCROLL
// ===========================
const lenis = new Lenis({
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // easeOutExpo
  orientation: "vertical",
  gestureOrientation: "vertical",
  smoothWheel: true,
  wheelMultiplier: 1,
  touchMultiplier: 1.5,
  infinite: false,
});

function raf(time) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

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

    if (!isOpen) {
      lenis.stop();
    } else {
      lenis.start();
    }
  });

  // Close mobile nav when clicking a link
  mobileOverlay.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      menuToggle.setAttribute("aria-expanded", "false");
      mobileOverlay.classList.remove("active");
      lenis.start();
    });
  });
}

// ===========================
// HEADER SHOW/HIDE ON SCROLL
// ===========================
const header = document.getElementById("site-header");
let lastScrollY = 0;
let ticking = false;

let threshold = 0;
let cachedHero = null;

function updateHeader() {
  const scrollY = window.scrollY;
  
  if (!cachedHero) {
    cachedHero = document.getElementById("hero") || document.querySelector(".services-hero");
    if (cachedHero) {
      threshold = cachedHero.offsetHeight - 80;
    }
  }

  if (scrollY > lastScrollY && scrollY > 100) {
    header.classList.add("hidden");
  } else {
    header.classList.remove("hidden");
  }

  if (scrollY > threshold) {
    header.classList.add("scrolled");
  } else {
    header.classList.remove("scrolled");
  }

  lastScrollY = scrollY;
  ticking = false;
}

window.addEventListener(
  "scroll",
  () => {
    if (!ticking) {
      window.requestAnimationFrame(updateHeader);
      ticking = true;
    }
  },
  { passive: true },
);

// ===========================
// NAV ACTIVE DOT INDICATOR
// ===========================
const sections = document.querySelectorAll("main section[id]");
const navLinks = document.querySelectorAll(".nav-list li");

// Map section IDs to nav link text
const sectionNavMap = {
  cases: "Work",
  services: "Services",
  clients: "Clients",
  "about-statement": "About",
  "careers-cta": "Careers",
  locations: "Cascon & Co.",
};

function updateActiveNav() {
  // Only run scroll spy on homepage to avoid overriding active state on subpages
  if (
    window.location.pathname !== "/" &&
    !window.location.pathname.endsWith("/index.html")
  )
    return;

  const scrollY = window.scrollY + window.innerHeight / 3;
  let activeSection = "";

  sections.forEach((section) => {
    const top = section.offsetTop;
    const height = section.offsetHeight;
    if (scrollY >= top && scrollY < top + height) {
      activeSection = section.id;
    }
  });

  const activeLinkText = sectionNavMap[activeSection] || "";

  navLinks.forEach((li) => {
    const linkText = li.querySelector("a")?.textContent.trim();
    if (linkText === activeLinkText) {
      li.classList.add("active");
    } else {
      li.classList.remove("active");
    }
  });
}

window.addEventListener(
  "scroll",
  () => {
    requestAnimationFrame(updateActiveNav);
  },
  { passive: true },
);

// Initial call
updateActiveNav();

// ===========================
// SCROLL TEXT REVEAL (About Statement)
// ===========================
// ===========================
// GSAP SCROLL TEXT REVEAL
// ===========================
function initScrollReveal() {
  const elements = document.querySelectorAll("[data-scroll-reveal]");

  elements.forEach((el) => {
    // Advanced splitting that preserves HTML tags (strong, span, etc.)
    splitTextNodes(el);

    const wordEls = el.querySelectorAll(".word");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            gsap.fromTo(
              wordEls,
              {
                autoAlpha: 0,
                y: 20,
                filter: "blur(8px)",
              },
              {
                autoAlpha: 1,
                y: 0,
                filter: "blur(0px)",
                duration: 0.8,
                stagger: 0.04,
                ease: "power2.out",
                force3D: true,
              },
            );
            observer.unobserve(el);
          }
        });
      },
      { threshold: 0.2 },
    );

    observer.observe(el);
  });
}

function splitTextNodes(node) {
  if (node.nodeType === 3) {
    // Text node
    const raw = node.textContent;
    const trimmed = raw.trim();
    if (trimmed.length === 0) return;

    const leadingSpace = raw.match(/^\s/) !== null;
    const trailingSpace = raw.match(/\s$/) !== null;

    const words = trimmed.split(/\s+/);
    const fragment = document.createDocumentFragment();

    // Re-insert the leading space so the word doesn't merge with the previous element
    if (leadingSpace) {
      fragment.appendChild(document.createTextNode(" "));
    }

    words.forEach((word, index) => {
      const span = document.createElement("span");
      span.className = "word";
      span.style.display = "inline-block";
      span.style.opacity = "0"; // Initial state for GSAP
      span.textContent = word;
      fragment.appendChild(span);

      // Add space between words
      if (index < words.length - 1) {
        fragment.appendChild(document.createTextNode(" "));
      }
    });

    // Re-insert the trailing space so the word doesn't merge with the next element
    if (trailingSpace) {
      fragment.appendChild(document.createTextNode(" "));
    }

    node.replaceWith(fragment);
  } else if (node.nodeType === 1) {
    // Element node
    // Recursively handle children
    // Convert childNodes to array to avoid live collection issues during replacement
    Array.from(node.childNodes).forEach((child) => splitTextNodes(child));
  }
}

// Initialize after DOM is ready
document.addEventListener("DOMContentLoaded", initScrollReveal);
// Also call immediately in case of defer
initScrollReveal();

// ===========================
// CUSTOM CURSOR (Case Studies)
// ===========================
const customCursor = document.getElementById("custom-cursor");
const caseCards = document.querySelectorAll(".case-card[data-cursor]");
let cursorX = 0;
let cursorY = 0;
let targetX = 0;
let targetY = 0;

// Only enable custom cursor on non-touch devices
const isTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;

if (!isTouch && customCursor) {
  // Smooth cursor follow using lerp
  function updateCursor() {
    cursorX += (targetX - cursorX) * 0.15;
    cursorY += (targetY - cursorY) * 0.15;
    customCursor.style.left = cursorX + "px";
    customCursor.style.top = cursorY + "px";
    requestAnimationFrame(updateCursor);
  }
  updateCursor();

  document.addEventListener("mousemove", (e) => {
    targetX = e.clientX;
    targetY = e.clientY;
  });

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
// TESTIMONIAL SLIDER (GSAP)
// ===========================
const testiImages = document.querySelectorAll(".testimonial-image-track img");
const testiContents = document.querySelectorAll(".testimonial-slide-content");
const testiPrev = document.getElementById("testi-prev");
const testiNext = document.getElementById("testi-next");
const testiCounter = document.getElementById("testi-counter");
let testiCurrent = 0;

function showTestiSlide(index, direction = 1) {
  if (index === testiCurrent) return;

  const outgoing = testiContents[testiCurrent];
  const incoming = testiContents[index];
  const outgoingImg = testiImages[testiCurrent];
  const incomingImg = testiImages[index];

  const xMove = 20 * direction;

  // Outgoing Content
  gsap.to(outgoing, {
    autoAlpha: 0,
    x: -xMove,
    duration: 0.3,
    ease: "power2.in",
    force3D: true,
    onComplete: () => {
      outgoing.classList.remove("active");
      incoming.classList.add("active");

      // Incoming Content
      gsap.fromTo(
        incoming,
        { autoAlpha: 0, x: xMove },
        { autoAlpha: 1, x: 0, duration: 0.4, ease: "power2.out", delay: 0.1, force3D: true },
      );
    },
  });

  // Image Crossfade
  outgoingImg.classList.remove("active");
  incomingImg.classList.add("active");

  testiCurrent = index;
  if (testiCounter) {
    testiCounter.textContent = `${testiCurrent + 1}/3`;
  }
}

if (testiPrev && testiNext) {
  testiPrev.addEventListener("click", () => {
    let prev = (testiCurrent - 1 + 3) % 3;
    showTestiSlide(prev, -1);
  });
  testiNext.addEventListener("click", () => {
    let next = (testiCurrent + 1) % 3;
    showTestiSlide(next, 1);
  });
}

// Initial Scroll Entrance (GSAP ScrollTrigger)
function initTestiScroll() {
  const section = document.querySelector(".testimonials");
  if (!section) return;

  // Ensure ScrollTrigger is registered (standard practice before use)
  if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: "top 80%",
        once: true,
        scrub: 1,
        anticipatePin: 1,
      },
    });

    tl.from(
      ".testimonial-left",
      {
        x: -30,
        autoAlpha: 0,
        duration: 0.8,
        ease: "power2.out",
        force3D: true,
      },
      0,
    )
      .from(
        ".testimonial-quote",
        {
          x: 30,
          autoAlpha: 0,
          duration: 0.8,
          ease: "power2.out",
          force3D: true,
        },
        0.2,
      )
      .from(
        ".testimonial-attribution",
        {
          y: 10,
          autoAlpha: 0,
          duration: 0.6,
          ease: "power2.out",
          force3D: true,
        },
        0.4,
      )
      .from(
        ".testimonial-cta",
        {
          y: 10,
          autoAlpha: 0,
          duration: 0.6,
          ease: "power2.out",
          force3D: true,
        },
        0.5,
      );
  }
}

document.addEventListener("DOMContentLoaded", initTestiScroll);
// Initial call in case DOMContentLoaded already fired
if (
  document.readyState === "complete" ||
  document.readyState === "interactive"
) {
  initTestiScroll();
}

// ===========================
// SCROLL ANIMATIONS (Fade Up)
// ===========================
function addFadeUpElements() {
  const selectors = [
    "[data-fade-up]",
    ".hero-title",
    ".hero-locations",
    ".about-statement .btn-morph",
    ".case-card",
    ".cases-cta .btn-morph",
    ".section-heading",
    ".clients-btn",
    ".services-intro h2",
    ".services-intro p",
    ".services-header",
    ".service-card",
    ".services-cta .btn-morph",
    ".locations-heading",
    ".locations-sub",
    ".locations-section .btn-morph",
    ".careers-card",
    ".collab-cta h2",
    ".collab-cta p",
    ".collab-cta .btn-morph",
    // Services Page Specific
    ".services-headline",
    ".services-subline",
    ".service-block__title",
    ".service-block__desc",
    ".service-block__image",
    ".ways-headline",
    ".way-card",
  ];

  selectors.forEach((sel) => {
    document.querySelectorAll(sel).forEach((el, i) => {
      el.classList.add("fade-up");
      el.style.transitionDelay = `${i * 0.06}s`;
    });
  });
}

function initScrollObserver() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.1,
      rootMargin: "0px 0px -40px 0px",
    },
  );

  document.querySelectorAll(".fade-up").forEach((el) => observer.observe(el));
}

addFadeUpElements();
initScrollObserver();

// ===========================
// SMOOTH SCROLL FOR ANCHOR LINKS
// (Uses Lenis instead of native)
// ===========================
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    const href = this.getAttribute("href");
    if (href === "#" || href === "#edit-consent") return;

    const target = document.querySelector(href);
    if (target) {
      e.preventDefault();
      lenis.scrollTo(target, {
        offset: -80, // Account for header height
        duration: 1.2,
      });
    }
  });
});

// ===========================
// WORK PAGE LOGIC & ANIMATIONS
// ===========================
function initWorkPage() {
  // Only run if on work page
  if (!document.querySelector(".work-page")) return;

  if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);

    // 1. Hero Headline Animation
    const lines = document.querySelectorAll(".work-title-line span");
    if (lines.length > 0) {
      gsap.to(lines, {
        y: "0%",
        autoAlpha: 1,
        duration: 1,
        stagger: 0.1,
        ease: "power3.out",
        delay: 0.2,
        force3D: true,
      });
    }

    // 2. Work Grid Cards Scroll Animation
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
          force3D: true,
          scrollTrigger: {
            trigger: card,
            start: "top 85%",
            once: true,
            scrub: 1,
          },
        },
      );
    });

    // 3. Featured Breakout Animation
    const breakouts = document.querySelectorAll(".work-breakout");
    breakouts.forEach((breakout) => {
      const content = breakout.querySelector(".work-breakout-content");
      const image = breakout.querySelector(".work-breakout-image");

      if (content && image) {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: breakout,
            start: "top 80%",
            once: true,
            scrub: 1,
          },
        });

        tl.fromTo(
          content,
          { x: -40, autoAlpha: 0 },
          { x: 0, autoAlpha: 1, duration: 0.8, ease: "power2.out", force3D: true },
        ).fromTo(
          image,
          { x: 40, autoAlpha: 0 },
          { x: 0, autoAlpha: 1, duration: 0.8, ease: "power2.out", force3D: true },
          "<0.2", // Start slightly after content
        );
      }
    });
  }

  // Filter Logic
  const filterBtns = document.querySelectorAll(".work-filter-btn");
  const allItems = document.querySelectorAll(".work-card, .work-breakout");

  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      // Update active state on buttons
      filterBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      const filterValue = btn.getAttribute("data-filter");

      allItems.forEach((item) => {
        const itemTags = item.getAttribute("data-tags");
        if (!itemTags) return;

        const tagsArray = itemTags.split(",").map((t) => t.trim());

        if (filterValue === "all" || tagsArray.includes(filterValue)) {
          item.style.display = "";
          // Small fade in effect when shown
          gsap.fromTo(item, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4, force3D: true });
        } else {
          item.style.display = "none";
        }
      });

      // Re-trigger ScrollTrigger to recalculate positions after layout change
      if (typeof ScrollTrigger !== "undefined") {
        setTimeout(() => {
          ScrollTrigger.refresh();
        }, 50);
      }
    });
  });
}

document.addEventListener("DOMContentLoaded", initWorkPage);
if (
  document.readyState === "complete" ||
  document.readyState === "interactive"
) {
  initWorkPage();
}

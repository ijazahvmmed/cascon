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
    // GSAP matchMedia automatically reverts and kills all ScrollTriggers created inside
  };
});

mm.add("(max-width: 799px)", () => {
  // Mobile-only logic
  initMobileLogic();
});

// Always run page logic (filters, menu)
initCommonLogic();

// ===========================
// COMMON LOGIC (Available everywhere)
// ===========================
function initCommonLogic() {
  // Mobile Menu Toggle
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

  // Work Page Filters
  const filterBtns = document.querySelectorAll(".work-filter-btn");
  const allItems = document.querySelectorAll(".work-card, .work-breakout");
  if (filterBtns.length > 0) {
    filterBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        filterBtns.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        const filterValue = btn.getAttribute("data-filter");
        allItems.forEach((item) => {
          const itemTags = item.getAttribute("data-tags");
          if (!itemTags) return;
          const tagsArray = itemTags.split(",").map((t) => t.trim());
          if (filterValue === "all" || tagsArray.includes(filterValue)) {
            item.style.display = "";
            gsap.fromTo(item, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4, force3D: true });
          } else {
            item.style.display = "none";
          }
        });
        if (typeof ScrollTrigger !== "undefined") {
          setTimeout(() => { ScrollTrigger.refresh(); }, 50);
        }
      });
    });
  }

  // Header Logic
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
}

// ===========================
// MOBILE LOGIC (Lightweight)
// ===========================
function initMobileLogic() {
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
// DESKTOP ANIMATIONS (Smooth Butter Character Edition)
// ===========================
function initDesktopAnimations() {
  if (typeof gsap === "undefined") return;
  gsap.registerPlugin(ScrollTrigger);

  const revealElements = document.querySelectorAll("[data-scroll-reveal]");
  revealElements.forEach((el) => {
    splitTextToChars(el);
    const charEls = el.querySelectorAll(".char");
    
    gsap.fromTo(
      charEls,
      { 
        autoAlpha: 0, 
        filter: "blur(12px)",
        y: 10, 
      },
      {
        autoAlpha: 1,
        filter: "blur(0px)",
        y: 0,
        duration: 1.2,
        stagger: 0.02,
        ease: "power2.out",
        scrollTrigger: {
          trigger: el,
          start: "top 95%",
          toggleActions: "play none none none"
        }
      }
    );
  });

  // Testimonials, Work Cards, etc.
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

  initCustomCursor();
}

// ===========================
// VANILLA SMOOTH SCROLL
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
// UTILITIES
// ===========================

/**
 * Split text content into characters grouped by word to prevent layout breaks.
 */
function splitTextToChars(node) {
  if (node.nodeType === 3) {
    const text = node.textContent;
    const parts = text.split(/(\s+)/); // Keep whitespaces
    const fragment = document.createDocumentFragment();
    
    parts.forEach((part) => {
      // If it's pure whitespace, just add it as a text node
      if (/^\s+$/.test(part)) {
        fragment.appendChild(document.createTextNode(part));
      } else {
        // Wrap word in a span to prevent breaking lines in the middle
        const wordSpan = document.createElement("span");
        wordSpan.className = "word-wrapper";
        wordSpan.style.display = "inline-block";
        wordSpan.style.whiteSpace = "nowrap"; 
        
        for (let char of part) {
          const charSpan = document.createElement("span");
          charSpan.className = "char";
          charSpan.style.display = "inline-block";
          charSpan.style.opacity = "0";
          charSpan.style.visibility = "hidden";
          charSpan.textContent = char;
          wordSpan.appendChild(charSpan);
        }
        fragment.appendChild(wordSpan);
      }
    });
    node.replaceWith(fragment);
  } else if (node.nodeType === 1) {
    Array.from(node.childNodes).forEach((child) => splitTextToChars(child));
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

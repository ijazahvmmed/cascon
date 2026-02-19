// ===========================
// LENIS SMOOTH SCROLL
// ===========================
const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // easeOutExpo
    orientation: 'vertical',
    gestureOrientation: 'vertical',
    smoothWheel: true,
    wheelMultiplier: 1,
    touchMultiplier: 2,
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
const menuToggle = document.getElementById('menu-toggle');
const mobileOverlay = document.getElementById('mobile-nav-overlay');

if (menuToggle && mobileOverlay) {
    menuToggle.addEventListener('click', () => {
        const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
        menuToggle.setAttribute('aria-expanded', !isOpen);
        mobileOverlay.classList.toggle('active');

        if (!isOpen) {
            lenis.stop();
        } else {
            lenis.start();
        }
    });

    // Close mobile nav when clicking a link
    mobileOverlay.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            menuToggle.setAttribute('aria-expanded', 'false');
            mobileOverlay.classList.remove('active');
            lenis.start();
        });
    });
}

// ===========================
// HEADER SHOW/HIDE ON SCROLL
// ===========================
const header = document.getElementById('site-header');
let lastScrollY = 0;
let ticking = false;

function updateHeader() {
    const scrollY = window.scrollY;

    if (scrollY > lastScrollY && scrollY > 100) {
        header.classList.add('hidden');
    } else {
        header.classList.remove('hidden');
    }

    lastScrollY = scrollY;
    ticking = false;
}

window.addEventListener('scroll', () => {
    if (!ticking) {
        window.requestAnimationFrame(updateHeader);
        ticking = true;
    }
}, { passive: true });

// ===========================
// NAV ACTIVE DOT INDICATOR
// ===========================
const sections = document.querySelectorAll('main section[id]');
const navLinks = document.querySelectorAll('.nav-list li');

// Map section IDs to nav link text
const sectionNavMap = {
    'cases': 'Work',
    'services': 'Services',
    'clients': 'Clients',
    'about-statement': 'About',
    'careers-cta': 'Careers',
    'locations': 'Cascon & Co.',
};

function updateActiveNav() {
    // Only run scroll spy on homepage to avoid overriding active state on subpages
    if (window.location.pathname !== '/' && !window.location.pathname.endsWith('/index.html')) return;

    const scrollY = window.scrollY + window.innerHeight / 3;
    let activeSection = '';

    sections.forEach(section => {
        const top = section.offsetTop;
        const height = section.offsetHeight;
        if (scrollY >= top && scrollY < top + height) {
            activeSection = section.id;
        }
    });

    const activeLinkText = sectionNavMap[activeSection] || '';

    navLinks.forEach(li => {
        const linkText = li.querySelector('a')?.textContent.trim();
        if (linkText === activeLinkText) {
            li.classList.add('active');
        } else {
            li.classList.remove('active');
        }
    });
}

window.addEventListener('scroll', () => {
    requestAnimationFrame(updateActiveNav);
}, { passive: true });

// Initial call
updateActiveNav();

// ===========================
// SCROLL TEXT REVEAL (About Statement)
// ===========================
// ===========================
// GSAP SCROLL TEXT REVEAL
// ===========================
function initScrollReveal() {
    const elements = document.querySelectorAll('[data-scroll-reveal]');

    elements.forEach(el => {
        // Advanced splitting that preserves HTML tags (strong, span, etc.)
        splitTextNodes(el);

        const wordEls = el.querySelectorAll('.word');

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    gsap.fromTo(wordEls,
                        {
                            opacity: 0,
                            filter: 'blur(10px)',
                            y: 20
                        },
                        {
                            opacity: 1,
                            filter: 'blur(0px)',
                            y: 0,
                            duration: 0.8,
                            stagger: 0.04,
                            ease: 'power2.out'
                        }
                    );
                    observer.unobserve(el);
                }
            });
        }, { threshold: 0.2 });

        observer.observe(el);
    });
}

function splitTextNodes(node) {
    if (node.nodeType === 3) { // Text node
        const text = node.textContent.trim();
        if (text.length === 0) return;

        const words = text.split(/\s+/);
        const fragment = document.createDocumentFragment();

        words.forEach((word, index) => {
            const span = document.createElement('span');
            span.className = 'word';
            span.style.display = 'inline-block';
            span.style.opacity = '0'; // Initial state for GSAP
            span.textContent = word;
            fragment.appendChild(span);

            // Add space after word unless it's the last one
            if (index < words.length - 1) {
                fragment.appendChild(document.createTextNode(' '));
            }
        });

        node.replaceWith(fragment);
    } else if (node.nodeType === 1) { // Element node
        // Recursively handle children
        // Convert childNodes to array to avoid live collection issues during replacement
        Array.from(node.childNodes).forEach(child => splitTextNodes(child));
    }
}

// Initialize after DOM is ready
document.addEventListener('DOMContentLoaded', initScrollReveal);
// Also call immediately in case of defer
initScrollReveal();

// ===========================
// CUSTOM CURSOR (Case Studies)
// ===========================
const customCursor = document.getElementById('custom-cursor');
const caseCards = document.querySelectorAll('.case-card[data-cursor]');
let cursorX = 0;
let cursorY = 0;
let targetX = 0;
let targetY = 0;

// Only enable custom cursor on non-touch devices
const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

if (!isTouch && customCursor) {
    // Smooth cursor follow using lerp
    function updateCursor() {
        cursorX += (targetX - cursorX) * 0.15;
        cursorY += (targetY - cursorY) * 0.15;
        customCursor.style.left = cursorX + 'px';
        customCursor.style.top = cursorY + 'px';
        requestAnimationFrame(updateCursor);
    }
    updateCursor();

    document.addEventListener('mousemove', (e) => {
        targetX = e.clientX;
        targetY = e.clientY;
    });

    caseCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            customCursor.textContent = card.dataset.cursor || 'View';
            customCursor.classList.add('visible');
        });
        card.addEventListener('mouseleave', () => {
            customCursor.classList.remove('visible');
        });
    });
}

// ===========================
// TESTIMONIAL SLIDER
// ===========================
const slides = document.querySelectorAll('.testimonial-slide');
const counter = document.getElementById('testimonial-counter');
const prevBtn = document.getElementById('testimonial-prev');
const nextBtn = document.getElementById('testimonial-next');
let currentSlide = 0;

function showSlide(index) {
    slides.forEach(s => s.classList.remove('active'));
    currentSlide = ((index % slides.length) + slides.length) % slides.length;
    slides[currentSlide].classList.add('active');
    if (counter) {
        counter.textContent = `${currentSlide + 1} / ${slides.length}`;
    }
}

if (prevBtn) {
    prevBtn.addEventListener('click', () => showSlide(currentSlide - 1));
}
if (nextBtn) {
    nextBtn.addEventListener('click', () => showSlide(currentSlide + 1));
}

// Auto-advance testimonials every 6 seconds
let autoSlider = setInterval(() => showSlide(currentSlide + 1), 6000);

// Pause auto-advance on hover
const sliderContainer = document.getElementById('testimonial-slider');
if (sliderContainer) {
    sliderContainer.addEventListener('mouseenter', () => clearInterval(autoSlider));
    sliderContainer.addEventListener('mouseleave', () => {
        autoSlider = setInterval(() => showSlide(currentSlide + 1), 6000);
    });
}

// ===========================
// SCROLL ANIMATIONS (Fade Up)
// ===========================
function addFadeUpElements() {
    const selectors = [
        '.hero-title',
        '.hero-locations',
        '.about-statement .btn-morph',
        '.case-card',
        '.cases-cta .btn-morph',
        '.section-heading',
        '.clients-btn',
        '.testimonial-slider',
        '.services-intro h2',
        '.services-intro p',
        '.services-header',
        '.service-card',
        '.services-cta .btn-morph',
        '.locations-heading',
        '.locations-sub',
        '.locations-section .btn-morph',
        '.careers-card',
        '.collab-cta h2',
        '.collab-cta p',
        '.collab-cta .btn-morph',
    ];

    selectors.forEach(sel => {
        document.querySelectorAll(sel).forEach((el, i) => {
            el.classList.add('fade-up');
            el.style.transitionDelay = `${i * 0.06}s`;
        });
    });
}

function initScrollObserver() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -40px 0px'
    });

    document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));
}

addFadeUpElements();
initScrollObserver();

// ===========================
// SMOOTH SCROLL FOR ANCHOR LINKS
// (Uses Lenis instead of native)
// ===========================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href === '#' || href === '#edit-consent') return;

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

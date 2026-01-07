/**
 * CCI Website Routing and Component Loading
 */
import { posts as allPosts } from './data/posts-data.js';
import { formatDate } from './utils.js';
import { loadPosts } from './component/script.js';

const loadComponent = async (selector, filePath) => {
  try {
    const url = filePath.startsWith('/') ? filePath : new URL(filePath, import.meta.url).href;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to load ${url}`);
    const html = await response.text();
    const container = document.querySelector(selector);
    if (container) {
      container.innerHTML = html;

      // Execute scripts from the injected HTML (both external and inline)
      try {
        const scripts = Array.from(container.querySelectorAll('script'));
        for (const oldScript of scripts) {
          const newScript = document.createElement('script');
          if (oldScript.src) {
            newScript.src = oldScript.src;
            if (oldScript.type) newScript.type = oldScript.type;
            document.head.appendChild(newScript);
          } else {
            newScript.textContent = oldScript.textContent;
            document.head.appendChild(newScript);
          }
          oldScript.remove();
        }
      } catch (e) {
        // ignore
      }

      // If header initializer is available, call it
      try { if (window.__cci_initHeader) window.__cci_initHeader(); } catch (e) { }
    }
  } catch (err) {
    console.error("Error loading component:", err.message);
  }
};

/**
 * Handles the Carousel Slider Logic
 */
const initCarousel = () => {
  const inner = document.querySelector("#carousel-inner");
  const nextBtn = document.querySelector("#next-btn");
  const prevBtn = document.querySelector("#prev-btn");
  if (!inner || !nextBtn || !prevBtn) return;

  const slides = inner.children;
  const slideCount = slides.length;
  let currentIndex = 0;

  const updateSlider = () => {
    inner.style.transform = `translateX(-${currentIndex * 100}%)`;
    // Update dots if implemented
    const dots = document.querySelectorAll(".dot");
    dots.forEach((dot, idx) => {
      if (idx === currentIndex) {
        dot.classList.add("bg-blue-500", "w-8");
        dot.classList.remove("bg-white/40", "w-2");
      } else {
        dot.classList.remove("bg-blue-500", "w-8");
        dot.classList.add("bg-white/40", "w-2");
      }
    });
  };

  nextBtn.addEventListener("click", () => {
    currentIndex = (currentIndex + 1) % slideCount;
    updateSlider();
  });

  prevBtn.addEventListener("click", () => {
    currentIndex = (currentIndex - 1 + slideCount) % slideCount;
    updateSlider();
  });

  // Auto-play
  setInterval(() => {
    currentIndex = (currentIndex + 1) % slideCount;
    updateSlider();
  }, 4000);

  updateSlider();
};



/**
 * Handles the Mobile Menu Toggle Logic (Off-Canvas)
 */
const initMobileMenu = () => {
  const menuBtn = document.querySelector("#mobile-menu-btn");
  const closeBtn = document.querySelector("#mobile-menu-close");
  const mobileMenu = document.querySelector("#mobile-menu");
  const overlay = document.querySelector("#mobile-menu-overlay");

  if (!menuBtn || !mobileMenu || !overlay || !closeBtn) return;

  const openMenu = () => {
    // Force overlay/menu to be fixed and on top of all stacking contexts
    try {
      // set styles with important priority to overcome any page stacking contexts
      overlay.style.setProperty('position', 'fixed', 'important');
      overlay.style.setProperty('top', '0', 'important');
      overlay.style.setProperty('left', '0', 'important');
      overlay.style.setProperty('width', '100%', 'important');
      overlay.style.setProperty('height', '100%', 'important');
      overlay.style.setProperty('z-index', '2147483647', 'important');
      overlay.style.setProperty('pointer-events', 'auto', 'important');

      mobileMenu.style.setProperty('position', 'fixed', 'important');
      mobileMenu.style.setProperty('top', '0', 'important');
      mobileMenu.style.setProperty('right', '0', 'important');
      mobileMenu.style.setProperty('height', '100%', 'important');
      mobileMenu.style.setProperty('z-index', '2147483647', 'important');
    } catch (e) {
      console.error('Error applying mobile overlay styles', e);
    }

    // Remove hidden first to allow transitions
    overlay.classList.remove("hidden");
    mobileMenu.classList.remove("hidden");

    // Small delay to trigger CSS transitions
    setTimeout(() => {
      overlay.classList.remove("opacity-0");
      overlay.classList.add("opacity-100");
      mobileMenu.classList.remove("translate-x-full");
      mobileMenu.classList.add("translate-x-0");
    }, 10);

    // Lock scroll on both html and body
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.width = "100%";
  };

  const closeMenu = () => {
    overlay.classList.remove("opacity-100");
    overlay.classList.add("opacity-0");
    mobileMenu.classList.remove("translate-x-0");
    mobileMenu.classList.add("translate-x-full");

    // Add hidden after transition completes
    setTimeout(() => {
      overlay.classList.add("hidden");
      mobileMenu.classList.add("hidden");
    }, 500); // Match duration-500

    // Unlock scroll
    document.documentElement.style.overflow = "";
    document.body.style.overflow = "";
    document.body.style.position = "";
    document.body.style.width = "";
    // Optionally reset inline styles so they don't persist if other logic changes
    try {
      overlay.style.pointerEvents = '';
      // keep position fixed during close to allow transition out; remove zIndex after hidden
      setTimeout(() => {
        overlay.style.zIndex = '';
        mobileMenu.style.zIndex = '';
      }, 600);
    } catch (e) {
      // swallow
    }
  };

  menuBtn.addEventListener("click", openMenu);
  closeBtn.addEventListener("click", closeMenu);

  // Prevent any scroll or interaction on overlay, only close
  overlay.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    closeMenu();
  });

  // Prevent scroll on overlay
  overlay.addEventListener("touchmove", (e) => {
    e.preventDefault();
  }, { passive: false });

  overlay.addEventListener("wheel", (e) => {
    e.preventDefault();
  }, { passive: false });

  // Close menu when clicking a link
  mobileMenu.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", closeMenu);
  });
};

// Initialize Homepage
const init = async () => {
  await Promise.all([
    loadComponent("#header", "component/header.html"),
    loadComponent("#footer", "component/footer.html"),
    loadComponent("#carousel", "component/carousel.html"),
    loadComponent("#donate", "component/donate.html"),
    loadComponent("#partners", "component/partners.html")
  ]);

  await loadPosts("#posts", allPosts, 6);
  initCarousel();
  initMobileMenu();
};

init();
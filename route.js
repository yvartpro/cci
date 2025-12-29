/**
 * CCI Website Routing and Component Loading
 */

const loadComponent = async (selector, filePath) => {
  try {
    const url = filePath.startsWith('/') ? filePath : new URL(filePath, import.meta.url).href;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to load ${url}`);
    const html = await response.text();
    const container = document.querySelector(selector);
    if (container) {
      container.innerHTML = html;
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
 * Loads and renders 6 blog posts
 */
const loadPosts = async () => {
  const postsContainer = document.querySelector("#posts");
  if (!postsContainer) return;

  // Import posts data (module-relative)
  const { getAllPosts } = await import(new URL('./data/posts-data.js', import.meta.url).href);
  const allPosts = getAllPosts();
  const mockPosts = allPosts.slice(0, 6);

  postsContainer.innerHTML = mockPosts.map(post => `
    <article class="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 border border-slate-100 flex flex-col h-full group">
      <div class="relative h-64 overflow-hidden">
        <img src="${post.image}" alt="${post.title}" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110">
        <div class="absolute top-4 left-4">
          <span class="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-white/90 backdrop-blur text-blue-700 shadow-sm">${post.category}</span>
        </div>
      </div>
      <div class="p-8 flex-grow">
        <div class="text-xs font-bold text-slate-400 mb-4 uppercase tracking-widest">${post.date}</div>
        <h3 class="text-2xl font-bold text-slate-900 group-hover:text-blue-700 transition-colors leading-tight mb-4">${post.title}</h3>
        <p class="text-slate-500 text-sm leading-relaxed">${post.excerpt}</p>
      </div>
      <div class="px-8 pb-8 pt-4">
        <a href="post-detail/?id=${post.id}" class="inline-flex items-center text-xs font-black uppercase tracking-widest text-blue-600 hover:text-emerald-600 transition-colors group/link">
          Lire la suite
          <svg class="w-4 h-4 ml-2 transition-transform group-hover/link:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
        </a>
      </div>
    </article>
  `).join('');
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

  await loadPosts();
  initCarousel();
  initMobileMenu();
};

init();

export const title = "CCI Rumonge – Centre Communautaire d'Iteba";
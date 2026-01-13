import { formatDate } from "../utils.js";

/**
 * Loads an HTML component into a container
 * @param {string} selector - CSS selector for the container
 * @param {string} filePath - Path to the HTML file to load
 */
export const loadComponent = async (selector, filePath) => {
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
 * Initializes the mobile menu toggle functionality
 */
export const initMobileMenu = () => {
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

/**
 * Loads and renders blog posts
 * @param {string} selector - CSS selector for the posts container
 * @param {Array} posts - Array of post objects to display
 * @param {number} limit - Maximum number of posts to display (default: 6)
 */
export const loadPosts = async (selector, posts, limit = 6) => {
  const postsContainer = document.querySelector(selector);

  if (!postsContainer) {
    console.error("Posts container not found:", selector);
    return;
  }

  if (!posts || posts.length === 0) {
    postsContainer.innerHTML = "<p>No posts found.</p>";
    return;
  }

  const slicedPosts = posts.slice(0, limit);

  postsContainer.innerHTML = slicedPosts.map(post => `
    <article class="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 border border-slate-100 flex flex-col h-full group">
      <div class="relative h-64 overflow-hidden">
        <img src="${post.hero_url}" alt="${post.title}" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110">
        <div class="absolute top-4 left-4">
          <span class="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-white/90 backdrop-blur text-blue-700 shadow-sm">
            ${post.category}
          </span>
        </div>
      </div>
      <div class="p-8 flex-grow">
        <div class="text-xs font-bold text-slate-400 mb-4 uppercase tracking-widest">
          ${formatDate(post.createdAt)} | ${post.views_count} views
        </div>
        <h3 class="text-2xl font-bold text-slate-900 group-hover:text-blue-700 transition-colors leading-tight mb-4">
          ${post.title}
        </h3>
      </div>
      <div class="px-8 pb-8 pt-4">
        <a href="post-detail/?id=${post.id}" class="inline-flex items-center text-xs font-black uppercase tracking-widest text-blue-600 hover:text-emerald-600 transition-colors">
          Lire la suite →
        </a>
      </div>
    </article>
  `).join("");
};

/**
 * Loads and renders carousel slides
 * @param {string} innerSelector - CSS selector for the carousel inner container
 * @param {string} dotsSelector - CSS selector for the dots container
 */
export const loadCarousel = async (innerSelector, dotsSelector) => {
  const inner = document.querySelector(innerSelector);
  const dotsContainer = document.querySelector(dotsSelector);

  if (!inner) {
    console.error("Carousel inner container not found:", innerSelector);
    return;
  }

  try {
    const resp = await fetch('https://capbio.bi/cci/api/carousel');
    if (!resp.ok) throw new Error('Failed to fetch carousel data');
    const slidesData = await resp.json();

    if (!slidesData || slidesData.length === 0) {
      inner.innerHTML = '<div class="min-w-full h-full flex items-center justify-center text-slate-500">No content available</div>';
      return;
    }

    // Render slides
    inner.innerHTML = slidesData.map((slide, index) => `
      <div class="min-w-full h-full relative ${index !== slidesData.length - 1 ? 'border-r border-white/10' : ''} overflow-hidden">
        <img src="${slide.image_url}" alt="${slide.title}" class="w-full h-full object-cover">
        <div class="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent flex items-end p-12">
          <div class="max-w-2xl">
            <h3 class="text-4xl font-bold text-white mb-4">${slide.title}</h3>
            <p class="text-slate-200 text-lg">${slide.excerpt}</p>
          </div>
        </div>
      </div>
    `).join("");

    // Render dots if container exists
    if (dotsContainer) {
      dotsContainer.innerHTML = slidesData.map((_, index) => `
        <div class="dot w-2 h-2 rounded-full bg-white/40 cursor-pointer transition-all ${index === 0 ? 'bg-blue-500 w-8' : ''}" data-index="${index}"></div>
      `).join("");
    }

    return slidesData.length;
  } catch (err) {
    console.error("Error loading carousel:", err.message);
    return 0;
  }
};

/**
 * Initializes the carousel slider logic
 * @param {Object} config - Configuration for the carousel
 */
export const initCarouselSlider = (config = {}) => {
  const {
    innerSelector = "#carousel-inner",
    nextSelector = "#next-btn",
    prevSelector = "#prev-btn",
    dotSelector = ".dot",
    autoPlayInterval = 4000
  } = config;

  const inner = document.querySelector(innerSelector);
  const nextBtn = document.querySelector(nextSelector);
  const prevBtn = document.querySelector(prevSelector);

  if (!inner || !nextBtn || !prevBtn) return;

  let currentIndex = 0;
  let autoPlayTimer = null;

  const updateSlider = () => {
    const slides = inner.children;
    const slideCount = slides.length;
    if (slideCount === 0) return;

    currentIndex = (currentIndex + slideCount) % slideCount;
    inner.style.transform = `translateX(-${currentIndex * 100}%)`;

    // Update dots
    const dots = document.querySelectorAll(dotSelector);
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

  const startAutoPlay = () => {
    stopAutoPlay();
    autoPlayTimer = setInterval(() => {
      currentIndex++;
      updateSlider();
    }, autoPlayInterval);
  };

  const stopAutoPlay = () => {
    if (autoPlayTimer) clearInterval(autoPlayTimer);
  };

  nextBtn.addEventListener("click", () => {
    stopAutoPlay();
    currentIndex++;
    updateSlider();
    startAutoPlay();
  });

  prevBtn.addEventListener("click", () => {
    stopAutoPlay();
    currentIndex--;
    updateSlider();
    startAutoPlay();
  });

  // Dot clicks
  document.addEventListener("click", (e) => {
    if (e.target.classList.contains("dot")) {
      stopAutoPlay();
      currentIndex = parseInt(e.target.dataset.index);
      updateSlider();
      startAutoPlay();
    }
  });

  // Pause on hover
  inner.addEventListener("mouseenter", stopAutoPlay);
  inner.addEventListener("mouseleave", startAutoPlay);

  updateSlider();
  startAutoPlay();
};



/**
 * Loads and renders partners
 * @param {string} selector - CSS selector for the partners grid container
 * @param {Array} partners - Array of partner objects to display
 */
export const loadPartners = async (selector, partners) => {
  const container = document.querySelector(selector);
  if (!container) return;

  if (!partners || partners.length === 0) {
    container.innerHTML = `
      <div class="col-span-full text-center py-10">
        <p class="text-slate-400 text-sm italic tracking-wide">Aucun partenaire à afficher pour le moment.</p>
      </div>`;
    return;
  }

  // Utilisation d'une grille CSS plutôt que Flex pour un meilleur alignement
  container.className = "grid grid-cols-2 md:grid-cols-3 lg:flex lg:flex-wrap justify-center gap-8 md:gap-12";

  container.innerHTML = partners.map(partner => `
    <div class="group relative flex flex-col items-center justify-center p-10 transition-all duration-1000 w-full lg:w-72">
      
      <!-- Glassy Floating Base -->
      <div class="absolute inset-4 bg-white/40 backdrop-blur-md rounded-[2.5rem] border border-white/50 opacity-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700 shadow-[0_40px_80px_rgba(0,0,0,0.03)] -z-10"></div>

      <!-- Logo Container -->
      <div class="h-24 w-full flex items-center justify-center transition-all duration-700 opacity-60 group-hover:opacity-100 group-hover:-translate-y-4">
        <img 
          src="${partner.image_url}" 
          alt="${partner.nom}" 
          class="max-h-full max-w-[160px] object-contain transition-all duration-700 group-hover:brightness-110"
        >
      </div>

      <!-- Modern Label (Floating above) -->
      <div class="absolute -top-4 left-1/2 -translate-x-1/2 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 pointer-events-none">
        <span class="whitespace-nowrap bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[9px] px-5 py-2 rounded-full font-black uppercase tracking-[0.2em] shadow-xl shadow-blue-500/30">
          ${partner.sigle || partner.nom}
        </span>
      </div>

      <!-- Interactive Dot Indicator -->
      <div class="absolute bottom-6 left-1/2 -translate-x-1/2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-all duration-700">
        <div class="w-1 h-1 bg-blue-600 rounded-full animate-pulse"></div>
        <div class="w-1 h-1 bg-indigo-400 rounded-full animate-pulse delay-75"></div>
        <div class="w-1 h-1 bg-emerald-400 rounded-full animate-pulse delay-150"></div>
      </div>
    </div>
  `).join("");
};

/**
 * Loads and renders comitards (committee members)
 * @param {string} selector - CSS selector for the comitards container
 */
export const loadComitards = async (selector) => {
  const container = document.querySelector(selector);
  if (!container) return;

  try {
    const resp = await fetch('https://capbio.bi/cci/api/comitard');
    if (!resp.ok) throw new Error('Failed to fetch comitards data');
    const data = await resp.json();

    if (!data || data.length === 0) {
      container.innerHTML = "";
      return;
    }

    // Sort by titre.ordre (ascending)
    const sortedData = [...data].sort((a, b) => {
      const orderA = a.titre?.ordre ?? 999;
      const orderB = b.titre?.ordre ?? 999;
      return orderA - orderB;
    });

    const getInitials = (name) => {
      if (!name) return 'C';
      return name
        .split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    };


    container.innerHTML = `
      <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        ${sortedData.map(member => {
      const initials = getInitials(member.name);
      const displayImage = member.image_url || member.image?.url;
      const displayTitle = member.titre?.name;
      const links = Array.isArray(member.links) ? member.links : [];

      return `
            <div class="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col h-full hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2 group">
              <div class="mb-6 flex justify-center">
                ${displayImage ? `
                  <img
                    src="${displayImage}"
                    alt="${member.name}"
                    class="w-32 h-32 rounded-full object-cover border-4 border-blue-50 shadow-lg"
                  />
                ` : `
                  <div class="w-32 h-32 bg-gradient-to-br from-blue-500 to-indigo-700 rounded-full flex items-center justify-center text-white font-black text-3xl shadow-lg">
                    ${initials}
                  </div>
                `}
              </div>

              <div class="text-center mb-6">
                <h3 class="text-2xl font-bold text-slate-900 mb-2">${member.name}</h3>
                ${displayTitle ? `
                  <p class="text-sm text-blue-600 font-black tracking-[0.2em] uppercase">
                    ${displayTitle}
                  </p>
                ` : ''}
              </div>

              <div class="flex flex-wrap justify-center gap-2 mb-6 min-h-[40px]">
                ${links.length > 0 ? links.map(link => `
                  <a
                    href="${link.url}"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-bold text-slate-600 hover:bg-slate-100 hover:border-slate-200 transition-all shadow-sm"
                  >
                    <svg class="w-2.5 h-2.5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    ${link.label || 'Lien'}
                  </a>
                `).join('') : `
                  <span class="text-[10px] text-slate-300 font-medium uppercase tracking-widest self-center">Aucun lien</span>
                `}
              </div>

              ${member.cv ? `
                <div class="mt-auto pt-6 border-t border-slate-50 relative">
                  <div class="cv-content prose prose-slate max-w-none text-slate-600 text-sm leading-relaxed line-clamp-3 transition-all duration-500 overflow-hidden">
                    ${member.cv}
                  </div>
                  <button 
                    class="cv-toggle-btn mt-4 text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 hover:text-emerald-600 transition-colors flex items-center gap-1"
                  >
                    <span>Voir plus</span>
                    <svg class="w-3 h-3 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>
              ` : ''}
            </div>
          `;
    }).join('')}
      </div>
    `;

    // Add toggle functionality
    container.querySelectorAll('.cv-toggle-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const content = btn.previousElementSibling;
        const icon = btn.querySelector('svg');
        const text = btn.querySelector('span');

        if (content.classList.contains('line-clamp-3')) {
          content.classList.remove('line-clamp-3');
          text.textContent = 'Voir moins';
          icon.style.transform = 'rotate(180deg)';
        } else {
          content.classList.add('line-clamp-3');
          text.textContent = 'Voir plus';
          icon.style.transform = 'rotate(0deg)';
        }
      });
    });

  } catch (err) {
    console.error("Error loading comitards:", err.message);
  }
};

/**
 * CCI Website Routing and Component Loading
 */
import { posts as allPosts } from './data/posts-data.js';
import { loadPosts, loadComponent, initMobileMenu } from './component/script.js';



export const API_BASE_URL = 'https://capbio.bi/cci/api';

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


// Initialize Homepage
const init = async () => {
  await Promise.all([
    loadComponent("#header", "./header.html"),
    loadComponent("#footer", "./footer.html"),
    loadComponent("#carousel", "./carousel.html"),
    loadComponent("#donate", "./donate.html"),
    loadComponent("#partners", "./partners.html")
  ]);

  await loadPosts("#posts", allPosts, 6);
  initCarousel();
  initMobileMenu();
};

init();
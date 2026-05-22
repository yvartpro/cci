/**
 * CCI Website Routing and Component Loading
 */
import { posts as allPosts } from './data/posts-data.js';
import { loadPosts, loadComponent, loadCarousel, loadPartners, initCarouselSlider, initMobileMenu } from './component/script.js';
import { getFiles } from './data/posts-data.js';
import { partners } from './data/partners-data.js';
import { API_BASE_URL } from './config.js';

export { API_BASE_URL };

export const files = await getFiles();
const hero_image = files.find(f => f.use_as === 'hero');

const heroImage = document.getElementById("hero-image");
if (heroImage && hero_image?.url) heroImage.src = hero_image.url;

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
  await loadCarousel("#carousel-inner", "#carousel-dots");
  await loadPartners("#partners-grid", partners);
  initCarouselSlider();
  initMobileMenu();
};

init();

/**
 * CCI Website Routing and Component Loading
 */
import { posts as allPosts } from './data/posts-data.js';
import { loadPosts, loadComponent, loadCarousel, initCarouselSlider, initMobileMenu } from './component/script.js';



export const API_BASE_URL = 'https://capbio.bi/cci/api';

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
  initCarouselSlider();
  initMobileMenu();
};

init();
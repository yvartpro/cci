/**
 * CCI Website Routing and Component Loading
 */
import { posts as allPosts } from './data/posts-data.js';
import { loadPosts, loadComponent, loadCarousel, initCarouselSlider, initMobileMenu } from './component/script.js';
import { getFiles } from './data/posts-data.js';

export const API_BASE_URL = 'https://capbio.bi/cci/api';

const files = await getFiles();
export const hero_image = files.find(f => f.use_as === 'hero');
export const presentation_image = files.find(f => f.use_as === 'presentation');
export const volunteer_image = files.find(f => f.use_as === 'volunteer');
export const social_image = files.find(f => f.use_as === 'social');
export const lastar_image = files.find(f => f.use_as === 'lastar');
export const invest_image = files.find(f => f.use_as === 'invest');

console.log(hero_image, social_image)
const heroImage = document.getElementById("hero-image");
if (heroImage && hero_image?.url) heroImage.src = hero_image.url;
const investImage = document.getElementById("invest-image");
if (investImage && invest_image?.url) investImage.src = invest_image.url;
const lastarImage = document.getElementById("lastar-image");
if (lastarImage && lastar_image?.url) lastarImage.src = lastar_image.url;
const socialImage = document.getElementById("social-image");
if (socialImage && social_image?.url) socialImage.src = social_image.url;
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
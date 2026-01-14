/**
 * CCI Website Routing and Component Loading
 */
import { posts as allPosts } from './data/posts-data.js';
import { loadPosts, loadComponent, loadCarousel, loadPartners, initCarouselSlider, initMobileMenu } from './component/script.js';
import { getFiles } from './data/posts-data.js';
import { partners } from './data/partners-data.js';

export const API_BASE_URL = 'https://capbio.bi/cci/api';

const files = await getFiles();
export const hero_image = files.find(f => f.use_as === 'hero');
export const presentation_image = files.find(f => f.use_as === 'presentation');
export const volunteer_image = files.find(f => f.use_as === 'volunteer');
export const social_image = files.find(f => f.use_as === 'social');
export const lastar_image = files.find(f => f.use_as === 'lastar');
export const invest_image = files.find(f => f.use_as === 'invest');
export const activities_image = files.find(f => f.use_as === 'activities');
export const contact_image = files.find(f => f.use_as === 'contact');
export const news_image = files.find(f => f.use_as === 'news');


const heroImage = document.getElementById("hero-image");
if (heroImage && hero_image?.url) heroImage.src = hero_image.url;
const investImage = document.getElementById("invest-image");
if (investImage && invest_image?.url) investImage.src = invest_image.url;
const activitiesImage = document.getElementById("activities-image");
if (activitiesImage && activities_image?.url) activitiesImage.src = activities_image.url;
const lastarImage = document.getElementById("lastar-image");
if (lastarImage && lastar_image?.url) lastarImage.src = lastar_image.url;
const socialImage = document.getElementById("social-image");
if (socialImage && social_image?.url) socialImage.src = social_image.url;
const contactImage = document.getElementById("contact-image");
if (contactImage && contact_image?.url) contactImage.src = contact_image.url;
const newsImage = document.getElementById("news-image");
if (newsImage && news_image?.url) newsImage.src = news_image.url;

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
import { getActivityBasedPots } from '../data/posts-data.js'
import { loadComponent, initMobileMenu } from './component/script.js';
import { files } from '/cci/route.js'

const investPosts = getActivityBasedPots("CCI Social")

const init = async () => {
    const social_image = files.find(f => f.use_as === 'social');
    const socialImage = document.getElementById("social-image");
    socialImage.src = social_image.url;
    const contact_image = files.find(f => f.use_as === 'contact');
    const contactImage = document.getElementById("contact-image");
    contactImage.src = contact_image.url;
    await Promise.all([
        loadComponent("#header", "./header.html"),
        loadComponent("#footer", "./footer.html")
    ]);

    initMobileMenu();
};

init();
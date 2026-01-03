import { getActivityBasedPots } from '../data/posts-data.js';
import { loadPosts } from '../component/script.js';

const init = async () => {
    const investPosts = getActivityBasedPots("LaSTAR");

    console.log("Filtered posts:", investPosts);

    await loadPosts("#posts-lastar", investPosts, 3);
};

init();

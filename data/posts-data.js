const fetchPosts = async () => {
    const resp = await fetch('https://capbio.bi/cci/api/articles');
    const data = await resp.json();
    return data;
}

const fetchPost = async (id) => {
    const resp = await fetch(`https://capbio.bi/cci/api/articles/${id}`);
    const data = await resp.json();
    return data;
}
export const posts = await fetchPosts()
export const getPostById = async (id) => {
    return await fetchPost(id)
};

export const getRelatedPosts = (currentId, limit = 4) => {
    const currentPost = posts.find(post => post.id == currentId)
    return posts
        .filter(post => post.category == currentPost.category && post.id !== parseInt(currentId))
        .slice(0, limit);
};

export const getAllPosts = () => {
    return posts;
};
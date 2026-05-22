import { API_BASE_URL } from '../config.js';

const fetchPosts = async () => {
    const resp = await fetch(`${API_BASE_URL}/articles`);
    const data = await resp.json();
    return data;
}

const fetchPost = async (id) => {
    const resp = await fetch(`${API_BASE_URL}/articles/${id}`);
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

export const getFiles = async () => {
    const resp = await fetch(`${API_BASE_URL}/files`);
    const data = await resp.json();
    return data;
}

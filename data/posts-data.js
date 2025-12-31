// Mock post database
const fetchPosts = async () => {
  const resp = await fetch('http://localhost:5000/api/articles');
  const data = await resp.json();
  return data;
}
export const posts = await fetchPosts()
console.log("Loaded posts data:", posts);
// Get post by ID
export const getPostById = (id) => {
    return posts.find(post => post.id === parseInt(id));
};

// Get related posts (exclude current post)
export const getRelatedPosts = (currentId, limit = 4) => {
    return posts
        .filter(post => post.id !== parseInt(currentId))
        .slice(0, limit);
};

// Get all posts for listing
export const getAllPosts = () => {
    return posts;
};

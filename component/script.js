export const loadPosts = async (selector, posts, limit = 6) => {
  const postsContainer = document.querySelector(selector);
  console.log(postsContainer)

  if (!postsContainer) {
    console.error("Posts container not found:", selector);
    return;
  }

  if (!posts || posts.length === 0) {
    postsContainer.innerHTML = "<p>No posts found.</p>";
    return;
  }

  const slicedPosts = posts.slice(0, limit);

  postsContainer.innerHTML = slicedPosts.map(post => `
    <article class="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 border border-slate-100 flex flex-col h-full group">
      <div class="relative h-64 overflow-hidden">
        <img src="${post.hero_url}" alt="${post.title}" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110">
        <div class="absolute top-4 left-4">
          <span class="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-white/90 backdrop-blur text-blue-700 shadow-sm">
            ${post.category}
          </span>
        </div>
      </div>
      <div class="p-8 flex-grow">
        <div class="text-xs font-bold text-slate-400 mb-4 uppercase tracking-widest">
          ${formatDate(post.createdAt)} | ${post.views_count} views
        </div>
        <h3 class="text-2xl font-bold text-slate-900 group-hover:text-blue-700 transition-colors leading-tight mb-4">
          ${post.title}
        </h3>
      </div>
      <div class="px-8 pb-8 pt-4">
        <a href="post-detail/?id=${post.id}" class="inline-flex items-center text-xs font-black uppercase tracking-widest text-blue-600 hover:text-emerald-600 transition-colors">
          Lire la suite →
        </a>
      </div>
    </article>
  `).join("");
};

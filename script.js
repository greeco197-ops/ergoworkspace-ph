/**
 * HomeOfficeHub — Client-Side Script
 * Loads posts dynamically from posts.json
 */

const POSTS_URL = './posts.json';

// ── Utility: escape HTML ──
function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// ── Utility: format date ──
function formatDate(dateStr) {
  const d = new Date(dateStr);
  if (isNaN(d)) return dateStr;
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

// ── Utility: truncate text ──
function truncate(str, max) {
  return str.length > max ? str.substring(0, max) + '...' : str;
}

// ── Homepage: Load all post previews ──
async function loadHomepage() {
  const postsList = document.getElementById('posts-list');
  if (!postsList) return;

  try {
    const res = await fetch(POSTS_URL);
    if (!res.ok) throw new Error('Failed to load posts');
    const posts = await res.json();

    if (!Array.isArray(posts) || posts.length === 0) {
      postsList.innerHTML = '<p class="loading">No posts yet. Check back soon!</p>';
      return;
    }

    // Sort by date descending (newest first)
    posts.sort((a, b) => new Date(b.date) - new Date(a.date));

    postsList.innerHTML = posts.map(post => `
      <article class="post-card">
        <h2><a href="post.html?slug=${encodeURIComponent(post.slug)}">${escapeHtml(post.title)}</a></h2>
        <div class="post-meta">${formatDate(post.date)} &bull; 5 min read</div>
        <div class="post-excerpt">${escapeHtml(post.excerpt)}</div>
        <a href="post.html?slug=${encodeURIComponent(post.slug)}" class="read-more">Read more &rarr;</a>
      </article>
    `).join('');

  } catch (err) {
    postsList.innerHTML = `<div class="error-box">Error loading posts: ${escapeHtml(err.message)}</div>`;
    console.error(err);
  }
}

// ── Single Post: Load full post ──
async function loadSinglePost() {
  const container = document.getElementById('post-content');
  if (!container) return;

  const params = new URLSearchParams(window.location.search);
  const slug = params.get('slug');

  if (!slug) {
    container.innerHTML = '<div class="error-box">No post specified. <a href="index.html">Go back home</a>.</div>';
    return;
  }

  try {
    const res = await fetch(POSTS_URL);
    if (!res.ok) throw new Error('Failed to load posts data');
    const posts = await res.json();
    const post = posts.find(p => p.slug === slug);

    if (!post) {
      container.innerHTML = '<div class="error-box">Post not found. <a href="index.html">Browse all posts</a>.</div>';
      return;
    }

    // Update page title and meta tags dynamically
    document.title = `${post.title} — HomeOfficeHub`;
    const metaTitle = document.getElementById('meta-title');
    const metaDesc = document.getElementById('meta-desc');
    const ogTitle = document.getElementById('og-title');
    const ogDesc = document.getElementById('og-desc');

    if (metaTitle) metaTitle.textContent = post.title;
    if (metaDesc) metaDesc.setAttribute('content', post.meta_description || post.excerpt);
    if (ogTitle) ogTitle.setAttribute('content', post.title);
    if (ogDesc) ogDesc.setAttribute('content', post.meta_description || post.excerpt);

    // Render post content
    container.innerHTML = `
      <h1>${escapeHtml(post.title)}</h1>
      <div class="post-meta">${formatDate(post.date)}</div>
      ${post.content}
    `;

    // Populate related posts sidebar
    const otherPosts = posts.filter(p => p.slug !== slug).slice(0, 5);
    const relatedDiv = document.getElementById('related-links');
    if (relatedDiv) {
      relatedDiv.innerHTML = otherPosts.map(p =>
        `<li><a href="post.html?slug=${encodeURIComponent(p.slug)}">${escapeHtml(p.title)}</a></li>`
      ).join('');
    }

  } catch (err) {
    container.innerHTML = `<div class="error-box">Error loading post: ${escapeHtml(err.message)}</div>`;
    console.error(err);
  }
}

// ── Initialize ──
if (window.location.pathname.includes('post.html')) {
  loadSinglePost();
} else {
  loadHomepage();
}

// Default load is general top news
async function fetchNews(path = 'news') {
    const container = document.getElementById('news-container');
    container.innerHTML = '<p style="text-align:center; width:100%;">Fetching the latest headlines...</p>';

    // Fix: If path is 'news', use the base news endpoint, otherwise use the sports path
    const url = path === 'news' 
        ? "https://site.api.espn.com/apis/site/v2/sports/news" 
        : `https://site.api.espn.com/apis/site/v2/sports/${path}/news`;

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Network response was not ok');
        
        const data = await response.json();
        
        // Some ESPN endpoints return 'articles', others might return 'headlines'
        const articles = data.articles || data.headlines || [];
        renderNews(articles);
    } catch (error) {
        console.error("News Fetch Error:", error);
        container.innerHTML = `<div style="text-align:center; width:100%; padding: 20px;">
            <p>Error loading news. This usually happens if the API is temporarily down.</p>
            <button onclick="fetchNews('${path}')" style="background:var(--color-secondary); color:white; border:none; padding:10px 20px; cursor:pointer; border-radius:5px;">Try Again</button>
        </div>`;
    }
}

function renderNews(articles) {
    const container = document.getElementById('news-container');
    container.innerHTML = '';

    if (!articles || articles.length === 0) {
        container.innerHTML = "No recent news found for this category.";
        return;
    }

    articles.forEach(article => {
        const card = document.createElement('div');
        card.className = 'news-card';

        // Find the best quality image or use a generic sports placeholder
        const img = article.images && article.images.length > 0 ? article.images[0].url : 'https://images.unsplash.com/photo-1504450758481-7338eba7524a?q=80&w=400';

        card.innerHTML = `
            <div class="news-img-wrap">
                <img src="${img}" alt="News Thumbnail">
            </div>
            <div class="news-content">
                <span class="news-date">${new Date(article.published).toLocaleDateString()}</span>
                <h3>${article.headline}</h3>
                <p>${article.description || 'Click to read the full story on ESPN.'}</p>
                <a href="${article.links.web.href}" target="_blank">Full Article →</a>
            </div>
        `;
        container.appendChild(card);
    });
}

// Initial Call
fetchNews();
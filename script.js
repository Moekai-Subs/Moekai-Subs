let allSubtitles = [];
const isAnimePage = window.location.pathname.includes('anime.html');

function getAnimeFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('anime');
}

// One-click download function
function downloadFile(url) {
    const a = document.createElement('a');
    a.href = url;
    a.download = '';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

async function loadSubtitles() {
    try {
        const response = await fetch('data/subtitles.json');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        allSubtitles = await response.json();
        
        if (isAnimePage) {
            renderAnimePage();
        } else {
            renderHomepage();
        }
        
    } catch (error) {
        console.error('Error loading subtitles:', error);
        const container = isAnimePage 
            ? document.getElementById('animeDetail')
            : document.getElementById('releaseList');
        
        container.innerHTML = `
            <div class="loading" style="color: #ff6b6b;">
                Error loading subtitles. Please try again later.
            </div>
        `;
    }
}

function renderHomepage() {
    const container = document.getElementById('releaseList');
    
    if (allSubtitles.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                No releases available
            </div>
        `;
        return;
    }
    
    const sortedSubs = [...allSubtitles].sort((a, b) => 
        new Date(b.updated) - new Date(a.updated)
    );
    
    const releasesHtml = sortedSubs.map(sub => {
        const badgeClass = sub.type.toLowerCase();
        const animeUrl = `anime.html?anime=${encodeURIComponent(sub.anime)}`;
        
        return `
            <div class="release-card" onclick="downloadFile('${sub.download}')">
                <span class="file-badge ${badgeClass}">${sub.type}</span>
                <div class="release-content">
                    <div class="release-info">
                        <a href="${animeUrl}" class="release-title" onclick="event.stopPropagation()">
                            ${sub.anime}
                        </a>
                        <span class="release-episode">${sub.episode}</span>
                    </div>
                    <span class="release-date">${sub.updated}</span>
                </div>
            </div>
        `;
    }).join('');
    
    container.innerHTML = releasesHtml;
}

function renderAnimePage() {
    const container = document.getElementById('animeDetail');
    const animeName = getAnimeFromURL();
    
    if (!animeName) {
        container.innerHTML = `
            <div class="empty-state">
                No anime specified
            </div>
        `;
        return;
    }
    
    const animeSubs = allSubtitles.filter(sub => sub.anime === animeName);
    
    if (animeSubs.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                No episodes found for "${animeName}"
            </div>
        `;
        return;
    }
    
    const sortedEps = [...animeSubs].sort((a, b) => 
        new Date(b.updated) - new Date(a.updated)
    );
    
    const headerHtml = `
        <div class="anime-header">
            <h1 class="anime-title">${animeName}</h1>
            <div class="anime-meta">${animeSubs.length} ${animeSubs.length === 1 ? 'episode' : 'episodes'}</div>
        </div>
    `;
    
    const episodesHtml = sortedEps.map(ep => {
        const badgeClass = ep.type.toLowerCase();
        
        return `
            <div class="episode-card" onclick="downloadFile('${ep.download}')">
                <span class="file-badge ${badgeClass}">${ep.type}</span>
                <div class="episode-info">
                    <span class="episode-name">${ep.episode}</span>
                    <span class="episode-date">${ep.updated}</span>
                </div>
            </div>
        `;
    }).join('');
    
    container.innerHTML = headerHtml + `<div class="episode-list">${episodesHtml}</div>`;
}

document.addEventListener('DOMContentLoaded', loadSubtitles);
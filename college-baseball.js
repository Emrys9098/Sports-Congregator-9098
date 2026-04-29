async function getNCAABaseball() {
    const url = "https://site.api.espn.com/apis/site/v2/sports/baseball/college-baseball/scoreboard";
    try {
        const response = await fetch(url);
        const data = await response.json();
        renderNCAAGames(data.events);
    } catch (err) {
        document.getElementById('ncaa-baseball-container').innerHTML = "No live games found or API error.";
    }
}

function renderNCAAGames(events) {
    const container = document.getElementById('ncaa-baseball-container');
    container.innerHTML = '';

    if (!events || events.length === 0) {
        container.innerHTML = "No games scheduled for today.";
        return;
    }

    events.forEach(event => {
        const game = event.competitions[0];
        const home = game.competitors.find(c => c.homeAway === 'home');
        const away = game.competitors.find(c => c.homeAway === 'away');
        const state = event.status.type.name;

        // Check for Rankings
        const homeRank = home.curatedRank?.current <= 25 ? home.curatedRank.current : '';
        const awayRank = away.curatedRank?.current <= 25 ? away.curatedRank.current : '';

        const card = document.createElement('div');
        card.className = `game-card game-${state}`;
        
        card.innerHTML = `
            <div class="game-info">
                ${state === 'STATUS_IN_PROGRESS' ? '<span class="live-indicator">● LIVE</span> | ' : ''}
                ${event.status.type.detail}
            </div>
            <div class="team-row">
                <span class="team-name-wrapper">
                    <img src="${away.team.logo || 'placeholder.png'}" class="team-logo"> 
                    <small>${awayRank}</small> ${away.team.displayName}
                </span>
                <span class="score">${away.score}</span>
            </div>
            <div class="team-row">
                <span class="team-name-wrapper">
                    <img src="${home.team.logo || 'placeholder.png'}" class="team-logo"> 
                    <small>${homeRank}</small> ${home.team.displayName}
                </span>
                <span class="score">${home.score}</span>
            </div>
        `;
        container.appendChild(card);
    });
}

getNCAABaseball();
setInterval(getNCAABaseball, 60000); // Refresh once a minute
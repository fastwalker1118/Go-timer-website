document.addEventListener('DOMContentLoaded', async () => {
    const usernameDisplay = document.getElementById('usernameDisplay');
    const logoutButton = document.getElementById('logoutButton');
    const startGameButton = document.getElementById('startGameButton');
    const gamesList = document.getElementById('gamesList');
    const mainTimeInput = document.getElementById('mainTime');
    const byoYomiTimeInput = document.getElementById('byoYomiTime');
    const byoYomiPeriodsInput = document.getElementById('byoYomiPeriods');

    // Set default guest user
    if (usernameDisplay) {
        usernameDisplay.textContent = 'Guest User';
    }

    // Hide logout button since no authentication
    if (logoutButton) {
        logoutButton.style.display = 'none';
    }

    // Load recent games
    await loadRecentGames();

    // Preset buttons functionality
    const presetButtons = document.querySelectorAll('.preset-btn');
    presetButtons.forEach(button => {
        button.addEventListener('click', () => {
            const mainTime = button.getAttribute('data-main');
            const byoyomiTime = button.getAttribute('data-byoyomi');
            const periods = button.getAttribute('data-periods');
            
            mainTimeInput.value = mainTime;
            byoYomiTimeInput.value = byoyomiTime;
            byoYomiPeriodsInput.value = periods;
            
            // Add visual feedback
            button.style.transform = 'scale(0.95)';
            setTimeout(() => {
                button.style.transform = '';
            }, 150);
        });
    });

    // Logout functionality
    logoutButton.addEventListener('click', async () => {
        try {
            await fetch('/api/auth/logout', {
                method: 'POST',
                credentials: 'include'
            });
            window.location.href = '/login.html';
        } catch (error) {
            console.error('Error logging out:', error);
        }
    });

    // Start game functionality
    startGameButton.addEventListener('click', async () => {
        const mainTime = parseInt(mainTimeInput.value);
        const byoYomiTime = parseInt(byoYomiTimeInput.value);
        const byoYomiPeriods = parseInt(byoYomiPeriodsInput.value);

        // Validate inputs
        if (mainTime < 1 || mainTime > 180) {
            showNotification('Main time must be between 1 and 180 minutes', 'error');
            return;
        }
        if (byoYomiTime < 5 || byoYomiTime > 300) {
            showNotification('Byo-yomi time must be between 5 and 300 seconds', 'error');
            return;
        }
        if (byoYomiPeriods < 1 || byoYomiPeriods > 10) {
            showNotification('Byo-yomi periods must be between 1 and 10', 'error');
            return;
        }

        // Add loading state
        startGameButton.disabled = true;
        startGameButton.innerHTML = 'Creating Game...';

        try {
            // Generate a unique game ID for local storage
            const gameId = 'game_' + Date.now();

            // Store game settings in sessionStorage
            sessionStorage.setItem('gameSettings', JSON.stringify({
                gameId,
                mainTime,
                byoYomiTime,
                byoYomiPeriods
            }));

            // Navigate to timer page
            window.location.href = '/timer.html';
        } catch (error) {
            console.error('Error creating game:', error);
            showNotification('Error creating game. Please try again.', 'error');
            resetStartButton();
        }
    });

    function resetStartButton() {
        startGameButton.disabled = false;
        startGameButton.innerHTML = 'Start Game';
    }

    function showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        // Style the notification
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            background: type === 'error' ? '#dc3545' : '#28a745',
            color: 'white',
            padding: '15px 20px',
            borderRadius: '10px',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
            zIndex: '10000',
            transform: 'translateX(100%)',
            transition: 'transform 0.3s ease'
        });
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    async function loadRecentGames() {
        try {
            // Load from local storage first
            const localGames = loadGamesFromLocalStorage();
            
            // Try to load from backend if not guest
            let backendGames = [];
            try {
                const response = await fetch('/api/games', {
                    credentials: 'include'
                });

                if (response.ok) {
                    backendGames = await response.json();
                }
            } catch (error) {
                console.log('Backend games not available, using local storage only');
            }

            // Combine and deduplicate games
            const allGames = [...localGames, ...backendGames];
            const uniqueGames = allGames.filter((game, index, self) => 
                index === self.findIndex(g => g.game_id === game.game_id)
            );

            // Sort by date (most recent first)
            uniqueGames.sort((a, b) => new Date(b.last_played || b.savedAt) - new Date(a.last_played || a.savedAt));

            displayGames(uniqueGames);
        } catch (error) {
            console.error('Error loading games:', error);
            // Fallback to local storage only
            const localGames = loadGamesFromLocalStorage();
            displayGames(localGames);
        }
    }

    function loadGamesFromLocalStorage() {
        try {
            const savedGames = JSON.parse(localStorage.getItem('savedGames') || '[]');
            return savedGames.map(game => ({
                game_id: game.id || game.gameId || Date.now().toString(),
                title: game.title || 'Untitled Game',
                last_played: game.savedAt || new Date().toISOString(),
                move_count: game.moves ? game.moves.length : 0,
                duration: game.moves ? game.moves.reduce((total, move) => total + (move.timeUsed || 0), 0) : 0,
                moves: game.moves || [],
                comment: game.comment || '',
                settings: game.settings || {}
            }));
        } catch (error) {
            console.error('Error loading from local storage:', error);
            return [];
        }
    }

    function displayGames(games) {
        if (games.length === 0) {
            gamesList.innerHTML = `
                <div class="no-games">
                    <p>No games played yet</p>
                    <small>Start your first game to see history here</small>
                </div>
            `;
            return;
        }

        const gamesHtml = games.slice(0, 5).map(game => `
            <div class="game-item">
                <div class="game-details">
                    <div class="game-title">${game.title || 'Go Game'}</div>
                    <div class="game-meta">
                        ${new Date(game.last_played || game.savedAt).toLocaleDateString()} • 
                        ${game.move_count} moves • 
                        ${formatDuration(game.duration || 0)}
                        ${game.comment ? ' • ' + game.comment.substring(0, 30) + (game.comment.length > 30 ? '...' : '') : ''}
                    </div>
                </div>
                <div class="game-actions">
                    <button onclick="viewGame('${game.game_id}')" class="game-view-btn">
                        View
                    </button>
                    <button onclick="deleteGame('${game.game_id}')" class="game-delete-btn">
                        Delete
                    </button>
                </div>
            </div>
        `).join('');

        gamesList.innerHTML = gamesHtml;
    }

    // Add deleteGame function
    window.deleteGame = function(gameId) {
        if (confirm('Are you sure you want to delete this game? This action cannot be undone.')) {
            // Remove from local storage
            const savedGames = JSON.parse(localStorage.getItem('savedGames') || '[]');
            const updatedGames = savedGames.filter(game => (game.id || game.gameId) !== gameId);
            localStorage.setItem('savedGames', JSON.stringify(updatedGames));
            
            // Reload the games list
            loadRecentGames();
            showNotification('Game deleted successfully', 'success');
        }
    };

    function formatDuration(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    // Make viewGame function global
    window.viewGame = function(gameId) {
        // Load game data from local storage
        const savedGames = JSON.parse(localStorage.getItem('savedGames') || '[]');
        const game = savedGames.find(g => (g.id || g.gameId) === gameId);
        
        if (game && game.moves) {
            showGameHistoryModal(game);
        } else {
            showNotification('Game data not found', 'error');
        }
    };

    function showGameHistoryModal(game) {
        // Create modal HTML
        const modalHtml = `
            <div class="history-modal-overlay" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 10000; display: flex; align-items: center; justify-content: center;">
                <div class="history-modal-content" style="background: #2c2c2e; border-radius: 20px; padding: 30px; max-width: 600px; width: 90%; max-height: 80%; overflow-y: auto;">
                    <div class="modal-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                        <h2 style="color: white; margin: 0;">${game.title || 'Game History'}</h2>
                        <button onclick="closeGameHistoryModal()" style="background: #ff3b30; color: white; border: none; border-radius: 50%; width: 30px; height: 30px; cursor: pointer;">×</button>
                    </div>
                    <div class="game-info" style="color: #8e8e93; margin-bottom: 20px;">
                        <p>Date: ${new Date(game.savedAt).toLocaleDateString()}</p>
                        <p>Total Moves: ${game.moves.length}</p>
                        <p>Duration: ${formatDuration(game.moves.reduce((total, move) => total + (move.timeUsed || 0), 0))}</p>
                        ${game.comment ? `<p>Comment: ${game.comment}</p>` : ''}
                    </div>
                    <div class="moves-list" style="background: #1c1c1e; border-radius: 10px; padding: 20px;">
                        <h3 style="color: white; margin-top: 0;">Move History</h3>
                        ${game.moves.map(move => `
                            <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #3a3a3c; color: white;">
                                <span>Move ${move.moveNumber}: ${move.player}</span>
                                <span>${move.timeUsed}s</span>
                            </div>
                        `).join('')}
                    </div>
                    <div class="move-analysis" style="margin-top: 20px;">
                        <h3 style="color: white;">Move Time Analysis</h3>
                        <div style="background: #1c1c1e; border-radius: 10px; padding: 20px;">
                            ${game.moves.map((move, index) => `
                                <div style="display: flex; align-items: center; margin: 10px 0;">
                                    <span style="color: white; width: 80px;">Move ${move.moveNumber}</span>
                                    <div style="flex: 1; background: #3a3a3c; height: 20px; border-radius: 10px; margin: 0 10px; position: relative;">
                                        <div style="background: ${move.player === 'white' ? '#ffffff' : '#000000'}; height: 100%; width: ${Math.min(100, (move.timeUsed / Math.max(...game.moves.map(m => m.timeUsed))) * 100)}%; border-radius: 10px;"></div>
                                    </div>
                                    <span style="color: white; width: 40px;">${move.timeUsed}s</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Add modal to page
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    }

    window.closeGameHistoryModal = function() {
        const modal = document.querySelector('.history-modal-overlay');
        if (modal) {
            modal.remove();
        }
    };
});

// Add CSS for game items
const gameItemStyles = `
.game-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px;
    margin: 10px 0;
    background: #f8f9fa;
    border-radius: 12px;
    border: 1px solid #e9ecef;
    transition: all 0.3s;
}

.game-item:hover {
    background: #e9ecef;
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.game-details {
    display: flex;
    flex-direction: column;
    gap: 8px;
    flex: 1;
}

.game-title {
    font-weight: 600;
    color: #495057;
    font-size: 1.1em;
}

.game-meta {
    font-size: 0.9em;
    color: #6c757d;
}

.game-actions {
    display: flex;
    gap: 10px;
}

.game-view-btn, .game-delete-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    border: none;
    padding: 8px 15px;
    border-radius: 20px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s;
    font-size: 0.9em;
}

.game-view-btn {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
}

.game-view-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(102, 126, 234, 0.3);
}

.game-delete-btn {
    background: linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%);
    color: white;
}

.game-delete-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(255, 107, 107, 0.3);
}

.no-games {
    text-align: center;
    padding: 40px 20px;
    color: #6c757d;
}

.no-games-icon {
    font-size: 3em;
    display: block;
    margin-bottom: 15px;
}
`;

// Inject styles
const styleSheet = document.createElement('style');
styleSheet.textContent = gameItemStyles;
document.head.appendChild(styleSheet);


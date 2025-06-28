document.addEventListener('DOMContentLoaded', () => {
    // Game state - Initialize with black as current player (Go tradition)
    let gameState = {
        currentPlayer: 'black',  // Changed from 'white' to 'black'
        whiteTime: 0,
        blackTime: 0,
        whiteByoyomiTime: 0,
        blackByoyomiTime: 0,
        whiteByoyomiPeriods: 0,
        blackByoyomiPeriods: 0,
        whiteInByoyomi: false,
        blackInByoyomi: false,
        isPaused: false,
        gameId: null,
        moveNumber: 0,
        moves: [],
        lastMoveTime: null
    };

    let timerInterval = null;
    let currentUser = null;
    let utilityButton = null;

    // DOM elements
    const timerSection = document.querySelector('.timer-section');
    const whiteTimer = document.querySelector('.white-timer');
    const blackTimer = document.querySelector('.black-timer');
    const whiteTimerHalf = document.querySelector('#white-timer');
    const blackTimerHalf = document.querySelector('#black-timer');
    const utilityMenu = document.querySelector('.utility-menu');
    const historyModal = document.querySelector('.history-modal');
    const timeoutOverlay = document.querySelector('.timeout-overlay');

    // Initialize
    init();

    async function init() {
        try {
            // Try to get current user, but don't require authentication
            try {
                const response = await fetch('/api/auth/me', { credentials: 'include' });
                if (response.ok) {
                    currentUser = await response.json();
                } else {
                    // Set as guest user if not authenticated
                    currentUser = { username: 'Guest User' };
                }
            } catch (error) {
                // Set as guest user if authentication fails
                currentUser = { username: 'Guest User' };
            }

            // Get game settings from sessionStorage (set by settings page)
            const gameSettings = JSON.parse(sessionStorage.getItem('gameSettings') || '{}');
            
            // Set default values if no settings found
            gameState.whiteTime = (gameSettings.mainTime || 10) * 60;
            gameState.blackTime = (gameSettings.mainTime || 10) * 60;
            gameState.whiteByoyomiTime = gameSettings.byoYomiTime || 30;
            gameState.blackByoyomiTime = gameSettings.byoYomiTime || 30;
            gameState.whiteByoyomiPeriods = gameSettings.byoYomiPeriods || 3;
            gameState.blackByoyomiPeriods = gameSettings.byoYomiPeriods || 3;
            gameState.gameId = gameSettings.gameId;

            // Create utility button AFTER DOM elements are ready
            createUtilityButton();
            updateDisplay();
            updateLayout();
            startTimer();

        } catch (error) {
            console.error('Initialization error:', error);
        }
    }

    function createUtilityButton() {
        // Remove existing utility button if it exists
        if (utilityButton && utilityButton.parentNode) {
            utilityButton.parentNode.removeChild(utilityButton);
        }

        // Create utility button
        utilityButton = document.createElement('button');
        utilityButton.className = 'utility-button';
        utilityButton.innerHTML = '⋯';
        utilityButton.setAttribute('data-testid', 'utility-button');
        
        // Style the utility button with important declarations to override any CSS
        utilityButton.style.cssText = `
            position: fixed !important;
            top: 50% !important;
            right: 20px !important;
            transform: translateY(-50%) !important;
            background: rgba(0, 0, 0, 0.8) !important;
            color: white !important;
            border: none !important;
            border-radius: 50% !important;
            width: 60px !important;
            height: 60px !important;
            font-size: 24px !important;
            cursor: pointer !important;
            z-index: 9999 !important;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5) !important;
            transition: all 0.3s ease !important;
            display: block !important;
            visibility: visible !important;
            opacity: 1 !important;
        `;

        // Add hover effect
        utilityButton.addEventListener('mouseenter', () => {
            utilityButton.style.transform = 'translateY(-50%) scale(1.1) !important';
            utilityButton.style.background = 'rgba(0, 0, 0, 0.9) !important';
        });

        utilityButton.addEventListener('mouseleave', () => {
            utilityButton.style.transform = 'translateY(-50%) scale(1) !important';
            utilityButton.style.background = 'rgba(0, 0, 0, 0.8) !important';
        });

        // Add click event
        utilityButton.addEventListener('click', (e) => {
            e.stopPropagation();
            e.preventDefault();
            toggleUtilityMenu();
        });

        // Add to body immediately
        document.body.appendChild(utilityButton);
        
        console.log('Utility button created and added to body');
    }

    function startTimer() {
        if (timerInterval) clearInterval(timerInterval);
        
        gameState.lastMoveTime = Date.now();
        
        timerInterval = setInterval(() => {
            if (gameState.isPaused) return;

            if (gameState.currentPlayer === 'white') {
                if (gameState.whiteInByoyomi) {
                    gameState.whiteByoyomiTime--;
                    if (gameState.whiteByoyomiTime <= 0) {
                        gameState.whiteByoyomiPeriods--;
                        if (gameState.whiteByoyomiPeriods <= 0) {
                            showTimeout('white');
                            return;
                        }
                        // Reset byo-yomi time for next period
                        const gameSettings = JSON.parse(sessionStorage.getItem('gameSettings') || '{}');
                        gameState.whiteByoyomiTime = gameSettings.byoYomiTime || 30;
                    }
                } else {
                    gameState.whiteTime--;
                    if (gameState.whiteTime <= 0) {
                        gameState.whiteTime = 0;
                        gameState.whiteInByoyomi = true;
                        const gameSettings = JSON.parse(sessionStorage.getItem('gameSettings') || '{}');
                        gameState.whiteByoyomiTime = gameSettings.byoYomiTime || 30;
                    }
                }
            } else {
                if (gameState.blackInByoyomi) {
                    gameState.blackByoyomiTime--;
                    if (gameState.blackByoyomiTime <= 0) {
                        gameState.blackByoyomiPeriods--;
                        if (gameState.blackByoyomiPeriods <= 0) {
                            showTimeout('black');
                            return;
                        }
                        // Reset byo-yomi time for next period
                        const gameSettings = JSON.parse(sessionStorage.getItem('gameSettings') || '{}');
                        gameState.blackByoyomiTime = gameSettings.byoYomiTime || 30;
                    }
                } else {
                    gameState.blackTime--;
                    if (gameState.blackTime <= 0) {
                        gameState.blackTime = 0;
                        gameState.blackInByoyomi = true;
                        const gameSettings = JSON.parse(sessionStorage.getItem('gameSettings') || '{}');
                        gameState.blackByoyomiTime = gameSettings.byoYomiTime || 30;
                    }
                }
            }

            updateDisplay();
        }, 1000);
    }

    function makeMove() {
        if (gameState.isPaused) return;

        const moveTime = Math.floor((Date.now() - gameState.lastMoveTime) / 1000);
        gameState.moveNumber++;

        // Record move
        const move = {
            moveNumber: gameState.moveNumber,
            player: gameState.currentPlayer,
            timeUsed: moveTime,
            mainTime: gameState.currentPlayer === 'white' ? gameState.whiteTime : gameState.blackTime,
            byoyomiTime: gameState.currentPlayer === 'white' ? gameState.whiteByoyomiTime : gameState.blackByoyomiTime,
            byoyomiPeriods: gameState.currentPlayer === 'white' ? gameState.whiteByoyomiPeriods : gameState.blackByoyomiPeriods,
            inByoyomi: gameState.currentPlayer === 'white' ? gameState.whiteInByoyomi : gameState.blackInByoyomi,
            timestamp: new Date().toISOString()
        };

        gameState.moves.push(move);
        console.log('Move recorded:', move);

        // Reset byo-yomi time after move (this is the key fix)
        const gameSettings = JSON.parse(sessionStorage.getItem('gameSettings') || '{}');
        if (gameState.currentPlayer === 'white' && gameState.whiteInByoyomi) {
            gameState.whiteByoyomiTime = gameSettings.byoYomiTime || 30;
        } else if (gameState.currentPlayer === 'black' && gameState.blackInByoyomi) {
            gameState.blackByoyomiTime = gameSettings.byoYomiTime || 30;
        }

        // Always save to local storage for persistence
        saveToLocalStorage();

        // Save move to backend (if not guest)
        if (!currentUser.is_guest && gameState.gameId) {
            saveMoveToBackend(move);
        }

        // Switch players instantly
        gameState.currentPlayer = gameState.currentPlayer === 'white' ? 'black' : 'white';
        gameState.lastMoveTime = Date.now();

        // Update layout and display immediately
        updateLayout();
        updateDisplay();
    }

    // Save move to backend (if not guest) and local storage
    async function saveMoveToBackend(move) {
        // Always save to local storage for guests
        if (currentUser.is_guest) {
            saveToLocalStorage();
            return;
        }

        // For registered users, save to both backend and local storage
        try {
            await fetch(`/api/games/${gameState.gameId}/moves`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    move_number: move.moveNumber,
                    player_color: move.player,
                    time_taken: move.timeUsed,
                    main_time_remaining: move.mainTime,
                    byoyomi_time_remaining: move.byoyomiTime,
                    byoyomi_periods_remaining: move.byoyomiPeriods,
                    in_byoyomi: move.inByoyomi
                })
            });
            
            // Also save to local storage as backup
            saveToLocalStorage(move);
        } catch (error) {
            console.error('Error saving move to backend:', error);
            // Fallback to local storage
            saveToLocalStorage(move);
        }
    }

    function saveToLocalStorage() {
        try {
            const gameKey = `game_${gameState.gameId || 'current'}`;
            let gameData = JSON.parse(localStorage.getItem(gameKey) || '{}');
            
            gameData.moves = gameState.moves; // Save the entire moves array
            gameData.lastUpdated = new Date().toISOString();
            gameData.gameId = gameState.gameId;
            
            localStorage.setItem(gameKey, JSON.stringify(gameData));
        } catch (error) {
            console.error('Error saving to local storage:', error);
        }
    }

    function loadFromLocalStorage() {
        try {
            const gameKey = `game_${gameState.gameId || 'current'}`;
            const gameData = JSON.parse(localStorage.getItem(gameKey) || '{}');
            
            if (gameData.moves) {
                gameState.moves = gameData.moves;
            }
            
            return gameData.moves || [];
        } catch (error) {
            console.error('Error loading from local storage:', error);
            return [];
        }
    }

    function updateDisplay() {
        if (!whiteTimer || !blackTimer) return;

        // Update white timer
        const whiteDisplayTime = gameState.whiteInByoyomi ? gameState.whiteByoyomiTime : gameState.whiteTime;
        whiteTimer.textContent = formatTime(whiteDisplayTime);
        
        // Update black timer
        const blackDisplayTime = gameState.blackInByoyomi ? gameState.blackByoyomiTime : gameState.blackTime;
        blackTimer.textContent = formatTime(blackDisplayTime);

        // Update byo-yomi periods display
        const whitePeriodsDisplay = document.getElementById('white-periods');
        const blackPeriodsDisplay = document.getElementById('black-periods');
        
        if (whitePeriodsDisplay) {
            if (gameState.whiteInByoyomi) {
                whitePeriodsDisplay.textContent = `Periods: ${gameState.whiteByoyomiPeriods}`;
                whitePeriodsDisplay.style.display = 'block';
            } else {
                whitePeriodsDisplay.style.display = 'none';
            }
        }
        
        if (blackPeriodsDisplay) {
            if (gameState.blackInByoyomi) {
                blackPeriodsDisplay.textContent = `Periods: ${gameState.blackByoyomiPeriods}`;
                blackPeriodsDisplay.style.display = 'block';
            } else {
                blackPeriodsDisplay.style.display = 'none';
            }
        }

        // Update active state
        whiteTimer.classList.toggle('active', gameState.currentPlayer === 'white');
        blackTimer.classList.toggle('active', gameState.currentPlayer === 'black');

        // Update byoyomi indicators
        if (gameState.whiteInByoyomi) {
            whiteTimer.style.background = '#ffe6e6';
        }
        if (gameState.blackInByoyomi) {
            blackTimer.style.background = '#1a1a1a';
        }
    }

    function updateLayout() {
        if (!timerSection) return;

        // Update layout classes for dynamic 80%/20% split
        timerSection.className = `timer-section ${gameState.currentPlayer}-turn`;
        
        // Update timer half classes for visual feedback
        if (whiteTimerHalf) {
            whiteTimerHalf.classList.toggle('active', gameState.currentPlayer === 'white');
        }
        if (blackTimerHalf) {
            blackTimerHalf.classList.toggle('active', gameState.currentPlayer === 'black');
        }
        
        console.log(`Layout updated: ${gameState.currentPlayer} player's turn`);
    }

    function toggleUtilityMenu() {
        if (utilityMenu) {
            utilityMenu.classList.toggle('active');
            console.log('Utility menu toggled');
        }
    }

    function formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    function showTimeout(player) {
        clearInterval(timerInterval);
        if (timeoutOverlay) {
            const timeoutContent = timeoutOverlay.querySelector('.timeout-content');
            if (timeoutContent) {
                const title = timeoutContent.querySelector('h1');
                const message = timeoutContent.querySelector('p');
                if (title) title.textContent = 'TIME OUT!';
                if (message) message.textContent = `${player.charAt(0).toUpperCase() + player.slice(1)} player has run out of time.`;
            }
            timeoutOverlay.classList.add('active');
        }
    }

    function pauseGame() {
        gameState.isPaused = !gameState.isPaused;
        
        // Update the pause button text in the utility menu
        const pauseBtn = document.querySelector('.utility-menu .btn-secondary:nth-of-type(1)');
        if (pauseBtn) {
            pauseBtn.textContent = gameState.isPaused ? "Resume" : "Pause";
        }
        
        if (gameState.isPaused) {
            clearInterval(timerInterval);
        } else {
            startTimer();
        }
    }

    function restartGame() {
        if (confirm('Are you sure you want to restart the game?')) {
            clearInterval(timerInterval);
            window.location.reload();
        }
    }

    async function showMoveHistory() {
        if (!historyModal) return;
        
        try {
            let moves = [];
            
            // For guests, load from local storage
            if (currentUser.is_guest) {
                moves = loadFromLocalStorage();
            } else {
                // For registered users, try to load from backend first
                try {
                    const response = await fetch(`/api/games/${gameState.gameId}/moves`, {
                        credentials: 'include'
                    });
                    
                    if (response.ok) {
                        moves = await response.json();
                    } else {
                        // Fallback to local storage
                        moves = loadFromLocalStorage();
                    }
                } catch (error) {
                    console.error('Error loading moves from backend:', error);
                    // Fallback to local storage
                    moves = loadFromLocalStorage();
                }
            }

            const historyText = historyModal.querySelector('.history-text');
            const historyChart = historyModal.querySelector('.history-chart');

            if (moves.length === 0) {
                if (historyText) historyText.textContent = 'No moves yet - start playing to see your move history!';
                if (historyChart) historyChart.innerHTML = '';
            } else {
                // Generate text history
                let textHistory = '';
                moves.forEach((move, index) => {
                    const playerColor = move.player || move.player_color;
                    const timeUsed = move.timeUsed || move.time_taken;
                    const moveNum = move.moveNumber || move.move_number || (index + 1);
                    textHistory += `Move ${moveNum}: ${playerColor} - ${timeUsed}s\n`;
                });
                if (historyText) historyText.textContent = textHistory;

                // Generate chart with the loaded moves
                generateMoveChart(moves);
            }

            historyModal.classList.add('active');
            // Close utility menu when opening history
            if (utilityMenu) utilityMenu.classList.remove('active');
        } catch (error) {
            console.error('Error showing move history:', error);
            const historyText = historyModal.querySelector('.history-text');
            if (historyText) historyText.textContent = 'Error loading move history';
        }
    }
    function generateMoveChart(moves) {
        if (!historyModal) return;
        
        const historyChart = historyModal.querySelector('.history-chart');
        if (!historyChart) return;

        // Use provided moves or fallback to gameState.moves
        const chartMoves = moves || gameState.moves;
        
        if (chartMoves.length === 0) {
            historyChart.innerHTML = '<p style="color: #8e8e93; text-align: center;">No moves to display</p>';
            return;
        }

        // Create vertical bar chart with CSS
        const maxTime = Math.max(...chartMoves.map(m => (m.timeUsed || m.time_taken || 0)), 1);
        
        let chartHTML = `
            <div class="chart-container">
                <h4 class="chart-title">Move Time Analysis</h4>
                <div class="chart-bars">
        `;
        
        chartMoves.forEach((move, index) => {
            const timeUsed = move.timeUsed || move.time_taken || 0;
            const playerColor = move.player || move.player_color;
            const moveNum = move.moveNumber || move.move_number || (index + 1);
            const percentage = (timeUsed / maxTime) * 100;
            
            chartHTML += `
                <div class="chart-bar">
                    <div class="bar-label">Move ${moveNum}</div>
                    <div class="bar-container">
                        <div class="bar-fill ${playerColor}" style="width: ${percentage}%"></div>
                    </div>
                    <div class="bar-value">${timeUsed}s</div>
                </div>
            `;
        });
        
        chartHTML += `
                </div>
            </div>
        `;
        
        historyChart.innerHTML = chartHTML;
    }

    function showSaveGameModal() {
        // Create save game modal if it doesn't exist
        let saveModal = document.querySelector('.save-modal');
        if (!saveModal) {
            saveModal = document.createElement('div');
            saveModal.className = 'save-modal';
            saveModal.innerHTML = `
                <div class="save-content">
                    <div class="save-header">
                        <h3>Save Game</h3>
                        <button class="close-btn">×</button>
                    </div>
                    <div class="save-form">
                        <div class="form-group">
                            <label for="gameTitle">Game Title</label>
                            <input type="text" id="gameTitle" class="form-control" placeholder="Enter game title..." maxlength="100">
                        </div>
                        <div class="form-group">
                            <label for="gameComment">Comments</label>
                            <textarea id="gameComment" class="form-control" placeholder="Add your comments about this game..." rows="4" maxlength="500"></textarea>
                        </div>
                        <div class="save-actions">
                            <button class="btn btn-secondary" onclick="closeSaveModal()">Cancel</button>
                            <button class="btn btn-primary" onclick="saveGameWithComment()">Save Game</button>
                        </div>
                    </div>
                </div>
            `;
            document.body.appendChild(saveModal);
        }

        // Pre-fill with default title
        const gameTitle = document.getElementById('gameTitle');
        if (gameTitle) {
            const now = new Date();
            gameTitle.value = `Go Game - ${now.toLocaleDateString()} ${now.toLocaleTimeString()}`;
        }

        saveModal.classList.add('active');
        // Close utility menu
        if (utilityMenu) utilityMenu.classList.remove('active');
    }

    window.closeSaveModal = function() {
        const saveModal = document.querySelector('.save-modal');
        if (saveModal) {
            saveModal.classList.remove('active');
        }
    }

    window.saveGameWithComment = async function() {
        const gameTitle = document.getElementById('gameTitle').value.trim();
        const gameComment = document.getElementById('gameComment').value.trim();

        if (!gameTitle) {
            alert('Please enter a game title');
            return;
        }

        try {
            const gameData = {
                title: gameTitle,
                comment: gameComment,
                moves: gameState.moves,
                gameId: gameState.gameId,
                settings: {
                    mainTime: Math.floor((gameState.whiteTime + gameState.blackTime) / 120), // approximate original time
                    byoyomiTime: gameState.whiteByoyomiTime,
                    byoyomiPeriods: gameState.whiteByoyomiPeriods
                },
                savedAt: new Date().toISOString()
            };

            // For guests, save to local storage
            if (currentUser.is_guest) {
                saveGameToLocalStorage(gameData);
                alert('Game saved locally!');
            } else {
                // For registered users, save to backend
                const response = await fetch('/api/games/save', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify(gameData)
                });

                if (response.ok) {
                    // Also save to local storage as backup
                    saveGameToLocalStorage(gameData);
                    alert('Game saved successfully!');
                } else {
                    // Fallback to local storage
                    saveGameToLocalStorage(gameData);
                    alert('Game saved locally (server unavailable)');
                }
            }

            closeSaveModal();
        } catch (error) {
            console.error('Error saving game:', error);
            // Fallback to local storage
            const gameData = {
                title: gameTitle,
                comment: gameComment,
                moves: gameState.moves,
                gameId: gameState.gameId,
                savedAt: new Date().toISOString()
            };
            saveGameToLocalStorage(gameData);
            alert('Game saved locally!');
            closeSaveModal();
        }
    }

    function saveGameToLocalStorage(gameData) {
        try {
            let savedGames = JSON.parse(localStorage.getItem('savedGames') || '[]');
            
            // Add unique ID if not present
            if (!gameData.id) {
                gameData.id = Date.now().toString();
            }
            
            savedGames.unshift(gameData); // Add to beginning
            
            // Keep only last 20 saved games
            if (savedGames.length > 20) {
                savedGames = savedGames.slice(0, 20);
            }
            
            localStorage.setItem('savedGames', JSON.stringify(savedGames));
        } catch (error) {
            console.error('Error saving to local storage:', error);
        }
    }

    // Event listeners for timer halves
    if (whiteTimerHalf) {
        whiteTimerHalf.addEventListener('click', (e) => {
            e.stopPropagation();
            console.log('White timer clicked');
            makeMove();
        });
    }

    if (blackTimerHalf) {
        blackTimerHalf.addEventListener('click', (e) => {
            e.stopPropagation();
            console.log('Black timer clicked');
            makeMove();
        });
    }

    // Fallback: click anywhere on timer section
    if (timerSection) {
        timerSection.addEventListener('click', (e) => {
            // Don't trigger move if clicking on utility button
            if (utilityButton && (e.target === utilityButton || utilityButton.contains(e.target))) {
                return;
            }
            console.log('Timer section clicked');
            makeMove();
        });
    }

    // Utility menu event listeners
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('utility-btn')) {
            const action = e.target.textContent.toLowerCase().trim();
            
            switch (action) {
                case 'pause':
                case 'resume':
                    pauseGame();
                    break;
                case 'restart':
                    restartGame();
                    break;
                case 'settings (back)':
                    window.location.href = '/settings.html';
                    break;
                case 'move history':
                    showMoveHistory();
                    break;
                case 'save game':
                    showSaveGameModal();
                    break;
                case 'close':
                    if (utilityMenu) utilityMenu.classList.remove('active');
                    break;
            }
        }

        if (e.target.classList.contains('close-btn')) {
            if (historyModal) historyModal.classList.remove('active');
        }

        if (e.target.classList.contains('timeout-btn')) {
            if (e.target.textContent === 'Restart') {
                window.location.reload();
            } else {
                window.location.href = '/settings.html';
            }
        }
    });

    // Close modals when clicking outside
    if (utilityMenu) {
        utilityMenu.addEventListener('click', (e) => {
            if (e.target === utilityMenu) {
                utilityMenu.classList.remove('active');
            }
        });
    }

    if (historyModal) {
        historyModal.addEventListener('click', (e) => {
            if (e.target === historyModal) {
                historyModal.classList.remove('active');
            }
        });
    }

    if (timeoutOverlay) {
        timeoutOverlay.addEventListener('click', (e) => {
            if (e.target === timeoutOverlay) {
                // Don't allow closing timeout overlay by clicking outside
            }
        });
    }

    // Debug function to manually check utility button
    window.debugUtilityButton = function() {
        console.log('Utility button exists:', !!utilityButton);
        if (utilityButton) {
            console.log('Parent:', utilityButton.parentElement);
            console.log('Styles:', utilityButton.style.cssText);
            console.log('Computed styles:', window.getComputedStyle(utilityButton));
        }
    };
});


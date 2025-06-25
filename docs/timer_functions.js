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
            inByoyomi: gameState.currentPlayer === 'white' ? gameState.whiteInByoyomi : gameState.blackInByoyomi
        };

        gameState.moves.push(move);

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

    async function saveMoveToBackend(move) {
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
        } catch (error) {
            console.error('Error saving move:', error);
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


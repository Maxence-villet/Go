// game_ai.js - Mode Joueur vs IA

let gameState;

function initGame() {
    // Initialisation de l'état du jeu
    gameState = {
        board: Array(GRID_SIZE).fill().map(() => Array(GRID_SIZE).fill(EMPTY)),
        currentPlayer: BLACK,
        captures: { [BLACK]: 0, [WHITE]: 0 },
        previousBoard: null
    };

    renderGameState(getGameState());

    // Gestion du bouton Nouvelle Partie
    document.getElementById('new-game').addEventListener('click', () => {
        gameState = {
            board: Array(GRID_SIZE).fill().map(() => Array(GRID_SIZE).fill(EMPTY)),
            currentPlayer: BLACK,
            captures: { [BLACK]: 0, [WHITE]: 0 },
            previousBoard: null
        };
        renderGameState(getGameState());
    });

    // Gestion des clics sur le plateau (joueur humain)
    document.getElementById('board').addEventListener('click', (event) => {
        if (gameState.currentPlayer !== BLACK) return;

        const board = event.target.closest('#board');
        if (!board) return;

        const rect = board.getBoundingClientRect();
        const clickX = event.clientX - rect.left;
        const clickY = event.clientY - rect.top;

        // Vérification des limites
        if (clickX < 0 || clickX >= CELL_SIZE * GRID_SIZE || 
            clickY < 0 || clickY >= CELL_SIZE * GRID_SIZE) return;

        // Conversion en coordonnées de grille
        const x = Math.round(clickX / CELL_SIZE);
        const y = Math.round(clickY / CELL_SIZE);

        if (x < 0 || x >= GRID_SIZE || y < 0 || y >= GRID_SIZE) return;

        // Vérification de la précision du clic
        const centerX = x * CELL_SIZE;
        const centerY = y * CELL_SIZE;
        const distance = Math.sqrt((clickX - centerX) ** 2 + (clickY - centerY) ** 2);
        const TOLERANCE = CELL_SIZE * 0.3;

        if (distance <= TOLERANCE) {
            if (placeStone(x, y, BLACK)) {
                renderGameState(getGameState());
                
                // L'IA joue après un court délai si c'est son tour
                if (gameState.currentPlayer === WHITE) {
                    setTimeout(() => {
                        playAIMove();
                        renderGameState(getGameState());
                    }, 800); // Délai pour l'expérience utilisateur
                }
            }
        }
    });
}

function placeStone(x, y, color) {
    if (!isValidMove(x, y, color)) return false;

    // Sauvegarde pour la règle du ko
    gameState.previousBoard = gameState.board.map(row => [...row]);

    // Placement de la pierre
    gameState.board[x][y] = color;

    // Vérification des captures
    checkCapture(x, y, color);

    // Changement de joueur
    gameState.currentPlayer = color === BLACK ? WHITE : BLACK;
    return true;
}

function isValidMove(x, y, color) {
    // Position valide et case vide
    if (x < 0 || x >= GRID_SIZE || y < 0 || y >= GRID_SIZE || 
        gameState.board[x][y] !== EMPTY) {
        return false;
    }

    // Test temporaire du mouvement
    const testBoard = gameState.board.map(row => [...row]);
    testBoard[x][y] = color;

    // Vérification des libertés
    if (hasLiberties(testBoard, x, y, color)) return true;

    // Vérification des captures possibles
    const opponent = color === BLACK ? WHITE : BLACK;
    return getNeighbors(x, y).some(([nx, ny]) => 
        testBoard[nx][ny] === opponent && !hasLiberties(testBoard, nx, ny, opponent)
    );
}

function checkCapture(x, y, color) {
    const opponent = color === BLACK ? WHITE : BLACK;
    getNeighbors(x, y).forEach(([nx, ny]) => {
        if (gameState.board[nx][ny] === opponent && 
            !hasLiberties(gameState.board, nx, ny, opponent)) {
            captureGroup(nx, ny, opponent);
        }
    });

    // Vérification du ko
    if (isKoViolation()) {
        gameState.board = gameState.previousBoard.map(row => [...row]);
        gameState.previousBoard = null;
    }
}

function captureGroup(x, y, color) {
    const visited = new Set();
    captureGroupRecursive(x, y, color, visited);
}

function captureGroupRecursive(x, y, color, visited) {
    if (x < 0 || x >= GRID_SIZE || y < 0 || y >= GRID_SIZE || 
        visited.has(`${x},${y}`) || gameState.board[x][y] !== color) return;

    visited.add(`${x},${y}`);
    gameState.board[x][y] = EMPTY;
    gameState.captures[color === BLACK ? WHITE : BLACK]++;

    getNeighbors(x, y).forEach(([nx, ny]) => {
        captureGroupRecursive(nx, ny, color, visited);
    });
}

function hasLiberties(board, x, y, color, visited = new Set()) {
    if (x < 0 || x >= GRID_SIZE || y < 0 || y >= GRID_SIZE || 
        visited.has(`${x},${y}`)) return false;

    if (board[x][y] === EMPTY) return true;
    if (board[x][y] !== color) return false;

    visited.add(`${x},${y}`);
    return getNeighbors(x, y).some(([nx, ny]) => 
        hasLiberties(board, nx, ny, color, visited)
    );
}

function isKoViolation() {
    if (!gameState.previousBoard) return false;
    return gameState.board.every((row, i) => 
        row.every((cell, j) => cell === gameState.previousBoard[i][j])
    );
}

function getNeighbors(x, y) {
    const neighbors = [];
    if (x > 0) neighbors.push([x - 1, y]);
    if (x < GRID_SIZE - 1) neighbors.push([x + 1, y]);
    if (y > 0) neighbors.push([x, y - 1]);
    if (y < GRID_SIZE - 1) neighbors.push([x, y + 1]);
    return neighbors;
}

function getGameState() {
    return {
        board: gameState.board.map(row => [...row]),
        currentPlayer: gameState.currentPlayer,
        captures: { ...gameState.captures }
    };
}

// Initialisation automatique
if (typeof initGame === 'function') {
    initGame();
}
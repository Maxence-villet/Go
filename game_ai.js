// game_ai.js - Version du jeu avec intégration de l'IA

// État initial du jeu
let gameState = {
    board: Array(GRID_SIZE).fill().map(() => Array(GRID_SIZE).fill(EMPTY)),
    currentPlayer: BLACK,
    captures: { [BLACK]: 0, [WHITE]: 0 },
    previousBoard: null
};

// Place une pierre à la position (x, y) si le mouvement est valide
function placeStone(x, y, color) {
    if (!isValidMove(x, y, color)) return false;

    // Sauvegarder l'état précédent pour la règle du ko
    gameState.previousBoard = gameState.board.map(row => [...row]);

    // Placer la pierre
    gameState.board[x][y] = color;

    // Vérifier les captures
    checkCapture(x, y, color);

    // Changer de joueur
    gameState.currentPlayer = color === BLACK ? WHITE : BLACK;

    // Si c'est au tour de l'IA (blanc), jouer automatiquement
    if (gameState.currentPlayer === WHITE) {
        setTimeout(() => {
            if (playAIMove()) {
                renderGameState(getGameState());
            } else {
                // Si l'IA ne peut pas jouer, repasser au joueur
                gameState.currentPlayer = BLACK;
                renderUI(`Tour : Noir | Captures - Noir: ${gameState.captures[BLACK]}, Blanc: ${gameState.captures[WHITE]}`);
            }
        }, 500);
    }

    return true;
}

// Vérifie si un mouvement est valide
function isValidMove(x, y, color) {
    // Vérifier si la position est dans le plateau et vide
    if (x < 0 || x >= GRID_SIZE || y < 0 || y >= GRID_SIZE || gameState.board[x][y] !== EMPTY) {
        return false;
    }

    // Tester le mouvement temporairement
    const testBoard = gameState.board.map(row => [...row]);
    testBoard[x][y] = color;

    // Vérifier si le groupe formé a des libertés
    if (hasLiberties(testBoard, x, y, color)) {
        return true;
    }

    // Vérifier si le mouvement capture un groupe adverse
    const opponent = color === BLACK ? WHITE : BLACK;
    const neighbors = getNeighbors(x, y);
    for (const [nx, ny] of neighbors) {
        if (testBoard[nx][ny] === opponent && !hasLiberties(testBoard, nx, ny, opponent)) {
            return true;
        }
    }

    return false;
}

// Vérifie et effectue les captures après un placement
function checkCapture(x, y, color) {
    const opponent = color === BLACK ? WHITE : BLACK;
    const neighbors = getNeighbors(x, y);

    for (const [nx, ny] of neighbors) {
        if (gameState.board[nx][ny] === opponent && !hasLiberties(gameState.board, nx, ny, opponent)) {
            captureGroup(nx, ny, opponent);
        }
    }

    // Vérifier la règle du ko
    if (isKoViolation()) {
        gameState.board = gameState.previousBoard.map(row => [...row]);
        gameState.previousBoard = null;
        return false;
    }
}

// Vérifie si un groupe a des libertés
function hasLiberties(board, x, y, color) {
    const visited = new Set();
    return checkGroupLiberties(board, x, y, color, visited);
}

// Vérifie les libertés d'un groupe récursivement
function checkGroupLiberties(board, x, y, color, visited) {
    if (x < 0 || x >= GRID_SIZE || y < 0 || y >= GRID_SIZE || visited.has(`${x},${y}`)) {
        return false;
    }

    if (board[x][y] === EMPTY) return true;
    if (board[x][y] !== color) return false;

    visited.add(`${x},${y}`);

    const neighbors = getNeighbors(x, y);
    for (const [nx, ny] of neighbors) {
        if (checkGroupLiberties(board, nx, ny, color, visited)) {
            return true;
        }
    }

    return false;
}

// Capture un groupe de pierres
function captureGroup(x, y, color) {
    const visited = new Set();
    captureGroupRecursive(x, y, color, visited);
}

// Capture récursivement un groupe
function captureGroupRecursive(x, y, color, visited) {
    if (x < 0 || x >= GRID_SIZE || y < 0 || y >= GRID_SIZE || visited.has(`${x},${y}`)) {
        return;
    }

    if (gameState.board[x][y] !== color) return;

    visited.add(`${x},${y}`);
    gameState.board[x][y] = EMPTY;
    gameState.captures[color === BLACK ? WHITE : BLACK]++;

    const neighbors = getNeighbors(x, y);
    for (const [nx, ny] of neighbors) {
        captureGroupRecursive(nx, ny, color, visited);
    }
}

// Vérifie la règle du ko
function isKoViolation() {
    if (!gameState.previousBoard) return false;

    for (let i = 0; i < GRID_SIZE; i++) {
        for (let j = 0; j < GRID_SIZE; j++) {
            if (gameState.board[i][j] !== gameState.previousBoard[i][j]) {
                return false;
            }
        }
    }
    return true;
}

// Retourne les voisins d'une position
function getNeighbors(x, y) {
    const neighbors = [];
    if (x > 0) neighbors.push([x - 1, y]);
    if (x < GRID_SIZE - 1) neighbors.push([x + 1, y]);
    if (y > 0) neighbors.push([x, y - 1]);
    if (y < GRID_SIZE - 1) neighbors.push([x, y + 1]);
    return neighbors;
}

// Retourne l'état actuel du jeu
function getGameState() {
    return {
        board: gameState.board.map(row => [...row]),
        currentPlayer: gameState.currentPlayer,
        captures: { ...gameState.captures }
    };
}

// Initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', () => {
    renderGameState(getGameState());

    // Gestion du bouton "Nouvelle partie"
    document.getElementById('new-game').addEventListener('click', () => {
        gameState = {
            board: Array(GRID_SIZE).fill().map(() => Array(GRID_SIZE).fill(EMPTY)),
            currentPlayer: BLACK,
            captures: { [BLACK]: 0, [WHITE]: 0 },
            previousBoard: null
        };
        renderGameState(getGameState());
    });

    // Gestion des clics sur le plateau
    document.getElementById('board').addEventListener('click', (event) => {
        // Ne traiter que si c'est le tour du joueur noir
        if (gameState.currentPlayer !== BLACK) return;

        const board = event.target.closest('#board');
        if (!board) return;

        const rect = board.getBoundingClientRect();
        const clickX = event.clientX - rect.left;
        const clickY = event.clientY - rect.top;

        // Vérifier les limites du plateau
        if (clickX < 0 || clickX >= CELL_SIZE * GRID_SIZE || 
            clickY < 0 || clickY >= CELL_SIZE * GRID_SIZE) {
            return;
        }

        // Calculer les coordonnées de la grille
        const x = Math.round(clickX / CELL_SIZE);
        const y = Math.round(clickY / CELL_SIZE);

        // Vérifier la validité des indices
        if (x < 0 || x >= GRID_SIZE || y < 0 || y >= GRID_SIZE) {
            return;
        }

        // Vérifier la proximité avec le centre de l'intersection
        const centerX = x * CELL_SIZE;
        const centerY = y * CELL_SIZE;
        const distance = Math.sqrt((clickX - centerX) ** 2 + (clickY - centerY) ** 2);
        const TOLERANCE = 5;

        if (distance <= TOLERANCE) {
            if (placeStone(x, y, BLACK)) {
                renderGameState(getGameState());
            }
        }
    });
});
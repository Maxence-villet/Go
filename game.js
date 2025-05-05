// État initial du jeu
let gameState = {
    board: Array(GRID_SIZE).fill().map(() => Array(GRID_SIZE).fill(EMPTY)),
    currentPlayer: BLACK,
    captures: { [BLACK]: 0, [WHITE]: 0 },
    previousBoard: null // Pour la règle du ko
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
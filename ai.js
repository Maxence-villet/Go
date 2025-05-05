// ai.js - Intelligence Artificielle simple pour le jeu de Go

/**
 * Trouve un coup aléatoire valide pour le joueur blanc
 * @param {Array} board - Le plateau de jeu
 * @returns {Array|null} [x, y] des coordonnées du coup ou null si aucun coup valide
 */
function findRandomMove(board) {
    const validMoves = [];
    
    // Parcourir toutes les cases du plateau
    for (let x = 0; x < GRID_SIZE; x++) {
      for (let y = 0; y < GRID_SIZE; y++) {
        // Vérifier si le mouvement est valide
        if (board[x][y] === EMPTY && isValidMove(x, y, WHITE)) {
          validMoves.push([x, y]);
        }
      }
    }
    
    // Choisir un mouvement aléatoire parmi les mouvements valides
    if (validMoves.length > 0) {
      const randomIndex = Math.floor(Math.random() * validMoves.length);
      return validMoves[randomIndex];
    }
    
    return null; // Aucun coup valide trouvé (passe)
  }
  
  /**
   * Joue un coup pour l'IA (joueur blanc)
   * @returns {boolean} true si un coup a été joué, false sinon
   */
  function playAIMove() {
    const gameState = getGameState();
    const move = findRandomMove(gameState.board);
    
    if (move) {
      const [x, y] = move;
      return placeStone(x, y, WHITE);
    }
    
    return false; // L'IA passe son tour si aucun coup valide
  }
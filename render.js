// Rendu du plateau de Go
function renderBoard() {
    const board = document.getElementById('board');
    board.style.width = `${CELL_SIZE * (GRID_SIZE - 1)}px`; // Ajuster la largeur
    board.style.height = `${CELL_SIZE * (GRID_SIZE - 1)}px`; // Ajuster la hauteur

    // Effacer le contenu précédent
    board.innerHTML = '';

    // Dessiner les lignes horizontales (de 0 à GRID_SIZE - 2 pour 8 lignes)
    for (let i = 0; i < GRID_SIZE - 1; i++) {
        const line = document.createElement('div');
        line.className = 'grid-line horizontal';
        line.style.top = `${i * CELL_SIZE}px`;
        board.appendChild(line);
    }

    // Dessiner les lignes verticales (de 0 à GRID_SIZE - 2 pour 8 colonnes)
    for (let i = 0; i < GRID_SIZE - 1; i++) {
        const line = document.createElement('div');
        line.className = 'grid-line vertical';
        line.style.left = `${i * CELL_SIZE}px`;
        board.appendChild(line);
    }

    // Ajouter des points de référence (hoshi) pour un plateau 9x9
    const hoshiPositions = [
        [2, 2], [2, 6], [6, 2], [6, 6], [4, 4]
    ];
    hoshiPositions.forEach(([x, y]) => {
        const hoshi = document.createElement('div');
        hoshi.className = 'hoshi';
        hoshi.style.left = `${x * CELL_SIZE}px`;
        hoshi.style.top = `${y * CELL_SIZE}px`;
        board.appendChild(hoshi);
    });
}
  
  // Rendu d'une pierre à une position donnée
  function renderStone(x, y, color) {
    const board = document.getElementById('board');
    const stone = document.createElement('div');
    stone.className = `stone ${color}`;
    stone.style.width = `${STONE_SIZE}px`;
    stone.style.height = `${STONE_SIZE}px`;
    stone.style.left = `${x * CELL_SIZE}px`;
    stone.style.top = `${y * CELL_SIZE}px`;
    board.appendChild(stone);
  }
  
  // Mise à jour de l'interface utilisateur (message)
  function renderUI(message) {
    const messageElement = document.getElementById('message');
    messageElement.textContent = message;

    // Réinitialiser les classes de fond du body
    document.body.classList.remove('black-turn', 'white-turn');

    // Changer la couleur de fond et ajouter la classe correspondante
    if (gameState.currentPlayer === BLACK) {
        document.body.style.backgroundColor = '#151515'; // Fond noir
        document.body.classList.add('black-turn');
    } else if (gameState.currentPlayer === WHITE) {
        document.body.style.backgroundColor = '#eee'; // Fond gris clair
        document.body.classList.add('white-turn');
    }
}
  
  // Rendu de l'état complet du jeu
  function renderGameState(gameState) {
    renderBoard();
    for (let x = 0; x < GRID_SIZE; x++) {
      for (let y = 0; y < GRID_SIZE; y++) {
        if (gameState.board[x][y] === BLACK) renderStone(x, y, 'black');
        else if (gameState.board[x][y] === WHITE) renderStone(x, y, 'white');
      }
    }
    const player = gameState.currentPlayer === BLACK ? 'Noir' : 'Blanc';
    renderUI(`Tour : ${player} | Captures - Noir: ${gameState.captures[BLACK]}, Blanc: ${gameState.captures[WHITE]}`);
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
  
    // Gestion des clics sur le plateau avec détection précise
    document.getElementById('board').addEventListener('click', (event) => {
      // S'assurer que le contexte est bien le plateau
      const board = event.target.closest('#board');
      if (!board) {
        console.log('Click outside board');
        return;
      }
  
      const rect = board.getBoundingClientRect();
      const clickX = event.clientX - rect.left;
      const clickY = event.clientY - rect.top;
      console.log(`Click at: (${clickX}, ${clickY})`);
  
      // Vérifier si le clic est dans les limites du plateau
      if (clickX < 0 || clickX >= CELL_SIZE * GRID_SIZE || clickY < 0 || clickY >= CELL_SIZE * GRID_SIZE) {
        console.log(`Click outside board boundaries: (${clickX}, ${clickY})`);
        return;
      }
  
      // Calculer l'intersection la plus proche
      const x = Math.round(clickX / CELL_SIZE);
      const y = Math.round(clickY / CELL_SIZE);
  
      // Vérifier si les indices sont valides
      if (x < 0 || x >= GRID_SIZE || y < 0 || y >= GRID_SIZE) {
        console.log(`Invalid indices: [${x}, ${y}]`);
        return;
      }
  
      // Calculer la position du centre de l'intersection
      const centerX = x * CELL_SIZE;
      const centerY = y * CELL_SIZE;
  
      // Vérifier la distance au centre (tolérance de 5 pixels)
      const distance = Math.sqrt((clickX - centerX) ** 2 + (clickY - centerY) ** 2);
      const TOLERANCE = 5;
  
      if (distance <= TOLERANCE) {
        console.log(`Placing stone at: [${x}, ${y}]`);
        const color = gameState.currentPlayer;
        if (placeStone(x, y, color)) {
          renderGameState(getGameState());
        } else {
          console.log(`Invalid move at: [${x}, ${y}]`);
        }
      } else {
        console.log(`Click too far from intersection: distance=${distance}`);
      }
    });
  });

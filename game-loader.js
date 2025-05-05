// game-loader.js
document.addEventListener('DOMContentLoaded', () => {
    // Utilisation de localStorage.getItem
    const gameMode = localStorage.getItem('gameMode');
    
    if (!gameMode) {
        window.location.href = 'index.html';
        return;
    }

    const loadScript = (src) => {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = resolve;
            script.onerror = () => reject(new Error(`Failed to load ${src}`));
            document.body.appendChild(script);
        });
    };

    const initGame = async () => {
        try {
            // Chargement des scripts communs
            await Promise.all([
                loadScript('constants.js'),
                loadScript('render.js')
            ]);

            // Chargement spécifique au mode
            if (gameMode === 'pvp') {
                await loadScript('game.js');
                document.getElementById('game-title').textContent = 'Joueur vs Joueur';
            } 
            else if (gameMode === 'pvc') {
                await loadScript('ai.js');
                await loadScript('game_ai.js');
                document.getElementById('game-title').textContent = 'Joueur vs IA';
            }

            // Nettoyage
            localStorage.removeItem('gameMode');
            
            // Initialisation du jeu
            if (typeof renderGameState === 'function') {
                renderGameState(getGameState());
            }
        } catch (error) {
            console.error('Error loading game:', error);
            // window.location.href = 'index.html';
        }
    };

    initGame();
});
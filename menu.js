// menu.js
document.addEventListener('DOMContentLoaded', () => {
    const menuHTML = `
        <div id="main-menu" class="menu-container">
            <h1>Jeu de Go</h1>
            <div class="menu-options">
                <button id="pvp-btn" class="menu-btn">
                    <i class="fas fa-user-friends"></i> Joueur vs Joueur
                </button>
                <button id="pvc-btn" class="menu-btn">
                    <i class="fas fa-robot"></i> Joueur vs IA
                </button>
            </div>
            <div class="copyright">
                © 2025 - Tous droits réservés
            </div>
        </div>
    `;
    document.body.innerHTML = menuHTML;

    document.getElementById('pvp-btn').addEventListener('click', () => {
        // Utilisation de localStorage au lieu de sessionStorage
        localStorage.setItem('gameMode', 'pvp');
        window.location.href = 'game.html';
    });

    document.getElementById('pvc-btn').addEventListener('click', () => {
        localStorage.setItem('gameMode', 'pvc');
        window.location.href = 'game.html';
    });
});
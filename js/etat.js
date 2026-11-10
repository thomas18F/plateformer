// =====================================================
//  L'état du jeu : niveau en cours, pièces, chargement du niveau, caméra
// =====================================================

let etat = "titre";   // titre | jeu | pause | drapeau | victoire | gameover
let numeroNiveau = 0; // position dans NIVEAUX : 0 = niveau 1
let nbPieces = 0;
let chrono = 0;       // temps passé dans le niveau
let temps = 0;        // horloge générale pour les animations

let grille, pieces, ennemis, effets, rebonds, tirs, joueur, drapeau, depart;
let largeurNiveau, hauteurNiveau;
const camera = { x: 0 };

function chargerNiveau() {
  const niveau = NIVEAUX[numeroNiveau];
  const carte = niveau.carte;
  const colonnes = Math.max(...carte.map((ligne) => ligne.length));
  largeurNiveau = colonnes * TILE;
  hauteurNiveau = carte.length * TILE;
  grille = [];
  pieces = [];
  ennemis = [];
  effets = [];
  rebonds = {};
  tirs = [];

  for (let r = 0; r < carte.length; r++) {
    const ligne = carte[r].padEnd(colonnes, " ");
    const rangee = [];
    for (let c = 0; c < colonnes; c++) {
      const ch = ligne[c];
      const x = c * TILE;
      const y = r * TILE;
      let tuile = " ";
      if ("#XB?^".includes(ch)) tuile = ch;
      else if (ch === "o") pieces.push({ x: x + 8, y: y + 6, l: 16, h: 20 });
      else if (ch === "P") depart = { x: x + 5, y: y + 2 };
      else if (ch === "F") {
        tuile = "X"; // socle du drapeau
        drapeau = { x: x + 13, l: 6, haut: (r - 9) * TILE + 8, bas: y, drapY: (r - 9) * TILE + 16 };
      }
      rangee.push(tuile);
    }
    grille.push(rangee);
  }

  // Les ennemis sont déclarés à part, dans la liste « ennemis » du niveau (niveau.js)
  for (const { colonne, ligne, type, capacite } of niveau.ennemis) {
    ennemis.push(creerEnnemi(colonne * TILE, ligne * TILE, type, capacite));
  }

  joueur = creerJoueur(depart.x, depart.y);
  camera.x = 0;
  chrono = 0;
}

// Une nouvelle partie repart toujours du niveau 1
function nouvellePartie() {
  numeroNiveau = 0;
  nbPieces = 0;
  chargerNiveau();
  etat = "jeu";
}

// Le renard garde ses pièces ; ses PV repartent au maximum
function niveauSuivant() {
  numeroNiveau++;
  chargerNiveau();
  etat = "jeu";
}

function estDernierNiveau() {
  return numeroNiveau === NIVEAUX.length - 1;
}

// ---------- Caméra ----------
function majCamera(dt) {
  const cible = joueur.x + joueur.l / 2 - W / 2 + joueur.dir * 60; // regarde un peu devant
  camera.x += (cible - camera.x) * Math.min(1, 6 * dt);
  camera.x = Math.max(0, Math.min(camera.x, largeurNiveau - W));
}

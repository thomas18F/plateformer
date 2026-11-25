// =====================================================
//  L'état du jeu : niveau en cours, pièces, chargement du niveau, caméra
// =====================================================

let etat = "titre";   // titre | carte | jeu | transition | pause | victoire | gameover
let numeroNiveau = 0; // le niveau où est le Pokémon : sa position dans NIVEAUX (0 = niveau 1)
let niveauMaxAtteint = 0; // le niveau le plus loin où il est allé : ceux d'après sont fermés sur la carte
let niveauxVisites = {}; // numéro d'un niveau déjà quitté → { grille, pieces, ennemis } tels qu'on les a laissés
                         // (vidé à chaque passage devant un centre Pokémon : voir sauvegarderAuCentre)
let pointDeSauvegarde = null; // le dernier centre Pokémon devant lequel le Pokémon est passé : { niveau, colonne, ligne }
                              // (null tant qu'il n'en a croisé aucun). S'il est K.O., il reprend là (reprendreAuCentre).
let nbPieces = 0;
let chrono = 0;       // temps passé dans le niveau
let temps = 0;        // horloge générale pour les animations

let grille, pieces, ennemis, decorations, centresPokemon, effets, rebonds, tirs, joueur, depart;
let largeurNiveau, hauteurNiveau;
const camera = { x: 0 };

// entree : par où le Pokémon arrive.
//   "gauche" : au départ P (début de partie, ou en venant du niveau précédent)
//   "droite" : au bout du niveau, en revenant du niveau suivant (voir arriveeParLaDroite)
//   "centre" : devant le centre Pokémon du point de sauvegarde, après un K.O. (voir reprendreAuCentre)
function chargerNiveau(entree = "gauche") {
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
      if ("#RXB?^".includes(ch)) tuile = ch;
      else if (ch === "o") pieces.push({ x: x + 8, y: y + 6, l: 16, h: 20 });
      else if (ch === "P") depart = { x, y }; // le coin de la case : creerJoueur pose le Pokémon en bas, au milieu
      rangee.push(tuile);
    }
    grille.push(rangee);
  }

  // Les ennemis sont déclarés à part, dans la liste « ennemis » du niveau (niveau.js)
  for (const { colonne, ligne, nom, capacite } of niveau.ennemis) {
    ennemis.push(creerEnnemi(colonne * TILE, ligne * TILE, nom, capacite));
  }

  // Un niveau déjà visité reprend tel qu'on l'a laissé : les pièces ramassées, les blocs bonus vidés
  // et les ennemis battus ne reviennent pas, et les autres ennemis sont là où on les a quittés.
  const memoire = niveauxVisites[numeroNiveau];
  if (memoire) ({ grille, pieces, ennemis } = memoire);

  // Pareil pour les décorations (arbres…), dans la liste « decorations » du niveau.
  // Elles sont seulement dessinées : pas de hitbox, rien ne les touche.
  decorations = (niveau.decorations || []).map(({ colonne, ligne, type }) => ({
    x: colonne * TILE + TILE / 2, // milieu de la case
    y: (ligne + 1) * TILE,        // bas de la case : posée sur le sol
    type,
    graine: colonne,              // pour que chaque arbre soit un peu différent
  }));

  // Les centres Pokémon, dans la liste « centresPokemon » du niveau.
  // Leur hitbox ne bloque personne : elle sert seulement à soigner le Pokémon qui passe devant (joueur.js).
  centresPokemon = (niveau.centresPokemon || []).map(({ colonne, ligne }) => ({
    colonne, ligne, // sa case : c'est elle que retient le point de sauvegarde
    x: colonne * TILE + TILE / 2 - TAILLE_CENTRE_POKEMON.l / 2, // centré sur sa case
    y: (ligne + 1) * TILE - TAILLE_CENTRE_POKEMON.h,            // posé en bas de sa case
    l: TAILLE_CENTRE_POKEMON.l,
    h: TAILLE_CENTRE_POKEMON.h,
  }));

  if (entree === "droite") {
    const arrivee = arriveeParLaDroite();
    joueur = creerJoueur(arrivee.x, arrivee.y);
    joueur.dir = -1; // il regarde vers la gauche : il vient de la droite
  } else if (entree === "centre") {
    // posé sur la case du centre, comme sur un départ : au milieu du bâtiment, sur le sol
    joueur = creerJoueur(pointDeSauvegarde.colonne * TILE, pointDeSauvegarde.ligne * TILE);
  } else {
    joueur = creerJoueur(depart.x, depart.y);
  }
  majCamera(0, true); // la caméra commence directement sur le Pokémon
  chrono = 0;
}

// Où le Pokémon apparaît quand il revient du niveau suivant : à la même distance du bord droit
// que le départ P l'est du bord gauche, posé sur le sol de cette colonne
// (la case vide la plus basse qui a un bloc solide juste en dessous).
// Renvoie le coin en haut à gauche de cette case, comme depart.
function arriveeParLaDroite() {
  const c = grille[0].length - 1 - depart.x / TILE;
  for (let r = grille.length - 2; r >= 0; r--) {
    if (!estSolide(grille[r][c]) && estSolide(grille[r + 1][c])) return { x: c * TILE, y: r * TILE };
  }
  return { x: c * TILE, y: depart.y }; // pas de sol dans cette colonne : à la même hauteur que P
}

// Une nouvelle partie commence directement dans le niveau 1, sans pièces, et tous les niveaux repartent à neuf
function nouvellePartie() {
  numeroNiveau = 0;
  niveauMaxAtteint = 0;
  niveauxVisites = {};
  pointDeSauvegarde = null;
  nbPieces = 0;
  chargerNiveau();
  etat = "jeu";
}

// Change de niveau : appelé par la transition (transition.js), quand l'écran est tout noir.
//   sens = 1  : le Pokémon est sorti par la droite : il va au niveau suivant et arrive au départ P
//   sens = -1 : il est sorti par la gauche : il revient au niveau précédent et arrive au bout, à droite
// Le niveau qu'il quitte est mémorisé tel quel (niveauxVisites) : rien n'y réapparaîtra,
// jusqu'à ce qu'il passe devant un centre Pokémon (sauvegarderAuCentre).
// Le Pokémon n'est pas soigné : il garde ses pièces, ses PV, son statut (brûlure, poison…) et son ralentissement.
function changerDeNiveau(sens) {
  niveauxVisites[numeroNiveau] = { grille, pieces, ennemis };
  const { pv, statut, ralentissement } = joueur; // chargerNiveau crée un Pokémon tout neuf, en pleine forme…
  numeroNiveau += sens;
  niveauMaxAtteint = Math.max(niveauMaxAtteint, numeroNiveau);
  chargerNiveau(sens === 1 ? "gauche" : "droite");
  joueur.pv = pv;                // …on lui rend donc son état d'avant
  joueur.statut = statut;
  joueur.ralentissement = ralentissement;
}

// Le Pokémon passe devant un centre Pokémon (joueur.js) : ce centre devient le point de sauvegarde,
// et tous les niveaux qu'il a quittés repartent à neuf : leurs ennemis, leurs pièces et leurs blocs bonus reviennent.
// Le niveau où il est, lui, ne change pas : rien ne réapparaît sous ses yeux.
function sauvegarderAuCentre(centre) {
  pointDeSauvegarde = { niveau: numeroNiveau, colonne: centre.colonne, ligne: centre.ligne };
  niveauxVisites = {};
}

// Le Pokémon est K.O. : il repart en pleine forme devant le dernier centre Pokémon où il est passé.
// Comme à chaque passage devant un centre, tous les niveaux repartent à neuf, y compris celui où il est tombé.
// Il garde ses pièces.
function reprendreAuCentre() {
  numeroNiveau = pointDeSauvegarde.niveau;
  niveauxVisites = {};
  chargerNiveau("centre"); // chargerNiveau crée un Pokémon tout neuf : tous ses PV, sans statut
  etat = "jeu";
}

function estDernierNiveau() {
  return numeroNiveau === NIVEAUX.length - 1;
}

// ---------- Caméra ----------
// immediat = true : la caméra saute d'un coup sur le Pokémon (en arrivant dans un niveau), au lieu de glisser jusqu'à lui
function majCamera(dt, immediat = false) {
  const cible = joueur.x + joueur.l / 2 - W / 2 + joueur.dir * 60; // regarde un peu devant
  camera.x = immediat ? cible : camera.x + (cible - camera.x) * Math.min(1, 6 * dt);
  camera.x = Math.max(0, Math.min(camera.x, largeurNiveau - W));
}

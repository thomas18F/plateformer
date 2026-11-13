// =====================================================
//  Réglages du jeu (amuse-toi à les modifier !)
// =====================================================

const TILE = 32;              // taille d'une case en pixels
const GRAVITE = 1800;         // accélération vers le bas (px/s²)
const FORCE_SAUT = 700;       // vitesse au début d'un saut (px/s)
const VITESSE_MARCHE = 320;   // px/s
const ACCEL_SOL = 1500;
const ACCEL_AIR = 900;
const FRICTION_SOL = 1400;
const CHUTE_MAX = 900;
const PV_JOUEUR = 20;         // points de vie du renard au début de la partie
const DEGATS_PICS = 10;       // PV perdus en touchant des pics
const DELAI_PICS = 1;         // secondes pendant lesquelles les pics ne blessent plus, après une piqûre
const VITESSE_CARTE = 150;    // vitesse du renard sur la carte du monde (px/s)

// Les types d'ennemis qu'on peut mettre dans les niveaux (champ « type » dans niveau.js).
//   l, h    : taille de la hitbox en px (une case = 32 px)
//   pv      : points de vie au départ
//   vitesse : vitesse de marche (px/s)
// Le dessin de chaque type est dans dessin-personnages.js.
const TYPES_ENNEMIS = [
  { id: "gloup", l: 28, h: 24, pv: 10, vitesse: 60 },  // petite boule violette
  { id: "souche", l: 44, h: 60, pv: 20, vitesse: 40 }, // grosse souche qui marche : presque 2 cases de haut
];

// Les tirs (du renard et des ennemis)
// Capacités disponibles dans le jeu : description indépendante des utilisateurs.
const CAPACITES = [
  {
    id: "flammeche",
    type: "projectile",
    projectile: { forme: "cercle", couleur: "#e53935", rayon: 5, spectral: false, vitesse: 480, portee: 320, degats: 5 },
  },
  {
    id: "dard-venin",
    type: "projectile",
    projectile: { forme: "triangle", couleur: "#6d28d9", rayon: 5, spectral: false, vitesse: 200, portee: 320, degats: 5 },
  },
  {
    id: "balle-ombre",
    type: "projectile",
    projectile: { forme: "cercle", couleur: "#6d28d9", rayon: 8, spectral: true, vitesse: 240, portee: 320, degats: 5 },
  },
  {
    id: "ecrasement",
    type: "ecrasement",
    duree: 3,
    degats: 10,
  },
  {
    id: "charge",
    type: "charge",
    duree: 3,
    degats: 10,
    distanceDash: 64,
    vitesseDash: 480,
  },
];

// Contrôles du joueur et capacités attribuées au joueur, séparés des capacités elles-mêmes.
const TOUCHES_JOUEUR = { gauche: "arrowleft", droite: "arrowright", saut: "arrowup", capacite1: "x", capacite2: "c", capacite3: "v", capacite4: "b", entree: "enter", pause: "p" };
const CAPACITES_JOUEUR = [
  { action: "capacite1", capacite: "flammeche" },
  { action: "capacite2", capacite: "ecrasement" },
  { action: "capacite3", capacite: "balle-ombre" },
  { action: "capacite4", capacite: "charge" },
];

// Couleur du texte « -5 » qui s'affiche au-dessus d'un personnage qui perd des PV
const COULEUR_DEGATS_JOUEUR = "#ff5c5c"; // le renard est touché
const COULEUR_DEGATS_ENNEMI = "#ffe27a"; // un ennemi est touché

// Comportement de tir ennemi (détection et délai, indépendants du projectile utilisé).
const DETECTION_ENNEMI = 256; // un ennemi tire si le renard est devant lui, à sa hauteur, à moins de ça (px)
const DELAI_TIR_ENNEMI = 4;   // secondes minimum entre deux tirs d'un même ennemi

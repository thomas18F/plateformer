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
const VITESSE_ENNEMI = 60;
const PV_ENNEMI = 10;         // points de vie de chaque ennemi au départ
const VIES_DEPART = 3;
const PV_JOUEUR = 20;         // points de vie du renard (remis au maximum à chaque nouvelle vie)

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

// Comportement de tir ennemi (détection et délai, indépendants du projectile utilisé).
const DETECTION_ENNEMI = 256; // un ennemi tire si le renard est devant lui, à sa hauteur, à moins de ça (px)
const DELAI_TIR_ENNEMI = 4;   // secondes minimum entre deux tirs d'un même ennemi

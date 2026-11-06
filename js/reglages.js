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
const VIES_DEPART = 3;
const PORTEE_TIR = 320;       // distance parcourue par un tir avant de disparaître (px)
const VITESSE_TIR = 480;      // px/s
const RAYON_TIR = 5;          // taille du cercle rouge (px)
const TIR_BLOQUE_PAR_DECOR = false; // true : le tir s'arrête contre les blocs ; false : il les traverse

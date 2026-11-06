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
const RAYON_TIR = 5;          // taille des tirs : rayon du cercle rouge, demi-côté du triangle violet (px)
const TIR_BLOQUE_PAR_DECOR = false; // true : les tirs s'arrêtent contre les blocs ; false : ils les traversent

// Tirs du renard (cercles rouges)
const PORTEE_TIR = 320;       // distance parcourue par un tir avant de disparaître (px)
const VITESSE_TIR = 480;      // px/s
const DEGATS_TIR = 5;         // points de vie retirés à un ennemi touché

// Tirs des ennemis (triangles violets)
const DETECTION_ENNEMI = 256; // un ennemi tire si le renard est devant lui, à sa hauteur, à moins de ça (px)
const DELAI_TIR_ENNEMI = 4;   // secondes minimum entre deux tirs d'un même ennemi
const PORTEE_TIR_ENNEMI = 320;
const VITESSE_TIR_ENNEMI = 200;
const DEGATS_TIR_ENNEMI = 5;  // points de vie retirés au renard touché

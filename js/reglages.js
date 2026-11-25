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
const DEGATS_PICS = 10;       // PV perdus en touchant des pics
const DELAI_PICS = 1;         // secondes pendant lesquelles les pics ne blessent plus, après une piqûre
const PIECES_BLOC = 3;        // pièces gagnées en frappant un bloc doré
const CASES_ARRIVEE = 1;      // le niveau est gagné quand le Pokémon entre dans les N dernières colonnes de la carte ; les N premières ramènent au niveau précédent
const DUREE_TRANSITION = 0.8; // secondes que met le cercle à se refermer sur le Pokémon entre deux niveaux (puis autant pour se rouvrir)
const TAILLE_CENTRE_POKEMON = { l: 160, h: 112 }; // hitbox d'un centre Pokémon (px) : le passer soigne, mais il ne bloque rien

// Le Pokédex : tous les Pokémon du jeu.
// Les ennemis des niveaux (champ « nom » dans niveau.js) et le Pokémon du joueur (POKEMON_JOUEUR, plus bas) en viennent.
//   l, h    : taille de la hitbox en px (une case = 32 px)
//   pv      : points de vie au départ
//   vitesse : vitesse de marche d'un ennemi (px/s) ; le joueur, lui, marche à VITESSE_MARCHE
//   types   : les types du Pokémon (« feu », « poison »…), autant qu'on veut : leurs multiplicateurs se multiplient (types.js).
//             Un ennemi de type vol flotte dans les airs ; s'il perd ce type (anti-air), il tombe (voir estVolant dans types.js).
//   valeur  : pièces gagnées quand on bat un ennemi de cette espèce
// Le dessin de chaque Pokémon est dans dessin-personnages.js.
const POKEDEX = [
  { id: "aspicot", l: 28, h: 24, pv: 10, vitesse: 60, types: ["insecte", "poison"], valeur: 1 },    // petite chenille jaune avec deux dards
  { id: "simularbre", l: 44, h: 60, pv: 20, vitesse: 40, types: ["roche"], valeur: 3 },             // faux arbre qui marche : presque 2 cases de haut
  { id: "salameche", l: 22, h: 30, pv: 20, vitesse: 70, types: ["feu"], valeur: 4 },                // petit lézard orange, flamme au bout de la queue
  { id: "fantominus", l: 28, h: 28, pv: 16, vitesse: 50, types: ["spectre", "poison", "vol"], valeur: 2 }, // boule de gaz sombre dans un halo violet : elle flotte
];

// Le Pokémon que l'on joue : un id du POKEDEX. Sa taille, ses PV, ses types et son dessin viennent de sa fiche.
const POKEMON_JOUEUR = "salameche";

// Les tirs (du Pokémon et des ennemis)
// Capacités disponibles dans le jeu : description indépendante des utilisateurs.
//   type  : le type Pokémon de la capacité (« feu », « poison »…), comme les types du POKEDEX
//   effet : ce que fait la capacité : « projectile » (un tir), « ecrasement » ou « charge »
//   statut (facultatif) : { nom, chance } : la cible a « chance » d'attraper ce statut (0.1 = 10 %), voir STATUTS plus bas
//   retireType (facultatif) : la cible perd ce type si elle l'a, une fois les dégâts calculés (ils comptent donc encore ce type)
// Pour un projectile :
//   forme     : « cercle », « triangle » (la pointe dans le sens du tir) ou « carre »
//   direction : « avant » (part devant le tireur, dans le sens où il regarde), « haut » (part du haut de sa tête, vers le ciel)
//               ou « bas » (part de sous ses pieds, vers le sol)
//   spectral  : true = traverse les blocs
const CAPACITES = [
  {
    id: "flammeche",
    type: "feu",
    effet: "projectile",
    statut: { nom: "brulure", chance: 0.1 },
    projectile: { forme: "cercle", couleur: "#e53935", rayon: 5, direction: "avant", spectral: false, vitesse: 480, portee: 320, degats: 5 },
  },
  {
    id: "dard-venin",
    type: "poison",
    effet: "projectile",
    statut: { nom: "poison", chance: 0.1 },
    projectile: { forme: "triangle", couleur: "#6d28d9", rayon: 5, direction: "avant", spectral: false, vitesse: 200, portee: 320, degats: 5 },
  },
  {
    id: "balle-ombre",
    type: "spectre",
    effet: "projectile",
    projectile: { forme: "cercle", couleur: "#6d28d9", rayon: 8, direction: "avant", spectral: true, vitesse: 240, portee: 320, degats: 5 },
  },
  {
    id: "anti-air",
    type: "roche",
    effet: "projectile",
    retireType: "vol", // la cible tombe : elle n'est plus de type vol
    projectile: { forme: "triangle", couleur: "#8d6e63", rayon: 6, direction: "haut", spectral: false, vitesse: 420, portee: 320, degats: 5 },
  },
  {
    id: "bombe-beurk",
    type: "poison",
    effet: "projectile",
    statut: { nom: "poison", chance: 0.3 },
    projectile: { forme: "carre", couleur: "#6d28d9", rayon: 6, direction: "bas", spectral: false, vitesse: 360, portee: 320, degats: 5 },
  },
  {
    id: "ecrasement",
    type: "normal",
    effet: "ecrasement",
    duree: 3,
    degats: 10,
  },
  {
    id: "charge",
    type: "normal",
    effet: "charge",
    duree: 3,
    degats: 10,
    distanceDash: 64,
    vitesseDash: 480,
  },
];

// Les statuts qu'une capacité peut infliger (champ « statut » d'une capacité, dans CAPACITES).
// Le code est dans statuts.js.
// Un Pokémon qui a un statut perd « degats » PV toutes les « intervalle » secondes, pendant « duree » secondes
// (ces dégâts ne dépendent pas des types). Il n'a qu'un statut à la fois : tant qu'il en a un, il n'en attrape pas d'autre.
//   immunites : les types qui ne l'attrapent jamais (comme dans les jeux : un Pokémon feu ne brûle pas)
//   couleur   : celle des bulles autour du Pokémon et de ses dégâts « -1 »
//   texte     : ce qui s'affiche au-dessus du Pokémon quand il l'attrape
const STATUTS = {
  brulure: { degats: 1, intervalle: 2, duree: 10, immunites: ["feu"], couleur: "#ff7b00", texte: "Brûlé !" },
  poison: { degats: 1, intervalle: 2, duree: 12, immunites: ["poison", "acier"], couleur: "#b04fe0", texte: "Empoisonné !" },
};

// Efficacité des types : EFFICACITES[type de la capacité][type de la cible] = multiplicateur des dégâts.
//   2 : super efficace       0.5 : pas très efficace       0 : aucun effet
// Un type absent de la liste vaut 1 (dégâts normaux).
// Contre un Pokémon à deux types, les deux multiplicateurs se multiplient :
// la flammèche (feu) contre l'aspicot (insecte ×2, poison ×1) fait ×2.
// C'est la table des jeux Pokémon (depuis la 6e génération), avec les 18 types.
// Le calcul est dans types.js.
const EFFICACITES = {
  normal:   { roche: 0.5, acier: 0.5, spectre: 0 },
  feu:      { feu: 0.5, eau: 0.5, plante: 2, glace: 2, insecte: 2, roche: 0.5, dragon: 0.5, acier: 2 },
  eau:      { feu: 2, eau: 0.5, plante: 0.5, sol: 2, roche: 2, dragon: 0.5 },
  electrik: { eau: 2, electrik: 0.5, plante: 0.5, sol: 0, vol: 2, dragon: 0.5 },
  plante:   { feu: 0.5, eau: 2, plante: 0.5, poison: 0.5, sol: 2, vol: 0.5, insecte: 0.5, roche: 2, dragon: 0.5, acier: 0.5 },
  glace:    { feu: 0.5, eau: 0.5, plante: 2, glace: 0.5, sol: 2, vol: 2, dragon: 2, acier: 0.5 },
  combat:   { normal: 2, glace: 2, poison: 0.5, vol: 0.5, psy: 0.5, insecte: 0.5, roche: 2, spectre: 0, tenebres: 2, acier: 2, fee: 0.5 },
  poison:   { plante: 2, poison: 0.5, sol: 0.5, roche: 0.5, spectre: 0.5, acier: 0, fee: 2 },
  sol:      { feu: 2, electrik: 2, plante: 0.5, poison: 2, vol: 0, insecte: 0.5, roche: 2, acier: 2 },
  vol:      { electrik: 0.5, plante: 2, combat: 2, insecte: 2, roche: 0.5, acier: 0.5 },
  psy:      { combat: 2, poison: 2, psy: 0.5, tenebres: 0, acier: 0.5 },
  insecte:  { feu: 0.5, plante: 2, combat: 0.5, poison: 0.5, vol: 0.5, psy: 2, spectre: 0.5, tenebres: 2, acier: 0.5, fee: 0.5 },
  roche:    { feu: 2, glace: 2, combat: 0.5, sol: 0.5, vol: 2, insecte: 2, acier: 0.5 },
  spectre:  { normal: 0, psy: 2, spectre: 2, tenebres: 0.5 },
  dragon:   { dragon: 2, acier: 0.5, fee: 0 },
  tenebres: { combat: 0.5, psy: 2, spectre: 2, tenebres: 0.5, fee: 0.5 },
  acier:    { feu: 0.5, eau: 0.5, electrik: 0.5, glace: 2, roche: 2, acier: 0.5, fee: 2 },
  fee:      { feu: 0.5, combat: 2, poison: 0.5, dragon: 2, tenebres: 2, acier: 0.5 },
};

// Contrôles du joueur et capacités attribuées au joueur, séparés des capacités elles-mêmes.
const TOUCHES_JOUEUR = { gauche: "arrowleft", droite: "arrowright", saut: "arrowup", capacite1: "x", capacite2: "c", capacite3: "v", carte: "m", entree: "enter", pause: "p" };
const CAPACITES_JOUEUR = [
  { action: "capacite1", capacite: "flammeche" },
  { action: "capacite2", capacite: "ecrasement" },
  { action: "capacite3", capacite: "balle-ombre" },
];

// Couleur du texte « -5 » qui s'affiche au-dessus d'un personnage qui perd des PV
const COULEUR_DEGATS_JOUEUR = "#ff5c5c"; // le Pokémon est touché
const COULEUR_DEGATS_ENNEMI = "#ffe27a"; // un ennemi est touché
const COULEUR_SOIN = "#7dff9a";          // le texte « Soigné ! » au centre Pokémon

// Comportement de tir ennemi (détection et délai, indépendants du projectile utilisé).
const DETECTION_ENNEMI = 256; // un ennemi tire si le Pokémon est à moins de ça (px) : devant lui, à sa hauteur, ou juste au-dessus / en dessous de lui pour un tir vers le haut (anti-air) / vers le bas (bombe beurk)
const DELAI_TIR_ENNEMI = 4;   // secondes minimum entre deux tirs d'un même ennemi

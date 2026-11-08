// =====================================================
//  La carte du niveau
// =====================================================

// Chaque caractère est une case de 32×32 px :
//   #  sol            X  bloc de pierre     B  brique
//   ?  bloc bonus     o  pièce              ^  pics
//   P  départ du joueur                     F  drapeau d'arrivée
// Les ennemis ne sont pas dans la carte : ils sont dans la liste ENNEMIS, plus bas.
const NIVEAU = [
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "                   ?                                          ooo",
  "                                               oooo           B?B",
  "",
  "                                                                                             oooo               XX",
  "        ooo   ?  B?B?B                        BBBBBB         ?B?B?     oo                   BBBBBB             XXX",
  "                                   X                                  o  o                                    XXXX",
  "                           X       X                   BBB                                                   XXXXX",
  "   P                       X       X                                            ^^                          XXXXXX      F",
  "########################################   ###########################    ###########################   ######################",
  "########################################   ###########################    ###########################   ######################",
];

// ---------- Les ennemis ----------
// Chaque ennemi apparaît dans la case indiquée, avec les mêmes numéros que la carte :
// colonne 0 = tout à gauche, ligne 0 = tout en haut (le sol commence à la ligne 15).
// Il est posé en bas de sa case ; si la case est en l'air, il tombe jusqu'au sol.
const ENNEMIS = [
  { colonne: 24, ligne: 14, capacite: "dard-venin" },
  { colonne: 31, ligne: 14, capacite: "dard-venin" },
  { colonne: 49, ligne: 10, capacite: "dard-venin" },
  { colonne: 55, ligne: 14, capacite: "dard-venin" },
  { colonne: 57, ligne: 14, capacite: "dard-venin" },
  { colonne: 86, ligne: 14, capacite: "dard-venin" },
  { colonne: 95, ligne: 14, capacite: "dard-venin" },
  { colonne: 105, ligne: 14, capacite: "dard-venin" },
];

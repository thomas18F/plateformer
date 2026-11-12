// =====================================================
//  Les cartes des niveaux, dans l'ordre où on les joue
// =====================================================

// Chaque caractère est une case de 32×32 px :
//   #  sol            X  bloc de pierre     B  brique
//   ?  bloc bonus     o  pièce              ^  pics
//   P  départ du joueur                     F  drapeau d'arrivée
//   R  roche de grotte (sol, murs, plafond : comme # mais sans herbe)
// Une carte fait 17 lignes de haut : le sol commence à la ligne 15.
//
// Les ennemis ne sont pas dans la carte : ils sont dans la liste « ennemis » de chaque niveau.
// Chaque ennemi apparaît dans la case indiquée, avec les mêmes numéros que la carte :
// colonne 0 = tout à gauche, ligne 0 = tout en haut.
// Il est posé en bas de sa case ; si la case est en l'air, il tombe jusqu'au sol.
//
// « type » choisit l'ennemi (la liste complète est TYPES_ENNEMIS, dans reglages.js) :
//   "gloup"  : petite boule violette, tient dans sa case.
//   "souche" : grosse souche, presque 2 cases de haut et un peu plus d'une case de large.
//              Elle est centrée sur sa case et déborde sur la case du dessus
//              et un peu sur celles de gauche et de droite : laisse ces cases vides.
// « capacite » choisit son tir (voir CAPACITES dans reglages.js).
//
// « fond » choisit le paysage qui défile derrière (voir dessinerFond dans dessin-decor.js) :
//   "plaine" : des collines (c'est le fond par défaut si on ne met rien).
//   "foret"  : les mêmes collines, avec deux rangées d'arbres en plus.
//   "grotte" : pas de ciel, de la roche brune avec des stalactites et des stalagmites.
//
// « nom » (facultatif) s'affiche en haut de la carte du monde quand le renard est sur la ville du niveau.
//
// La liste « decorations » (facultative) marche pareil, mais ce sont des dessins sans hitbox :
// le joueur, les ennemis et les tirs passent à travers.
//   "arbre" : environ 3 cases de haut, posé en bas de sa case, centré dessus.
//             Mets-le sur une case juste au-dessus du sol (ligne 14 pour le sol de base).
const NIVEAUX = [
  // ---------- Niveau 1 ----------
  {
    nom: "La plaine",
    fond: "plaine",
    carte: [
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
    ],
    ennemis: [
      { colonne: 18, ligne: 14, type: "souche", capacite: "dard-venin" },
      { colonne: 24, ligne: 14, type: "gloup", capacite: "dard-venin" },
      { colonne: 31, ligne: 14, type: "gloup", capacite: "dard-venin" },
      { colonne: 49, ligne: 10, type: "gloup", capacite: "dard-venin" },
      { colonne: 55, ligne: 14, type: "gloup", capacite: "dard-venin" },
      { colonne: 57, ligne: 14, type: "gloup", capacite: "dard-venin" },
      { colonne: 86, ligne: 14, type: "gloup", capacite: "dard-venin" },
      { colonne: 95, ligne: 14, type: "gloup", capacite: "dard-venin" },
      { colonne: 105, ligne: 14, type: "gloup", capacite: "dard-venin" },
    ],
  },

  // ---------- Niveau 2 : plus de trous, plus de pics, et des ennemis qui tirent à travers les murs ----------
  {
    nom: "La forêt",
    fond: "foret",
    carte: [
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "                                                                        oooo                             ooo",
      "                                                 oooo          oo                                                              XX",
      "      ooo  ?        B?B                   ?                           BBBBBBBB      ?B?                       B?B?B           XXX",
      "                                                XXXXXX         BB                                         X                  XXXX",
      "                                               XXXXXXX                                                X   X                 XXXXX",
      "   P                         ^^               XXXXXXXX                         ^^                     X^^^X                XXXXXX     F",
      "################   #################    #####################      #########################    #####################   ####################",
      "################   #################    #####################      #########################    #####################   ####################",
    ],
    ennemis: [
      { colonne: 33, ligne: 14, type: "gloup", capacite: "dard-venin" },
      { colonne: 51, ligne: 11, type: "gloup", capacite: "dard-venin" },  // sur le plateau de pierre
      { colonne: 57, ligne: 14, type: "gloup", capacite: "balle-ombre" },
      { colonne: 74, ligne: 10, type: "gloup", capacite: "dard-venin" },  // sur la plateforme en briques
      { colonne: 82, ligne: 14, type: "gloup", capacite: "dard-venin" },
      { colonne: 88, ligne: 14, type: "gloup", capacite: "balle-ombre" },
      { colonne: 110, ligne: 14, type: "gloup", capacite: "dard-venin" },
      { colonne: 114, ligne: 14, type: "gloup", capacite: "balle-ombre" },
    ],
    decorations: [
      { colonne: 9, ligne: 14, type: "arbre" },
      { colonne: 24, ligne: 14, type: "arbre" },
      { colonne: 43, ligne: 14, type: "arbre" },
      { colonne: 69, ligne: 14, type: "arbre" },
      { colonne: 98, ligne: 14, type: "arbre" },
      { colonne: 131, ligne: 14, type: "arbre" },
    ],
  },

  // ---------- Niveau 3 : dans une grotte, avec des passages où le plafond est bas ----------
  {
    nom: "La grotte",
    fond: "grotte",
    carte: [
      "RRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRR",
      "RRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRR",
      "                       RRRRRRRRRRRRRRR            R            RR             RRRRRRRRRRRRRRR            R         R",
      "                       RRRRRRRRRRRRRRR            R            RR             RRRRRRRRRRRRRRR            R         R",
      "                       RRRRRRRRRRRRRRR            R            RR             RRRRRRRRRRRRRRR            R         R",
      "                        RRRRRRRRRRRRRR            R            RR             RRRRRRRRRRRRRRR                      R",
      "                        RRRRRRRRRRRRRR                         RR              RRRRRRRRRRRRRR",
      "                        RRRRRRRRRRRRR                                          RRRRRRRRRRRRR",
      "                         RRRRRRRRRRRR                 oo?oo                    RRRRRRRRRRRRR",
      "                         RRRRRRRRRRRR",
      "                                                                                                 ooo                            XX",
      "       ooo  ?                                        RRRRRRR                       ?R?                                         XXX",
      "                            oooooo                                                     oooo      RRR            RR            XXXX",
      "                                               RR                                                               RR           XXXXX",
      "   P                                           RR      ^^^                                                  ^^  RR          XXXXXX     F",
      "RRRRRRRRRRRRRRRR   RRRRRRRRRRRRRRRRRRRRRR    RRRRRRRRRRRRRRRRRRRRRRRRRR   RRRRRRRRRRRRRRRRRRRRRR     RRRRRRRRRRRRRRR   RRRRRRRRRRRRRRRRRRRRR",
      "RRRRRRRRRRRRRRRR   RRRRRRRRRRRRRRRRRRRRRR    RRRRRRRRRRRRRRRRRRRRRRRRRR   RRRRRRRRRRRRRRRRRRRRRR     RRRRRRRRRRRRRRR   RRRRRRRRRRRRRRRRRRRRR",
    ],
    ennemis: [
      { colonne: 13, ligne: 14, type: "gloup", capacite: "dard-venin" },
      { colonne: 33, ligne: 14, type: "gloup", capacite: "dard-venin" },  // dans le premier tunnel
      { colonne: 56, ligne: 10, type: "gloup", capacite: "dard-venin" },  // sur la roche au-dessus des pics
      { colonne: 66, ligne: 14, type: "gloup", capacite: "balle-ombre" },
      { colonne: 80, ligne: 14, type: "gloup", capacite: "balle-ombre" }, // dans le deuxième tunnel
      { colonne: 89, ligne: 14, type: "souche", capacite: "dard-venin" },
      { colonne: 106, ligne: 14, type: "gloup", capacite: "dard-venin" },
      { colonne: 121, ligne: 14, type: "gloup", capacite: "balle-ombre" },
    ],
  },
];

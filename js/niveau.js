// =====================================================
//  Les cartes des niveaux, dans l'ordre où on les joue
// =====================================================

// Chaque caractère est une case de 32×32 px :
//   #  sol            X  bloc de pierre     B  brique
//   ?  bloc bonus     o  pièce              ^  pics
//   P  départ du joueur                     F  drapeau d'arrivée
// Une carte fait 17 lignes de haut : le sol commence à la ligne 15.
//
// Les ennemis ne sont pas dans la carte : ils sont dans la liste « ennemis » de chaque niveau.
// Chaque ennemi apparaît dans la case indiquée, avec les mêmes numéros que la carte :
// colonne 0 = tout à gauche, ligne 0 = tout en haut.
// Il est posé en bas de sa case ; si la case est en l'air, il tombe jusqu'au sol.
const NIVEAUX = [
  // ---------- Niveau 1 ----------
  {
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
      { colonne: 24, ligne: 14, capacite: "dard-venin" },
      { colonne: 31, ligne: 14, capacite: "dard-venin" },
      { colonne: 49, ligne: 10, capacite: "dard-venin" },
      { colonne: 55, ligne: 14, capacite: "dard-venin" },
      { colonne: 57, ligne: 14, capacite: "dard-venin" },
      { colonne: 86, ligne: 14, capacite: "dard-venin" },
      { colonne: 95, ligne: 14, capacite: "dard-venin" },
      { colonne: 105, ligne: 14, capacite: "dard-venin" },
    ],
  },

  // ---------- Niveau 2 : plus de trous, plus de pics, et des ennemis qui tirent à travers les murs ----------
  {
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
      { colonne: 33, ligne: 14, capacite: "dard-venin" },
      { colonne: 51, ligne: 11, capacite: "dard-venin" },  // sur le plateau de pierre
      { colonne: 57, ligne: 14, capacite: "balle-ombre" },
      { colonne: 74, ligne: 10, capacite: "dard-venin" },  // sur la plateforme en briques
      { colonne: 82, ligne: 14, capacite: "dard-venin" },
      { colonne: 88, ligne: 14, capacite: "balle-ombre" },
      { colonne: 110, ligne: 14, capacite: "dard-venin" },
      { colonne: 114, ligne: 14, capacite: "balle-ombre" },
    ],
  },
];

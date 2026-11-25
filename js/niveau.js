// =====================================================
//  Les cartes des niveaux, dans l'ordre où on les joue
// =====================================================

// Chaque caractère est une case de 32×32 px :
//   #  sol            X  bloc de pierre     B  brique
//   ?  bloc bonus     o  pièce              ^  pics
//   P  départ du joueur
//   R  roche de grotte (sol, murs, plafond : comme # mais sans herbe)
// Une carte fait 17 lignes de haut : le sol commence à la ligne 15.
// Le niveau est gagné quand le Pokémon atteint les dernières colonnes de la carte
// (CASES_ARRIVEE dans reglages.js) : la largeur de la carte, c'est celle de sa plus longue ligne.
// Les premières colonnes (autant) ramènent au niveau précédent : garde P en dehors.
// En revenant du niveau suivant, le Pokémon apparaît à la même distance du bord droit que P du bord gauche,
// sur le sol de cette colonne.
//
// Les ennemis ne sont pas dans la carte : ils sont dans la liste « ennemis » de chaque niveau.
// Chaque ennemi apparaît dans la case indiquée, avec les mêmes numéros que la carte :
// colonne 0 = tout à gauche, ligne 0 = tout en haut.
// Il est posé en bas de sa case ; si la case est en l'air, il tombe jusqu'au sol (sauf s'il est de type vol).
//
// « nom » choisit l'ennemi (la liste complète est POKEDEX, dans reglages.js) :
//   "aspicot"    : petite chenille jaune, tient dans sa case.
//   "simularbre" : faux arbre, presque 2 cases de haut et un peu plus d'une case de large.
//                  Il est centré sur sa case et déborde sur la case du dessus
//                  et un peu sur celles de gauche et de droite : laisse ces cases vides.
//   "salameche"  : petit lézard orange, tient dans sa case (comme le joueur). Il va bien avec la capacité "flammeche".
//   "fantominus" : boule de gaz, tient dans sa case. Il est de type vol, donc il flotte : il reste à la hauteur de sa case,
//                  passe au-dessus des trous et ne fait demi-tour que contre un mur.
//                  Touché par anti-air, il perd son type vol et tombe : il marche alors comme les autres.
//                  Il va bien avec la capacité "balle-ombre".
// « capacite » choisit son tir (voir CAPACITES dans reglages.js).
//
// « fond » choisit le paysage qui défile derrière (voir dessinerFond dans dessin-decor.js) :
//   "plaine" : des collines (c'est le fond par défaut si on ne met rien).
//   "foret"  : les mêmes collines, avec deux rangées d'arbres en plus.
//   "grotte" : pas de ciel, de la roche brune avec des stalactites et des stalagmites.
//
// « nom » (facultatif) s'affiche en haut de la carte du monde quand le Pokémon est sur le niveau.
// Les niveaux sont posés sur la carte dans l'ordre de cette liste : villes et morceaux de chemin
// à la suite (voir carte-monde.js).
//
// La liste « decorations » (facultative) marche pareil, mais ce sont des dessins sans hitbox :
// le joueur, les ennemis et les tirs passent à travers.
//   "arbre" : environ 3 cases de haut, posé en bas de sa case, centré dessus.
//             Mets-le sur une case juste au-dessus du sol (ligne 14 pour le sol de base).
//
// La liste « centresPokemon » (facultative) marche pareil : chaque centre est un bâtiment
// de 5 cases de large et 3,5 de haut (TAILLE_CENTRE_POKEMON dans reglages.js), posé en bas de sa case et centré dessus.
// Il ne bloque rien : le Pokémon passe devant, et s'il est blessé, il est soigné entièrement
// (tous ses PV, et plus de brûlure ni de poison).
// Passer devant enregistre aussi le point de sauvegarde (là où il reprend s'il est K.O.),
// et remet à neuf les niveaux déjà quittés : leurs ennemis, leurs pièces et leurs blocs bonus reviennent.
const NIVEAUX = [
  // ---------- Niveau 1 : une petite pause, sans danger, avec un centre Pokémon pour se soigner ----------
  {
    nom: "Le centre Pokémon",
    fond: "plaine",
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
      "",
      "",
      "",
      "",
      "",
      "   P",
      "########################################",
      "########################################",
    ],
    ennemis: [],
    centresPokemon: [
      { colonne: 20, ligne: 14 },
    ],
  },

  // ---------- Niveau 2 ----------
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
      "                                                                                             oooo",
      "        ooo   ?  B?B?B                        BBBBBB         ?B?B?     oo                   BBBBBB",
      "                                   X                                  o  o",
      "                           X       X",
      "   P                       X       X                                            ^^",
      "########################################   ###########################    ###########################   ######################",
      "########################################   ###########################    ###########################   ######################",
    ],
    ennemis: [
      { colonne: 18, ligne: 14, nom: "salameche", capacite: "flammeche" },
      { colonne: 24, ligne: 11, nom: "aspicot", capacite: "dard-venin" },
      { colonne: 31, ligne: 9, nom: "fantominus", capacite: "balle-ombre" },
      { colonne: 49, ligne: 10, nom: "aspicot", capacite: "dard-venin" },
      { colonne: 55, ligne: 14, nom: "aspicot", capacite: "dard-venin" },
      { colonne: 57, ligne: 14, nom: "aspicot", capacite: "dard-venin" },
      { colonne: 86, ligne: 14, nom: "aspicot", capacite: "dard-venin" },
      { colonne: 95, ligne: 14, nom: "aspicot", capacite: "dard-venin" },
      { colonne: 105, ligne: 14, nom: "aspicot", capacite: "dard-venin" },
    ],
  },

  // ---------- Niveau 3 : plus de trous, plus de pics, et des ennemis qui tirent à travers les murs ----------
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
      "                                                 oooo          oo",
      "      ooo  ?        B?B                   ?                           BBBBBBBB      ?B?                       B?B?B",
      "                                                XXXXXX         BB                                         X",
      "                                               XXXXXXX                                                X   X",
      "   P                         ^^               XXXXXXXX                         ^^                     X^^^X",
      "################   #################    #####################      #########################    #####################   ####################",
      "################   #################    #####################      #########################    #####################   ####################",
    ],
    ennemis: [
      { colonne: 33, ligne: 14, nom: "aspicot", capacite: "dard-venin" },
      { colonne: 51, ligne: 11, nom: "aspicot", capacite: "dard-venin" },  // sur le plateau de pierre
      { colonne: 57, ligne: 14, nom: "aspicot", capacite: "balle-ombre" },
      { colonne: 74, ligne: 10, nom: "aspicot", capacite: "dard-venin" },  // sur la plateforme en briques
      { colonne: 82, ligne: 14, nom: "aspicot", capacite: "dard-venin" },
      { colonne: 88, ligne: 14, nom: "aspicot", capacite: "balle-ombre" },
      { colonne: 110, ligne: 14, nom: "aspicot", capacite: "dard-venin" },
      { colonne: 114, ligne: 14, nom: "aspicot", capacite: "balle-ombre" },
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

  // ---------- Niveau 4 : une petite pause, sans danger, avec un centre Pokémon pour se soigner ----------
  {
    nom: "Le centre Pokémon",
    fond: "plaine",
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
      "",
      "",
      "",
      "",
      "",
      "   P",
      "########################################",
      "########################################",
    ],
    ennemis: [],
    centresPokemon: [
      { colonne: 20, ligne: 14 },
    ],
  },

  // ---------- Niveau 5 : dans une grotte, avec des passages où le plafond est bas ----------
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
      "                                                                                                 ooo",
      "       ooo  ?                                        RRRRRRR                       ?R?",
      "                            oooooo                                                     oooo      RRR            RR",
      "                                               RR                                                               RR",
      "   P                                           RR      ^^^                                                  ^^  RR",
      "RRRRRRRRRRRRRRRR   RRRRRRRRRRRRRRRRRRRRRR    RRRRRRRRRRRRRRRRRRRRRRRRRR   RRRRRRRRRRRRRRRRRRRRRR     RRRRRRRRRRRRRRR   RRRRRRRRRRRRRRRRRRRRR",
      "RRRRRRRRRRRRRRRR   RRRRRRRRRRRRRRRRRRRRRR    RRRRRRRRRRRRRRRRRRRRRRRRRR   RRRRRRRRRRRRRRRRRRRRRR     RRRRRRRRRRRRRRR   RRRRRRRRRRRRRRRRRRRRR",
    ],
    ennemis: [
      { colonne: 13, ligne: 14, nom: "aspicot", capacite: "dard-venin" },
      { colonne: 33, ligne: 14, nom: "aspicot", capacite: "dard-venin" },  // dans le premier tunnel
      { colonne: 56, ligne: 10, nom: "aspicot", capacite: "dard-venin" },  // sur la roche au-dessus des pics
      { colonne: 66, ligne: 14, nom: "aspicot", capacite: "balle-ombre" },
      { colonne: 80, ligne: 14, nom: "aspicot", capacite: "balle-ombre" }, // dans le deuxième tunnel
      { colonne: 89, ligne: 14, nom: "simularbre", capacite: "dard-venin" },
      { colonne: 106, ligne: 14, nom: "aspicot", capacite: "dard-venin" },
      { colonne: 121, ligne: 14, nom: "aspicot", capacite: "balle-ombre" },
    ],
  },

  // ---------- Niveau 6 : retour dans la plaine, avec des escaliers et un fantominus dans un bac en briques ----------
  {
    nom: "Les collines",
    fond: "plaine",
    carte: [
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "                                         ooo                ooooo                                    ooo",
      "                                                                                      oo",
      "                                                 ooo",
      "       ooo   ?                          BB?BB             B       B    oooo          X  X           B?B?B",
      "                      ooo           X            BBB      BBBB?BBBB                 XX  XX                            ooo",
      "                              X     X                                              XXX  XXX",
      "   P                          X     X                                   ^^        XXXX  XXXX",
      "######################   #######################     #################################  ##############################   ####################",
      "######################   #######################     #################################  ##############################   ####################",
    ],
    ennemis: [
      { colonne: 17, ligne: 14, nom: "aspicot", capacite: "dard-venin" },
      { colonne: 33, ligne: 14, nom: "salameche", capacite: "flammeche" },   // coincé entre les deux colonnes de pierre
      { colonne: 42, ligne: 10, nom: "aspicot", capacite: "dard-venin" },    // sur les briques
      { colonne: 55, ligne: 14, nom: "aspicot", capacite: "dard-venin" },
      { colonne: 62, ligne: 11, nom: "fantominus", capacite: "balle-ombre" }, // dans le bac : il va et vient entre les deux briques du bord
      { colonne: 77, ligne: 14, nom: "aspicot", capacite: "dard-venin" },
      { colonne: 96, ligne: 14, nom: "salameche", capacite: "flammeche" },
      { colonne: 108, ligne: 14, nom: "simularbre", capacite: "dard-venin" },
      { colonne: 114, ligne: 14, nom: "aspicot", capacite: "dard-venin" },
    ],
  },

  // ---------- Niveau 7 : une petite pause, sans danger, avec un centre Pokémon pour se soigner ----------
  {
    nom: "Le centre Pokémon",
    fond: "plaine",
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
      "",
      "",
      "",
      "",
      "",
      "   P",
      "########################################",
      "########################################",
    ],
    ennemis: [],
    centresPokemon: [
      { colonne: 20, ligne: 14 },
    ],
  },

  // ---------- Niveau 8 : la grande plaine, avec une grande fosse à traverser sur des plateformes ----------
  {
    nom: "La grande plaine",
    fond: "plaine",
    carte: [
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "                                                  ooo                     ooo",
      "                                                                                                                ooo                ooo",
      "",
      "                                   ooo            B?B  oo                B?B?B",
      "       ooo  ?B?          oooo                                                                 ooo              X   X              BB?BB",
      "                                              BB       BB             X         X                             XX   XX                         ooo",
      "                                  X   X                               X         X                            XXX   XXX",
      "   P                              X^^^X                               X         X                           XXXX   XXXX                  ^^",
      "#########################    ###############               ##################################     ##############   ###########################   ####################",
      "#########################    ###############               ##################################     ##############   ###########################   ####################",
    ],
    ennemis: [
      { colonne: 18, ligne: 14, nom: "aspicot", capacite: "dard-venin" },
      { colonne: 21, ligne: 14, nom: "aspicot", capacite: "dard-venin" },
      { colonne: 51, ligne: 9, nom: "aspicot", capacite: "dard-venin" },      // sur la plateforme du milieu de la fosse
      { colonne: 63, ligne: 14, nom: "salameche", capacite: "flammeche" },
      { colonne: 75, ligne: 14, nom: "fantominus", capacite: "balle-ombre" }, // dans l'enclos, à la hauteur du Pokémon
      { colonne: 86, ligne: 14, nom: "aspicot", capacite: "balle-ombre" },
      { colonne: 89, ligne: 14, nom: "aspicot", capacite: "dard-venin" },
      { colonne: 103, ligne: 14, nom: "simularbre", capacite: "dard-venin" },
      { colonne: 123, ligne: 14, nom: "salameche", capacite: "flammeche" },
      { colonne: 132, ligne: 10, nom: "aspicot", capacite: "dard-venin" },    // sur les briques
      { colonne: 135, ligne: 14, nom: "aspicot", capacite: "balle-ombre" },
    ],
  },
];

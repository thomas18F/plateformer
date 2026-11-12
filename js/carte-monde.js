// =====================================================
//  La carte du monde : les villes (une par niveau) reliées par des chemins
// =====================================================

// Chaque caractère est une case de 32×32 px : la carte remplit tout l'écran (30 colonnes × 17 lignes).
//   ~  eau            .  terre
//   =  chemin         -  pont (un chemin posé sur l'eau)
//   1 à 9  ville : le chiffre est le numéro du niveau (1 = niveau 1…)
//
// Le renard va de ville en ville en suivant les chemins (= et -) :
// il faut donc que les villes qui se suivent (1 et 2, 2 et 3…) soient reliées par un chemin.
// Une ville sans niveau (par exemple un 4 alors qu'il n'y a que 3 niveaux) reste fermée.
const CARTE_MONDE = [
  "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~",
  "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~",
  "~~~~~~~~.......~~~~~~~~~~..~~~",
  "~~~~~............~~~~~~~~~~~~~",
  "~~~...............~~~~~~~~~~~~",
  "~~........===2====.~~~~~~~~~~~",
  "~..~~~....=......=.~~~......~~",
  "~..~~~~...=......=.~~........~",
  "~...~~....=......=.~~........~",
  "~.........=......==--===3....~",
  "~.........=........~~........~",
  "~.....1====.......~~~.......~~",
  "~~...............~~~~~......~~",
  "~~~.............~~~~~~~....~~~",
  "~~~~~........~~~~~~~~~~~~~~~~~",
  "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~",
  "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~",
];

// ---------- Lecture de la carte ----------
function caseMonde(c, r) {
  return (CARTE_MONDE[r] || "")[c] || "~"; // hors de la carte : de l'eau
}

function estVille(ch) {
  return ch >= "1" && ch <= "9";
}

// Les cases où le renard peut marcher
function estChemin(ch) {
  return ch === "=" || ch === "-" || estVille(ch);
}

// Tout ce qui est posé sur la terre (le pont, lui, est posé sur l'eau)
function estTerre(ch) {
  return ch === "." || ch === "=" || estVille(ch);
}

// VILLES[0] = la case de la ville du niveau 1, VILLES[1] = celle du niveau 2…
const VILLES = [];
CARTE_MONDE.forEach((ligne, r) => {
  [...ligne].forEach((ch, c) => {
    if (estVille(ch)) VILLES[Number(ch) - 1] = { c, r };
  });
});
NIVEAUX.forEach((niveau, i) => {
  if (!VILLES[i]) console.warn(`Le niveau ${i + 1} n'a pas de ville sur la carte du monde : ajoute un ${i + 1} dans CARTE_MONDE (carte-monde.js).`);
});

function villeDuNiveau(n) {
  return VILLES[n] || { c: 0, r: 0 };
}

// Le chemin le plus court d'une case à une autre, en marchant seulement sur les chemins et les villes.
// On part du départ et on avance d'une case à la fois dans toutes les directions,
// en notant d'où on vient ; une fois l'arrivée trouvée, on remonte jusqu'au départ.
function trouverRoute(depart, arrivee) {
  const cle = (p) => p.c + "," + p.r;
  const venantDe = { [cle(depart)]: null };
  const aVisiter = [depart];
  while (aVisiter.length > 0) {
    const ici = aVisiter.shift();
    if (ici.c === arrivee.c && ici.r === arrivee.r) {
      const route = [];
      for (let p = ici; p; p = venantDe[cle(p)]) route.unshift(p);
      return route;
    }
    for (const [dc, dr] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const voisin = { c: ici.c + dc, r: ici.r + dr };
      if (cle(voisin) in venantDe || !estChemin(caseMonde(voisin.c, voisin.r))) continue;
      venantDe[cle(voisin)] = ici;
      aVisiter.push(voisin);
    }
  }
  return [depart, arrivee]; // pas de chemin entre les deux : il ira tout droit
}

// Les morceaux de chemin à dessiner : un rectangle entre chaque paire de cases voisines.
// « route » = n si le morceau sert à aller de la ville du niveau n+1 à la suivante,
// pour l'allumer quand cette ville s'ouvre (-1 : il ne mène nulle part de spécial).
const MORCEAUX_CHEMIN = [];
{
  const routes = {};
  for (let n = 0; n < NIVEAUX.length - 1; n++) {
    const route = trouverRoute(villeDuNiveau(n), villeDuNiveau(n + 1));
    for (let i = 1; i < route.length; i++) {
      routes[`${route[i - 1].c},${route[i - 1].r}>${route[i].c},${route[i].r}`] = n;
      routes[`${route[i].c},${route[i].r}>${route[i - 1].c},${route[i - 1].r}`] = n;
    }
  }
  for (let r = 0; r < CARTE_MONDE.length; r++) {
    for (let c = 0; c < CARTE_MONDE[r].length; c++) {
      if (!estChemin(caseMonde(c, r))) continue;
      for (const [c2, r2] of [[c + 1, r], [c, r + 1]]) { // à droite et en dessous : chaque paire une seule fois
        if (!estChemin(caseMonde(c2, r2))) continue;
        const route = routes[`${c},${r}>${c2},${r2}`];
        MORCEAUX_CHEMIN.push({ c, r, c2, r2, route: route === undefined ? -1 : route });
      }
    }
  }
}

// ---------- Le renard sur la carte ----------
// x, y : le point du chemin où il se trouve (milieu d'une case quand il est arrêté).
// etapes : les points qu'il lui reste à atteindre ; vide quand il ne bouge pas.
const renardCarte = { x: 0, y: 0, dir: 1, anim: 0, etapes: [] };

function centreCase({ c, r }) {
  return { x: c * TILE + TILE / 2, y: r * TILE + TILE / 2 };
}

// Affiche la carte, avec le renard posé sur la ville du niveau en cours
function ouvrirCarte() {
  Object.assign(renardCarte, centreCase(villeDuNiveau(numeroNiveau)));
  renardCarte.etapes = [];
  etat = "carte";
}

// Le renard part vers la ville du niveau n en suivant les chemins
function partirVers(n) {
  const route = trouverRoute(villeDuNiveau(numeroNiveau), villeDuNiveau(n));
  renardCarte.etapes = route.slice(1).map(centreCase);
  numeroNiveau = n;
}

function majCarte(dt) {
  const r = renardCarte;

  // En marche : il avance vers la prochaine étape, sans écouter les touches
  if (r.etapes.length > 0) {
    const cible = r.etapes[0];
    const dx = cible.x - r.x;
    const dy = cible.y - r.y;
    const distance = Math.hypot(dx, dy);
    const pas = VITESSE_CARTE * dt;
    if (Math.abs(dx) > 0.5) r.dir = Math.sign(dx);
    if (distance <= pas) {
      r.x = cible.x;
      r.y = cible.y;
      r.etapes.shift();
    } else {
      r.x += (dx / distance) * pas;
      r.y += (dy / distance) * pas;
    }
    r.anim += pas;
    return;
  }

  // Arrêté sur une ville
  if (appuye.droite) {
    if (numeroNiveau < niveauDebloque) partirVers(numeroNiveau + 1);
    else sons.bloc(); // la ville suivante est encore fermée
  } else if (appuye.gauche && numeroNiveau > 0) {
    partirVers(numeroNiveau - 1);
  } else if (appuye.entree || appuye.saut) {
    chargerNiveau();
    etat = "jeu";
  }
}

// ---------- Dessin de la carte ----------
const COULEURS_CARTE = {
  eau: "#3a8fd6",
  vague: "rgba(255, 255, 255, 0.35)",
  hautFond: "#74cdee",     // l'eau claire le long des côtes
  terre: "#5aae48",
  herbe: "#74c65c",
  chemin: "#f6cd45",
  cheminBord: "#c98a1c",
  cheminFerme: "#e6dcb2",  // chemin vers une ville pas encore ouverte
  cheminFermeBord: "#a99c6c",
  ville: "#e53935",
  villeBord: "#8e1b1b",
  villeReflet: "#ff8a7a",
  villeFermee: "#9a7c7c",
  villeFermeeBord: "#5e4848",
};

// Le renard se tient un peu au-dessus du milieu de la case, pour qu'on voie la ville sous ses pattes
const DECALAGE_RENARD_CARTE = 10;

function dessinerCarte() {
  const coul = COULEURS_CARTE;
  ctx.fillStyle = coul.eau;
  ctx.fillRect(0, 0, W, H);

  // Quelques vaguelettes qui ondulent au large
  ctx.fillStyle = coul.vague;
  pourChaqueCase((ch, x, y, c, r) => {
    if (ch === "~" && hasard(c * 7 + r * 13) < 0.12) {
      ctx.fillRect(x + 8 + Math.sin(temps * 1.5 + c) * 3, y + 15, 12, 2);
    }
  });

  // Eau claire autour de la terre : chaque case de terre « déborde » un peu sur l'eau
  ctx.fillStyle = coul.hautFond;
  pourChaqueCase((ch, x, y, c, r) => {
    if (estTerre(ch)) caseDeTerre(x, y, c, r, 6);
  });

  // La terre
  pourChaqueCase((ch, x, y, c, r) => {
    if (!estTerre(ch)) return;
    ctx.fillStyle = coul.terre;
    caseDeTerre(x, y, c, r, 0);
    const h = hasard(c * 7 + r * 13);
    if (ch === "." && h < 0.4) {
      ctx.fillStyle = coul.herbe; // une touffe d'herbe plus claire
      ellipse(x + 8 + h * 30, y + 10 + h * 25, 5, 3);
    }
  });

  // Les chemins : des rectangles jaunes d'un milieu de case à l'autre.
  // D'abord tous les bords (plus larges), puis l'intérieur par-dessus.
  for (const [largeur, ouvert, ferme] of [[16, coul.cheminBord, coul.cheminFermeBord], [10, coul.chemin, coul.cheminFerme]]) {
    for (const m of MORCEAUX_CHEMIN) {
      ctx.fillStyle = m.route >= 0 && m.route < niveauDebloque ? ouvert : ferme;
      const a = centreCase(m);
      const b = centreCase({ c: m.c2, r: m.r2 });
      ctx.fillRect(a.x - largeur / 2, a.y - largeur / 2, b.x - a.x + largeur, b.y - a.y + largeur);
    }
  }

  // Les villes : des carrés rouges, avec leur numéro de niveau
  ctx.font = "bold 15px system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  pourChaqueCase((ch, x, y) => {
    if (!estVille(ch)) return;
    const ouverte = Number(ch) - 1 <= niveauDebloque;
    ctx.fillStyle = ouverte ? coul.villeBord : coul.villeFermeeBord;
    ctx.fillRect(x + 4, y + 4, TILE - 8, TILE - 8);
    ctx.fillStyle = ouverte ? coul.ville : coul.villeFermee;
    ctx.fillRect(x + 6, y + 6, TILE - 12, TILE - 12);
    if (ouverte) {
      ctx.fillStyle = coul.villeReflet;
      ctx.fillRect(x + 6, y + 6, TILE - 12, 3);
    }
    ctx.fillStyle = ouverte ? "#fff" : "#d9caca";
    ctx.fillText(ch, x + TILE / 2, y + TILE / 2 + 1);
  });

  // Le renard (le même dessin que dans les niveaux)
  const r = renardCarte;
  dessinerJoueur({
    x: r.x - 11, y: r.y - DECALAGE_RENARD_CARTE - 30, l: 22, h: 30,
    dir: r.dir, auSol: true, mort: false,
    vx: r.etapes.length > 0 ? VITESSE_CARTE : 0, anim: r.anim,
  });

  dessinerInfosCarte();
}

// Une case de terre, agrandie de « marge » px de chaque côté (0 : juste la case),
// avec les coins arrondis là où elle touche l'eau sur deux côtés
function caseDeTerre(x, y, c, r, marge) {
  const eau = (dc, dr) => !estTerre(caseMonde(c + dc, r + dr));
  const arrondi = (a, b) => (a && b ? 12 + marge : 0);
  ctx.beginPath();
  ctx.roundRect(x - marge, y - marge, TILE + 2 * marge, TILE + 2 * marge, [
    arrondi(eau(0, -1), eau(-1, 0)), // en haut à gauche
    arrondi(eau(0, -1), eau(1, 0)),  // en haut à droite
    arrondi(eau(0, 1), eau(1, 0)),   // en bas à droite
    arrondi(eau(0, 1), eau(-1, 0)),  // en bas à gauche
  ]);
  ctx.fill();
}

// Appelle « faire » pour chaque case de la carte, avec son caractère et sa position en pixels
function pourChaqueCase(faire) {
  for (let r = 0; r < CARTE_MONDE.length; r++) {
    for (let c = 0; c < CARTE_MONDE[r].length; c++) {
      faire(CARTE_MONDE[r][c], c * TILE, r * TILE, c, r);
    }
  }
}

function dessinerInfosCarte() {
  const niveau = NIVEAUX[numeroNiveau];
  ctx.textBaseline = "middle";

  ctx.textAlign = "left";
  ctx.font = "bold 20px system-ui, sans-serif";
  dessinerPiece(30, 28, temps * 4);
  texteContour(`× ${String(nbPieces).padStart(2, "0")}`, 44, 28);

  ctx.textAlign = "center";
  ctx.font = "bold 26px system-ui, sans-serif";
  const nom = niveau.nom ? ` : ${niveau.nom}` : "";
  texteContour(`Niveau ${numeroNiveau + 1}${nom}`, W / 2, 28, "#ffe27a", 6);

  ctx.font = "18px system-ui, sans-serif";
  texteContour("← → : changer de ville        Entrée : jouer", W / 2, H - 24);
}

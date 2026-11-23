// =====================================================
//  La carte du monde : les villes reliées par des chemins.
//  Les villes et les morceaux de chemin entre elles sont les niveaux.
// =====================================================

// Chaque caractère est une case de CASE_CARTE × CASE_CARTE px (16 × 16) :
// la carte remplit tout l'écran avec 60 colonnes × 34 lignes.
//   ~  eau            .  terre
//   =  chemin         -  pont (un chemin posé sur l'eau)
//   A à Z  ville : le Pokémon les visite dans l'ordre de l'alphabet (A, puis B, puis C…)
//
// Le voyage va de ville en ville en suivant les chemins (= et -) :
// il faut donc que les villes qui se suivent (A et B, B et C…) soient reliées par un chemin.
//
// Les niveaux sont posés dans l'ordre où on les rencontre en suivant ce voyage :
// chaque ville est un niveau, et chaque morceau de chemin tout droit entre deux villes aussi
// (le niveau est au milieu du morceau). Un chemin qui tourne une fois entre A et B
// fait donc 2 niveaux : A = niveau 1, le morceau qui part de A = niveau 2,
// le morceau qui arrive à B = niveau 3, B = niveau 4…
// Le numéro de chaque niveau est écrit dessus sur la carte.
// Un endroit sans niveau (quand la carte a plus d'endroits que NIVEAUX n'a de niveaux) reste fermé.
// Garde de l'eau sur les 3 premières lignes et les 2 dernières : les textes s'y affichent.
const CASE_CARTE = 16;
const CARTE_MONDE = [
  "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~",
  "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~",
  "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~",
  "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~",
  "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~",
  "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~...~~~~~~~~~~~~~~~~~~~~~~",
  "~~~~~~~~~~~~~~~~~~~~~~~~~....~~~~~~..~~~~~~~.......~~~~~~~~~",
  "~~~~~~~~~~~~~~~~~~~...........~~~~~~~~~~~~=====N====.~~~~~~~",
  "~~~~~~~~~~~~.....J========K.....~~~~~~~~~.=........=..~~~~~~",
  "~~~~~~~~~~.......=........=......~~~~~~~..=........=...~~~~~",
  "~~~~~~~~~.I=======........======L=-----===M........=...~~~~~",
  "~~~~~~~...=.......................~~~~~............=....~~~~",
  "~~~~~~....=......................~~~~~~~...........O====~~~~",
  "~~~~~.....=~~~..................~~~~~~~~~..............=~~~~",
  "~~~~..H====~~~~................~~~~~~~~~~~.............=~~~~",
  "~~~~..=....~~~.................~~~~~~~~~~~~............=~~~~",
  "~~~...=.......................~~~~~~~~~~~~~~~~.........=.~~~",
  "~~~...=.....................~~~~~~~~~~~~~~~~~~~........P..~~",
  "~~~...=.........F=======E..~~~~~~~~~~~.~~~~~~~~~.......=..~~",
  "~~~...=.........=.......=...~~~~~~~~~~~~~~~~~~~~.......=.~~~",
  "~~~...=.........=.......=....~~~~~~~~~~~~~~~~~~~..Q=====.~~~",
  "~~~~..G==========.......======.~~~~~~~~~~~~~~~~~~.=.....~~~~",
  "~~~~.........................=..~~~~~~~~~~~~~~~~~~=...~~~~~~",
  "~~~..........................=...~~~~~~~~~~~~~~~~~-~~~~~~~~~",
  "~~...........................=...~~~~~~~~~~~~~~~~~-~~~~~~~~~",
  "~~..A.............C==========D...~~~~~~~~~~.......=~~~~~~~~~",
  "~~..=.............=..............~~~~~~~...S======R..~~~~~~~",
  "~~~.=.............=.............~~~~~~~....=..........~~~~~~",
  "~~~~======B========............~~~~~~~~....=====T.....~~~~~~",
  "~~~~~~~~.....~~~~~~~~~......~~~~~~~~~~~~.............~~~~~~~",
  "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~........~~~~~~~~~",
  "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~",
  "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~",
  "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~",
];

// ---------- Lecture de la carte ----------
function caseMonde(c, r) {
  return (CARTE_MONDE[r] || "")[c] || "~"; // hors de la carte : de l'eau
}

function estVille(ch) {
  return ch >= "A" && ch <= "Z";
}

// A → 0, B → 1… : l'ordre de visite des villes
function rangDeLaVille(ch) {
  return ch.charCodeAt(0) - "A".charCodeAt(0);
}

// Les cases de chemin (les villes en font partie)
function estChemin(ch) {
  return ch === "=" || ch === "-" || estVille(ch);
}

// Tout ce qui est posé sur la terre (le pont, lui, est posé sur l'eau)
function estTerre(ch) {
  return ch === "." || ch === "=" || estVille(ch);
}

// Le milieu d'une case, en pixels
function centreCase({ c, r }) {
  return { x: c * CASE_CARTE + CASE_CARTE / 2, y: r * CASE_CARTE + CASE_CARTE / 2 };
}

// VILLES[0] = la case de la ville A, VILLES[1] = celle de B…
const VILLES = [];
CARTE_MONDE.forEach((ligne, r) => {
  [...ligne].forEach((ch, c) => {
    if (estVille(ch)) VILLES[rangDeLaVille(ch)] = { c, r };
  });
});
// Les villes visitées : A, B, C… jusqu'à la première lettre qui manque
let nbVilles = 0;
while (VILLES[nbVilles]) nbVilles++;
if (nbVilles < VILLES.length) {
  const lettre = String.fromCharCode("A".charCodeAt(0) + nbVilles);
  console.warn(`Il manque la ville ${lettre} sur la carte du monde : les villes après elle ne sont pas visitées (carte-monde.js).`);
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

// ---------- Les étapes : les endroits des niveaux ----------
// ETAPES[0] est l'endroit du niveau 1 (NIVEAUX[0]), ETAPES[1] celui du niveau 2…
// Une étape est une ville { ville: true, x, y }, ou un morceau de chemin tout droit
// entre deux virages { ville: false, x, y } : x, y est alors le milieu du morceau.
const ETAPES = [];
// Pour colorer les chemins : l'étape dont fait partie le passage d'une case à sa voisine
const ETAPE_DU_PASSAGE = {};

function ajouterVille(v) {
  VILLES[v].etape = ETAPES.length;
  ETAPES.push({ ville: true, ...centreCase(VILLES[v]) });
}

function noterPassage(p, q, etape) {
  for (const cle of [`${p.c},${p.r}>${q.c},${q.r}`, `${q.c},${q.r}>${p.c},${p.r}`]) {
    if (!(cle in ETAPE_DU_PASSAGE)) ETAPE_DU_PASSAGE[cle] = etape;
  }
}

{
  // On passe par la case b sans tourner
  const toutDroit = (a, b, c) => b.c - a.c === c.c - b.c && b.r - a.r === c.r - b.r;

  if (nbVilles > 0) ajouterVille(0);
  for (let v = 0; v + 1 < nbVilles; v++) {
    // La route jusqu'à la ville suivante, coupée à chaque virage
    const route = trouverRoute(VILLES[v], VILLES[v + 1]);
    let debut = 0; // la case où commence le morceau tout droit en cours
    for (let i = 1; i < route.length; i++) {
      const arrivee = i === route.length - 1;
      if (!arrivee && toutDroit(route[i - 1], route[i], route[i + 1])) continue;
      // Le morceau va de route[debut] jusqu'à route[i], qui est un virage ou la ville suivante
      const a = centreCase(route[debut]);
      const b = centreCase(route[i]);
      const milieu = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
      ETAPES.push({ ville: false, ...milieu });
      for (let j = debut; j < i; j++) noterPassage(route[j], route[j + 1], ETAPES.length - 1);
      debut = i;
    }
    ajouterVille(v + 1);
  }
}

if (NIVEAUX.length > ETAPES.length) {
  console.warn(`Il y a ${NIVEAUX.length} niveaux mais seulement ${ETAPES.length} endroits pour eux sur la carte du monde : ajoute des villes ou des chemins dans CARTE_MONDE (carte-monde.js).`);
}

function etapeDuNiveau(n) {
  return ETAPES[n] || ETAPES[ETAPES.length - 1] || { x: 0, y: 0 };
}

// Les morceaux de chemin à dessiner : un rectangle entre chaque paire de cases voisines,
// avec l'étape dont il fait partie, pour l'allumer quand elle s'ouvre (-1 : il ne mène nulle part de spécial).
const MORCEAUX_CHEMIN = [];
for (let r = 0; r < CARTE_MONDE.length; r++) {
  for (let c = 0; c < CARTE_MONDE[r].length; c++) {
    if (!estChemin(caseMonde(c, r))) continue;
    for (const [c2, r2] of [[c + 1, r], [c, r + 1]]) { // à droite et en dessous : chaque paire une seule fois
      if (!estChemin(caseMonde(c2, r2))) continue;
      const etape = ETAPE_DU_PASSAGE[`${c},${r}>${c2},${r2}`];
      MORCEAUX_CHEMIN.push({ c, r, c2, r2, etape: etape === undefined ? -1 : etape });
    }
  }
}

// ---------- La carte ouverte ----------
// On l'ouvre avec M pendant un niveau (main.js) : elle montre seulement où on en est.
// Le niveau attend derrière, comme en pause ; on le reprend là où on en était.
function majCarte() {
  if (appuye.carte || appuye.entree || appuye.pause) etat = "jeu";
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
  cheminFerme: "#e6dcb2",  // chemin d'un niveau pas encore ouvert
  cheminFermeBord: "#a99c6c",
  ville: "#e53935",
  villeBord: "#8e1b1b",
  villeReflet: "#ff8a7a",
  villeFermee: "#9a7c7c",
  villeFermeeBord: "#5e4848",
  pastille: "#f57c00",       // un niveau sur un chemin
  pastilleBord: "#7a3d00",
  pastilleFermee: "#b8ab88",
  pastilleFermeeBord: "#6e6450",
};

// Sur la carte, le Pokémon est plus petit que dans les niveaux,
// et se tient un peu au-dessus du milieu de la case, pour qu'on voie la ville sous ses pattes
const TAILLE_POKEMON_CARTE = 0.7;
const DECALAGE_POKEMON_CARTE = 6;

function dessinerCarte() {
  const coul = COULEURS_CARTE;
  ctx.fillStyle = coul.eau;
  ctx.fillRect(0, 0, W, H);

  // Quelques vaguelettes qui ondulent au large
  ctx.fillStyle = coul.vague;
  pourChaqueCase((ch, x, y, c, r) => {
    if (ch === "~" && hasard(c * 7 + r * 13) < 0.05) {
      ctx.fillRect(x + 2 + Math.sin(temps * 1.5 + c) * 2, y + 8, 12, 2);
    }
  });

  // Eau claire autour de la terre : chaque case de terre « déborde » un peu sur l'eau
  ctx.fillStyle = coul.hautFond;
  pourChaqueCase((ch, x, y, c, r) => {
    if (estTerre(ch)) caseDeTerre(x, y, c, r, 4);
  });

  // La terre
  pourChaqueCase((ch, x, y, c, r) => {
    if (!estTerre(ch)) return;
    ctx.fillStyle = coul.terre;
    caseDeTerre(x, y, c, r, 0);
    const h = hasard(c * 7 + r * 13);
    if (ch === "." && h < 0.2) {
      ctx.fillStyle = coul.herbe; // une touffe d'herbe plus claire
      ellipse(x + 4 + h * 40, y + 5 + h * 30, 3, 2);
    }
  });

  // Les chemins : des rectangles jaunes d'un milieu de case à l'autre.
  // D'abord tous les bords (plus larges), puis l'intérieur par-dessus.
  for (const [largeur, ouvert, ferme] of [[10, coul.cheminBord, coul.cheminFermeBord], [6, coul.chemin, coul.cheminFerme]]) {
    for (const m of MORCEAUX_CHEMIN) {
      ctx.fillStyle = m.etape >= 0 && m.etape <= numeroNiveau ? ouvert : ferme;
      const a = centreCase(m);
      const b = centreCase({ c: m.c2, r: m.r2 });
      ctx.fillRect(a.x - largeur / 2, a.y - largeur / 2, b.x - a.x + largeur, b.y - a.y + largeur);
    }
  }

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  // Les niveaux sur les chemins : des pastilles rondes au milieu des morceaux tout droits, avec leur numéro
  ctx.font = "bold 10px system-ui, sans-serif";
  ETAPES.forEach((etape, n) => {
    if (etape.ville) return;
    const ouverte = n <= numeroNiveau;
    ctx.fillStyle = ouverte ? coul.pastilleBord : coul.pastilleFermeeBord;
    ellipse(etape.x, etape.y, 8, 8);
    ctx.fillStyle = ouverte ? coul.pastille : coul.pastilleFermee;
    ellipse(etape.x, etape.y, 6.5, 6.5);
    ctx.fillStyle = ouverte ? "#fff" : "#efe8d4";
    ctx.fillText(n + 1, etape.x, etape.y + 1);
  });

  // Les villes : des carrés rouges (un peu plus grands que leur case), avec leur numéro de niveau
  ctx.font = "bold 11px system-ui, sans-serif";
  pourChaqueCase((ch, x, y) => {
    if (!estVille(ch)) return;
    const n = VILLES[rangDeLaVille(ch)].etape; // pas d'étape : une lettre manque avant elle, elle n'est pas visitée
    const ouverte = n !== undefined && n <= numeroNiveau;
    ctx.fillStyle = ouverte ? coul.villeBord : coul.villeFermeeBord;
    ctx.fillRect(x - 3, y - 3, CASE_CARTE + 6, CASE_CARTE + 6);
    ctx.fillStyle = ouverte ? coul.ville : coul.villeFermee;
    ctx.fillRect(x - 1, y - 1, CASE_CARTE + 2, CASE_CARTE + 2);
    if (ouverte) {
      ctx.fillStyle = coul.villeReflet;
      ctx.fillRect(x - 1, y - 1, CASE_CARTE + 2, 2);
    }
    ctx.fillStyle = ouverte ? "#fff" : "#d9caca";
    if (n !== undefined) ctx.fillText(n + 1, x + CASE_CARTE / 2, y + CASE_CARTE / 2 + 1);
  });

  // Le Pokémon (le même dessin que dans les niveaux), posé sur l'endroit du niveau en cours
  const { x, y } = etapeDuNiveau(numeroNiveau);
  ctx.save();
  ctx.translate(x, y - DECALAGE_POKEMON_CARTE); // entre ses pattes
  ctx.scale(TAILLE_POKEMON_CARTE, TAILLE_POKEMON_CARTE);
  const espece = especeDuJoueur();
  dessinerJoueur({
    espece, x: -espece.l / 2, y: -espece.h, l: espece.l, h: espece.h,
    dir: 1, auSol: true, mort: false, vx: 0, anim: 0,
  });
  ctx.restore();

  dessinerInfosCarte();
}

// Une case de terre, agrandie de « marge » px de chaque côté (0 : juste la case),
// avec les coins arrondis là où elle touche l'eau sur deux côtés
function caseDeTerre(x, y, c, r, marge) {
  const eau = (dc, dr) => !estTerre(caseMonde(c + dc, r + dr));
  const arrondi = (a, b) => (a && b ? 7 + marge : 0);
  ctx.beginPath();
  ctx.roundRect(x - marge, y - marge, CASE_CARTE + 2 * marge, CASE_CARTE + 2 * marge, [
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
      faire(CARTE_MONDE[r][c], c * CASE_CARTE, r * CASE_CARTE, c, r);
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
  texteContour("M ou Entrée : reprendre le niveau", W / 2, H - 24);
}

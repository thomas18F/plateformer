// =====================================================
//  Dessin des pièces, du personnage et des ennemis
// =====================================================

function dessinerPiece(cx, cy, phase) {
  const largeur = Math.max(1.5, Math.abs(Math.cos(phase)) * 8); // la pièce tourne
  ctx.fillStyle = "#c98a0c";
  ellipse(cx, cy, largeur, 10);
  ctx.fillStyle = "#ffd23f";
  ellipse(cx, cy, largeur * 0.65, 7);
}

// Sans rien entre les parenthèses, c'est le personnage du niveau ; la carte du monde passe le sien.
// Le dessin est celui de son espèce dans DESSINS_POKEMON : le même que pour un ennemi de cette espèce.
function dessinerJoueur(j = joueur) {
  ctx.save();
  // L'origine est placée en bas, au milieu du personnage (entre ses pattes)
  ctx.translate(Math.round(j.x + j.l / 2), Math.round(j.y + j.h));
  if (j.mort) {
    // la tête en bas, retourné autour de son milieu
    ctx.translate(0, -j.h / 2);
    ctx.rotate(Math.PI);
    ctx.translate(0, j.h / 2);
  }
  DESSINS_POKEMON[j.espece.id]({
    sens: j.dir,
    anim: j.anim / j.espece.vitesse, // j.anim compte les px parcourus : on le ramène en secondes de marche
    enMarche: j.auSol && Math.abs(j.vx) > 5,
    enLAir: !j.auSol && !j.mort,
    ecrase: false,
  });
  ctx.restore();
}

// Le Salamèche : petit lézard orange, ventre crème, flamme au bout de la queue (hitbox 22 × 30)
function dessinerSalameche(pose) {
  ctx.scale(pose.sens, 1); // regarde à gauche ou à droite
  if (pose.ecrase) ctx.scale(1.3, 0.3); // écrasé tout plat

  const enMarche = pose.enMarche;
  const enLAir = pose.enLAir;
  const pas = enMarche ? Math.sin(pose.anim * 10) : 0; // un pas toutes les 0,3 s de marche
  const rebond = Math.abs(pas) * 1.2; // le haut du corps se soulève à chaque pas

  const PEAU = "#f7883a";
  const PEAU_OMBRE = "#d9662a"; // pour la patte de derrière
  const CONTOUR = "#8a3613";
  const CREME = "#ffe39b";
  ctx.lineJoin = "round";
  ctx.lineCap = "round";

  // Queue épaisse : elle part du bas du dos, file en arrière et remonte
  const qx = -pas * 1.5; // elle balance quand il marche
  ctx.beginPath();
  ctx.moveTo(-2, -2);
  ctx.quadraticCurveTo(-18 + qx, -1, -18 + qx, -14); // bord extérieur
  ctx.lineTo(-14.5 + qx, -14);                       // bout de la queue
  ctx.quadraticCurveTo(-14 + qx, -8, -4, -9);        // bord intérieur
  ctx.closePath();
  remplirAvecContour(PEAU, CONTOUR);

  // Position des deux pattes (x du milieu de la patte, y sous le pied)
  let derriere = { x: -4 - pas * 3, y: -Math.max(0, -pas) * 1.5 };
  let devant = { x: 3 + pas * 3, y: -Math.max(0, pas) * 1.5 };
  if (enLAir) {
    derriere = { x: -6, y: -1 }; // pattes écartées pendant le saut
    devant = { x: 5, y: -3 };
  }
  dessinerPatteSalameche(derriere.x, derriere.y, PEAU_OMBRE, CONTOUR);

  // Corps tout rond, avec le ventre crème
  ctx.save();
  ctx.translate(0, -rebond);
  ctx.beginPath();
  ajouterEllipse(-0.5, -10, 7.5, 8.5);
  remplirAvecContour(PEAU, CONTOUR);
  ctx.clip(); // le ventre ne déborde pas du corps
  ctx.fillStyle = CREME;
  ellipse(3.5, -8.5, 5.5, 8, -0.25);
  ctx.restore();

  dessinerPatteSalameche(devant.x, devant.y, PEAU, CONTOUR);

  ctx.save();
  ctx.translate(0, -rebond);

  // Grosse tête ronde avec un museau un peu allongé
  ctx.beginPath();
  ajouterEllipse(3, -23, 9, 8);
  ajouterEllipse(9.5, -20, 5.2, 4.2);
  remplirAvecContour(PEAU, CONTOUR);

  // Grand œil bleu foncé avec un reflet blanc
  ctx.fillStyle = "#fff";
  ellipse(7, -24, 2.5, 3.4);
  ctx.fillStyle = "#24508f";
  ellipse(7.6, -23.8, 1.9, 3);
  ctx.fillStyle = "#101a33";
  ellipse(8, -23.6, 1.1, 2);
  ctx.fillStyle = "#fff";
  ellipse(7.2, -25.3, 0.8, 0.9);

  // Narine et grand sourire
  ctx.fillStyle = CONTOUR;
  ellipse(13.2, -21.5, 0.5, 0.5);
  ctx.strokeStyle = CONTOUR;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(14, -18.6);
  ctx.quadraticCurveTo(11, -17.4, 8.4, -18.6);
  ctx.stroke();

  // Petit bras avec ses griffes : tendu vers le haut pendant un saut
  const main = enLAir ? { x: 7.5, y: -18 } : { x: 7 + pas * 1.2, y: -12 };
  ctx.beginPath();
  ctx.moveTo(3, -14.5);
  ctx.lineTo(main.x, main.y);
  ctx.lineWidth = 3.8;
  ctx.strokeStyle = CONTOUR;
  ctx.stroke();
  ctx.lineWidth = 2;
  ctx.strokeStyle = PEAU;
  ctx.stroke();
  ctx.fillStyle = "#fff4dc";
  ellipse(main.x + 0.9, main.y, 0.6, 0.6);
  ctx.restore();

  // La flamme au bout de la queue : elle vacille sans arrêt et part en arrière quand il court
  const penche = Math.sin(temps * 7) * 0.8 - (enMarche ? 2 : 0) + (enLAir ? 1 : 0);
  dessinerFlamme(-16.2 + qx, -12.5, penche);
}

// Une patte de Salamèche : une cuisse ronde et un pied tourné vers l'avant
function dessinerPatteSalameche(x, y, couleur, contour) {
  ctx.beginPath();
  ajouterEllipse(x, y - 4, 3.2, 3.6);
  ajouterEllipse(x + 1, y - 1.6, 3.6, 1.8);
  remplirAvecContour(couleur, contour);
}

// Flamme posée en (x, y) : trois gouttes de feu l'une dans l'autre, et un halo lumineux
function dessinerFlamme(x, y, penche) {
  const vacille = Math.sin(temps * 23) * 0.8 + Math.sin(temps * 13) * 0.6;
  ctx.globalCompositeOperation = "lighter"; // le halo éclaircit ce qu'il y a derrière
  ctx.fillStyle = "rgba(255, 130, 40, 0.22)";
  ellipse(x + penche * 0.5, y - 5, 7.5, 9);
  ctx.globalCompositeOperation = "source-over";
  gouttedeFeu(x, y, 4.2, 12 + vacille, penche, "#e8431e");
  gouttedeFeu(x, y, 3, 8.5 + vacille * 0.7, penche * 0.8, "#ff9a1f");
  gouttedeFeu(x, y, 1.8, 5.5 + vacille * 0.5, penche * 0.6, "#ffe55c");
}

// Une goutte pointe en haut : rayon r en bas, hauteur h, pointe décalée de « penche »
function gouttedeFeu(x, yBas, r, h, penche, couleur) {
  const cy = yBas - r; // centre du rond du bas
  ctx.beginPath();
  ctx.moveTo(x + penche, yBas - h);
  ctx.quadraticCurveTo(x + r * 1.2, cy - r, x + r, cy);
  ctx.arc(x, cy, r, 0, Math.PI);
  ctx.quadraticCurveTo(x - r * 1.2, cy - r, x + penche, yBas - h);
  ctx.fillStyle = couleur;
  ctx.fill();
}

// Chaque Pokémon du POKEDEX (reglages.js) a sa fonction de dessin, la même pour le joueur et pour les ennemis.
// Pour ajouter un Pokémon : écris sa fonction, puis ajoute-la dans cette liste.
// Quand elle est appelée, l'origine est déjà en bas, au milieu de la hitbox (et retournée s'il est K.O.).
// Elle reçoit la « pose » du Pokémon :
//   sens     : 1 = il regarde à droite, -1 = à gauche
//   anim     : l'horloge de son animation, en secondes de marche
//   enMarche : il marche sur le sol
//   enLAir   : il saute ou il tombe
//   ecrase   : il est écrasé tout plat
const DESSINS_POKEMON = {
  aspicot: dessinerAspicot,
  simularbre: dessinerSimularbre,
  salameche: dessinerSalameche,
  fantominus: dessinerFantominus,
  arcko: dessinerArcko,
  tiplouf: dessinerTiplouf,
};

function dessinerEnnemi(e) {
  ctx.save();
  // L'origine est placée en bas, au milieu de l'ennemi
  ctx.translate(Math.round(e.x + e.l / 2), Math.round(e.y + e.h));
  if (e.ejecte) {
    // à l'envers, retourné autour de son milieu
    ctx.translate(0, -e.h / 2);
    ctx.scale(1, -1);
    ctx.translate(0, e.h / 2);
  }
  const ecrase = e.mort && !e.ejecte;
  DESSINS_POKEMON[e.espece.id]({
    sens: sensEnnemi(e),
    anim: e.anim, // un ennemi marche sans arrêt : ses secondes de marche sont ses secondes à l'écran
    enMarche: !ecrase && e.vy === 0 && Math.abs(e.vx) > 5, // deplacer() remet vy à 0 quand il touche le sol
    enLAir: e.vy !== 0,
    ecrase,
  });
  ctx.restore();
}

// L'Aspicot : chenille jaune-brun à anneaux, gros nez rose,
// un dard gris sur la tête et un autre au bout de la queue (hitbox 28 × 24)
function dessinerAspicot(pose) {
  const CORPS = "#e3a945";
  const CORPS_CLAIR = "#f6d07a";
  const CONTOUR = "#73451a";
  const DARD = "#eeeae2";
  const CONTOUR_DARD = "#77706a";
  const ROSE = "#ec6a80";
  const CONTOUR_ROSE = "#8c2b3d";
  ctx.lineJoin = "round";
  ctx.scale(pose.sens, 1); // regarde dans le sens de la marche

  if (pose.ecrase) {
    // écrasé tout plat : il ne reste qu'une galette et le nez qui dépasse
    ctx.beginPath();
    ajouterEllipse(-1, -2.6, 15, 2.6);
    remplirAvecContour(CORPS, CONTOUR);
    ctx.beginPath();
    ajouterEllipse(13.5, -2.4, 3, 2.2);
    remplirAvecContour(ROSE, CONTOUR_ROSE, 1.5);
    return;
  }

  // La vague qui le fait ramper : chaque anneau se soulève un peu après le précédent
  const t = pose.anim * 8;
  const soulevement = (i) => -(Math.sin(t - i * 1.3) + 1) * 0.7;

  // Dard de la queue
  const yq = soulevement(0);
  ctx.beginPath();
  ctx.moveTo(-14, -5 + yq);
  ctx.lineTo(-19, -14 + yq);
  ctx.lineTo(-9.5, -8.5 + yq);
  ctx.closePath();
  remplirAvecContour(DARD, CONTOUR_DARD, 1.6);

  // Les anneaux du corps, du plus petit (queue) au plus gros (contre la tête)
  const anneaux = [
    { x: -11, r: 4.4 },
    { x: -5.5, r: 5.3 },
    { x: 0.5, r: 6.1 },
  ];
  anneaux.forEach((a, i) => {
    const y = -1.5 - a.r + soulevement(i);
    // petit pied rose sous l'anneau
    ctx.beginPath();
    ajouterEllipse(a.x + 0.5, -1.2, 1.7, 1.2);
    remplirAvecContour(ROSE, CONTOUR_ROSE, 1.4);
    // l'anneau, avec un reflet clair sur le dessus
    ctx.beginPath();
    ajouterEllipse(a.x, y, a.r, a.r);
    remplirAvecContour(CORPS, CONTOUR);
    ctx.fillStyle = CORPS_CLAIR;
    ellipse(a.x - a.r * 0.2, y - a.r * 0.45, a.r * 0.55, a.r * 0.3);
  });

  const yt = soulevement(3) * 0.6;

  // Dard sur la tête, pointu et un peu courbé vers l'arrière
  ctx.beginPath();
  ctx.moveTo(3.5, -16 + yt);
  ctx.quadraticCurveTo(3, -24 + yt, 4.5, -29 + yt);
  ctx.quadraticCurveTo(8, -24 + yt, 9.5, -17 + yt);
  ctx.closePath();
  remplirAvecContour(DARD, CONTOUR_DARD, 1.6);

  // Tête ronde, relevée
  ctx.beginPath();
  ajouterEllipse(7.5, -12 + yt, 7.5, 7);
  remplirAvecContour(CORPS, CONTOUR);
  ctx.fillStyle = CORPS_CLAIR;
  ellipse(5.5, -16 + yt, 3.5, 1.8);

  // Gros nez rose tout rond
  ctx.beginPath();
  ajouterEllipse(14, -10.5 + yt, 3.8, 3.4);
  remplirAvecContour(ROSE, CONTOUR_ROSE, 1.6);
  ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
  ellipse(13.3, -12 + yt, 1.2, 0.8);

  // Petit œil noir
  ctx.fillStyle = "#1e1414";
  ellipse(10, -14.5 + yt, 1.4, 2);
  ctx.fillStyle = "#fff";
  ellipse(9.6, -15.4 + yt, 0.5, 0.6);
}

// Le Simularbre : un Pokémon qui se fait passer pour un arbre.
// Un long tronc avec le visage dessus (petits yeux, grand sourire rose), une branche en Y au sommet,
// de longs bras finis par trois boules vertes, des taches jaunes, et des jambes arquées (hitbox 44 × 60)
function dessinerSimularbre(pose) {
  const BOIS = "#a97f64";
  const BOIS_FONCE = "#7b5441";
  const CONTOUR = "#3e2618";
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  ctx.scale(pose.sens, 1); // regarde dans le sens de la marche

  // Une boule verte, avec un reflet
  const boule = (x, y, r) => {
    ctx.beginPath();
    ajouterEllipse(x, y, r, r);
    remplirAvecContour("#5aae4b", "#24561f", 1.6);
    ctx.fillStyle = "#93d67e";
    ellipse(x - r * 0.3, y - r * 0.35, r * 0.4, r * 0.28);
  };

  // Un morceau de bois allongé (bras, branche), avec son contour
  const branche = (x0, y0, x1, y1, epaisseur) => {
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.lineWidth = epaisseur + 2.2;
    ctx.strokeStyle = CONTOUR;
    ctx.stroke();
    ctx.lineWidth = epaisseur;
    ctx.strokeStyle = BOIS;
    ctx.stroke();
  };

  // Une main : trois boules vertes au bout du bras, comme trois doigts.
  // « cote » vaut -1 pour la main de gauche, 1 pour celle de droite.
  const main = (x, y, cote) => {
    const doigts = [[0.5, -4.3], [5, -1], [2.3, 3.8]];
    for (const [dx, dy] of doigts) branche(x, y, x + dx * cote, y + dy, 1.5);
    for (const [dx, dy] of doigts) boule(x + dx * cote, y + dy, 3.2);
  };

  if (pose.ecrase) {
    // écrasé : un rondin couché par terre, et quelques boules vertes tombées
    ctx.beginPath();
    ajouterEllipse(0, -4, 17, 4);
    remplirAvecContour(BOIS, CONTOUR);
    boule(-17, -3.5, 3.2);
    boule(-12, -3, 3.2);
    boule(15, -3.5, 3.2);
    boule(19, -6, 3.2);
    return;
  }

  const pas = Math.sin(pose.anim * 5); // les jambes avancent l'une après l'autre

  // Jambes arquées, bien écartées, avec un pied pointu tourné vers l'extérieur
  const jambe = (cote, levee) => {
    ctx.beginPath();
    ctx.moveTo(4.5 * cote, -15);
    ctx.quadraticCurveTo(12 * cote, -10 - levee, 9.5 * cote, -4 - levee);
    ctx.lineWidth = 6.7;
    ctx.strokeStyle = CONTOUR;
    ctx.stroke();
    ctx.lineWidth = 4.5;
    ctx.strokeStyle = BOIS;
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(7 * cote, -4 - levee);
    ctx.quadraticCurveTo(13 * cote, -4 - levee, 15.5 * cote, -0.5 - levee); // le dessus, jusqu'à la pointe
    ctx.lineTo(7 * cote, -0.5 - levee);
    ctx.quadraticCurveTo(5.5 * cote, -2 - levee, 7 * cote, -4 - levee);    // le talon arrondi
    ctx.closePath();
    remplirAvecContour(BOIS, CONTOUR, 1.8);
  };
  jambe(-1, Math.max(0, pas) * 2.5);
  jambe(1, Math.max(0, -pas) * 2.5);

  ctx.translate(0, -Math.abs(pas) * 1.2); // le corps se soulève un peu à chaque pas

  // Les bras et la branche du sommet, dessinés avant le tronc pour que leur base soit cachée
  const mainGauche = { x: -20, y: -42 + pas * 1.5 };
  const mainDroite = { x: 20, y: -40 - pas * 1.5 };
  branche(-5, -35, mainGauche.x, mainGauche.y, 2.5);
  branche(5, -34, mainDroite.x, mainDroite.y, 2.5);
  branche(1, -50, 1.5, -57, 3);     // le pied de la fourche
  branche(1.5, -57, -2.5, -60, 2.5); // la petite branche de gauche
  branche(1.5, -57, 5, -62, 2.5);    // la grande branche de droite

  // Le tronc : long, un peu courbé, arrondi en haut, et creusé en arche entre les jambes
  ctx.beginPath();
  ctx.moveTo(-7.5, -12.5);
  ctx.bezierCurveTo(-8.5, -25, -9, -38, -7, -49); // côté gauche
  ctx.bezierCurveTo(-6, -55.5, 8, -55.5, 9, -49); // sommet arrondi
  ctx.bezierCurveTo(10, -38, 9, -25, 7.5, -12.5); // côté droit
  ctx.quadraticCurveTo(0, -18, -7.5, -12.5);      // l'arche entre les jambes
  ctx.closePath();
  remplirAvecContour(BOIS, CONTOUR);

  // Le bas du tronc est plus foncé, comme un short
  ctx.save();
  ctx.clip();
  ctx.fillStyle = BOIS_FONCE;
  ctx.beginPath();
  ctx.moveTo(-12, -20);
  ctx.quadraticCurveTo(0, -23, 12, -20);
  ctx.lineTo(12, -10);
  ctx.lineTo(-12, -10);
  ctx.fill();
  ctx.restore();

  // Taches jaunes, ovales et verticales
  for (const [x, y, rx, ry] of [[3.5, -37, 1.2, 2.5], [-3, -31, 1.3, 2.4], [2.5, -28, 1, 1.9],
                                [-0.5, -23.5, 1.3, 2.5], [-4.5, -16.5, 1.1, 2.2], [4, -16, 1, 2]]) {
    ctx.beginPath();
    ajouterEllipse(x, y, rx, ry);
    remplirAvecContour("#ecc63d", "#5b3d18", 1);
  }

  // Le visage : deux petits yeux en points et un grand sourire rose
  ctx.fillStyle = "#17100b";
  ellipse(-2, -47.5, 1, 1.1);
  ellipse(4, -47.5, 1, 1.1);
  ctx.beginPath();
  ctx.moveTo(-3.5, -44.8);
  ctx.quadraticCurveTo(1, -40.5, 5.5, -44.8);
  ctx.quadraticCurveTo(1, -42.8, -3.5, -44.8);
  ctx.closePath();
  remplirAvecContour("#e0727d", CONTOUR, 1.2);

  // Les deux mains de boules vertes
  main(mainGauche.x, mainGauche.y, -1);
  main(mainDroite.x, mainDroite.y, 1);
}

// Le Fantominus : une boule de gaz sombre dans un halo violet qui ondule,
// de grands yeux blancs à l'air malin et un large sourire avec deux crocs (hitbox 28 × 28).
// Il flotte (il est de type vol, voir estVolant dans types.js) et se balance doucement de haut en bas.
function dessinerFantominus(pose) {
  const CORPS = "#2e2140";
  const CONTOUR = "#120a1c";
  ctx.lineJoin = "round";
  ctx.scale(pose.sens, 1); // regarde dans le sens où il avance
  if (pose.ecrase) ctx.scale(1.3, 0.3); // écrasé tout plat
  else ctx.translate(0, Math.sin(pose.anim * 3) * 2); // le balancement ne bouge que le dessin, pas la hitbox

  const cy = -14; // le milieu de la boule

  // Le halo de gaz : des bouffées qui tournent lentement et gonflent chacune à son tour.
  // Elles sont dans un seul chemin, remplies d'un coup : pas de zones plus foncées là où elles se chevauchent.
  ctx.beginPath();
  for (let i = 0; i < 9; i++) {
    const angle = (i / 9) * Math.PI * 2 + pose.anim * 0.8;
    const r = 5 + Math.sin(pose.anim * 4 + i * 1.7) * 1.3;
    ajouterEllipse(Math.cos(angle) * 11, cy + Math.sin(angle) * 11, r, r);
  }
  ctx.fillStyle = "rgba(167, 105, 214, 0.45)";
  ctx.fill();

  // La boule, avec un petit reflet
  ctx.beginPath();
  ajouterEllipse(0, cy, 11, 11);
  remplirAvecContour(CORPS, CONTOUR);
  ctx.fillStyle = "rgba(255, 255, 255, 0.15)";
  ellipse(-4.5, cy - 6, 3.5, 2, -0.5);

  // Un œil : blanc, le coin intérieur plus bas que l'extérieur (l'air malin), petite pupille noire.
  // « exterieur » vaut -1 pour l'œil de gauche, 1 pour celui de droite.
  const oeil = (x, exterieur) => {
    ctx.beginPath();
    ctx.moveTo(x + 3.5 * exterieur, cy - 7.5);                                // coin extérieur
    ctx.lineTo(x - 3 * exterieur, cy - 4);                                    // coin intérieur
    ctx.quadraticCurveTo(x - 3.5 * exterieur, cy + 0.5, x, cy + 0.5);         // le bas de l'œil
    ctx.quadraticCurveTo(x + 4 * exterieur, cy + 0.5, x + 3.5 * exterieur, cy - 7.5);
    ctx.closePath();
    remplirAvecContour("#fff", CONTOUR, 1.2);
    ctx.fillStyle = "#111";
    ellipse(x + 0.8, cy - 2.3, 1.1, 1.4); // il regarde devant lui
  };
  oeil(-3.8, -1);
  oeil(4.2, 1);

  // Le grand sourire, avec deux crocs blancs qui pendent de la lèvre du haut
  ctx.beginPath();
  ctx.moveTo(-6.5, cy + 3.5);
  ctx.quadraticCurveTo(1, cy + 6, 8, cy + 2.5);    // lèvre du haut
  ctx.quadraticCurveTo(2, cy + 11, -6.5, cy + 3.5); // lèvre du bas
  ctx.closePath();
  remplirAvecContour("#b33a5f", CONTOUR, 1.2);
  ctx.fillStyle = "#fff";
  triangle(-3, cy + 4.4, -0.8, cy + 4.6, -1.9, cy + 6.8);
  triangle(2.8, cy + 4.3, 5, cy + 4, 4, cy + 6.3);
}

// L'Arcko : petit gecko vert clair qui se tient debout, la gorge et le ventre rouges,
// une grande tête large avec de gros yeux jaunes aux pupilles fendues et deux petites pointes sur le crâne,
// trois doigts ronds à chaque patte, et une grande queue vert foncé à deux lobes, comme une feuille (hitbox 22 × 28)
function dessinerArcko(pose) {
  ctx.scale(pose.sens, 1); // regarde à gauche ou à droite
  if (pose.ecrase) ctx.scale(1.3, 0.3); // écrasé tout plat

  const enMarche = pose.enMarche;
  const enLAir = pose.enLAir;
  const pas = enMarche ? Math.sin(pose.anim * 12) : 0; // il trottine un peu plus vite que le Salamèche
  const rebond = Math.abs(pas) * 1.2; // le haut du corps se soulève à chaque pas

  const PEAU = "#8fd16a";
  const PEAU_OMBRE = "#72b552"; // pour la patte et le bras de derrière
  const QUEUE = "#3f8f43";
  const QUEUE_CLAIR = "#5dab56";
  const CONTOUR = "#1f4a26";
  const ROUGE = "#e2524b";
  ctx.lineJoin = "round";
  ctx.lineCap = "round";

  // La grande queue : elle part du bas du dos et se dresse derrière lui en deux lobes.
  // Elle se balance à chaque pas, et part en arrière pendant un saut.
  ctx.save();
  ctx.translate(-3, -5);
  ctx.rotate(pas * 0.08 - (enLAir ? 0.25 : 0));
  ctx.beginPath();
  ctx.moveTo(1, 1);
  ctx.quadraticCurveTo(-6, 2, -10, -0.5);      // le dessous
  ctx.quadraticCurveTo(-14.5, -2, -12.5, -6);  // le bout arrondi du petit lobe
  ctx.quadraticCurveTo(-11, -7.5, -9, -8);     // le creux entre les deux lobes
  ctx.quadraticCurveTo(-13.5, -12, -11, -18);  // le dos du grand lobe
  ctx.quadraticCurveTo(-8, -21.5, -5, -17);    // son bout arrondi, en haut
  ctx.quadraticCurveTo(-2, -11, 2, -6);        // le bord de devant, qui revient contre le dos
  ctx.closePath();
  remplirAvecContour(QUEUE, CONTOUR);
  // une nervure plus claire dans chaque lobe
  ctx.strokeStyle = QUEUE_CLAIR;
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(-1, -3);
  ctx.quadraticCurveTo(-6, -9, -8, -16);
  ctx.moveTo(-2, -1);
  ctx.quadraticCurveTo(-7, -1.5, -11, -3.5);
  ctx.stroke();
  ctx.restore();

  // Position des deux pattes (x du milieu de la patte, y sous le pied)
  let derriere = { x: -3.5 - pas * 3, y: -Math.max(0, -pas) * 1.5 };
  let devant = { x: 2.5 + pas * 3, y: -Math.max(0, pas) * 1.5 };
  if (enLAir) {
    derriere = { x: -5.5, y: -1 }; // pattes écartées pendant le saut
    devant = { x: 4.5, y: -3 };
  }
  dessinerPatteArcko(derriere.x, derriere.y, PEAU_OMBRE, CONTOUR);

  ctx.save();
  ctx.translate(0, -rebond);

  // Le bras de derrière, à peine visible
  dessinerBrasArcko(-1, -12.5, enLAir ? { x: -4, y: -17 } : { x: -3.5 - pas * 1.2, y: -8.5 }, PEAU_OMBRE, CONTOUR);

  // Le corps, avec le ventre rouge barré d'une ligne noire
  ctx.beginPath();
  ajouterEllipse(-0.5, -9.5, 6.5, 7.5);
  remplirAvecContour(PEAU, CONTOUR);
  ctx.save();
  ctx.clip(); // le ventre ne déborde pas du corps
  ctx.fillStyle = ROUGE;
  ellipse(4, -9, 4.5, 7.5, -0.15);
  ctx.strokeStyle = "#2a1a1a";
  ctx.lineWidth = 0.9;
  ctx.beginPath();
  ctx.moveTo(1, -6.5);
  ctx.lineTo(8, -7.5);
  ctx.stroke();
  ctx.restore();
  ctx.restore();

  dessinerPatteArcko(devant.x, devant.y, PEAU, CONTOUR);

  ctx.save();
  ctx.translate(0, -rebond);

  // Deux petites pointes sur l'arrière du crâne (dessinées avant la tête, qui cache leur base)
  ctx.beginPath();
  ctx.moveTo(-5, -23);
  ctx.lineTo(-9, -25);
  ctx.lineTo(-3, -25.5);
  ctx.moveTo(-2, -25.8);
  ctx.lineTo(-5.5, -28);
  ctx.lineTo(1.5, -26.8);
  remplirAvecContour(PEAU, CONTOUR);

  // Grande tête large, au museau rond
  ctx.beginPath();
  ajouterEllipse(2, -20, 8.5, 6.8);
  ajouterEllipse(7.5, -18.5, 5, 4.6);
  remplirAvecContour(PEAU, CONTOUR);

  // La gorge rouge, sous la bouche
  ctx.save();
  ctx.clip();
  ctx.fillStyle = ROUGE;
  ellipse(6.5, -13, 7, 3.4);
  ctx.restore();

  // La bouche : un long trait qui va du bout du museau jusque sous l'œil
  ctx.strokeStyle = CONTOUR;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(12.2, -16.2);
  ctx.quadraticCurveTo(9, -15.2, 4.5, -16.2);
  ctx.stroke();

  // Narine
  ctx.fillStyle = CONTOUR;
  ellipse(11.4, -19.4, 0.5, 0.5);

  // Gros œil jaune, avec une pupille noire fendue et un reflet blanc
  ctx.beginPath();
  ajouterEllipse(5, -21.5, 2.9, 3.4);
  remplirAvecContour("#f6d63c", CONTOUR, 1.2);
  ctx.fillStyle = "#151515";
  ellipse(5.7, -21.4, 0.85, 2.5);
  ctx.fillStyle = "#fff";
  ellipse(4.3, -23, 0.7, 0.8);

  // Le bras de devant, avec ses trois doigts : tendu en avant pendant un saut
  dessinerBrasArcko(2, -12.5, enLAir ? { x: 8.5, y: -13 } : { x: 6.5 + pas * 1.2, y: -8.5 }, PEAU, CONTOUR);
  ctx.restore();
}

// Une patte d'Arcko : une cuisse ronde et un pied qui finit par des doigts ronds
function dessinerPatteArcko(x, y, couleur, contour) {
  ctx.beginPath();
  ajouterEllipse(x, y - 4, 3, 3.4);
  ajouterEllipse(x + 1, y - 1.5, 3.4, 1.5);
  ajouterEllipse(x + 4.2, y - 1.2, 1.2, 1.2);
  ajouterEllipse(x + 3.4, y - 0.4, 1.1, 1.1);
  remplirAvecContour(couleur, contour, 1.6);
}

// Le Tiplouf : petit pingouin au corps bleu clair, avec deux taches blanches sur la poitrine.
// Sa grosse tête bleu foncé a le visage blanc, un motif bleu pâle en couronne au-dessus du petit bec jaune ;
// les plumes de la tête descendent le long du dos jusqu'à la queue, comme une cape.
// Des nageoires à la place des bras et des pieds jaunes à trois orteils (hitbox 22 × 26).
// Il marche en se dandinant, et bat des nageoires quand il saute.
function dessinerTiplouf(pose) {
  ctx.scale(pose.sens, 1); // regarde à gauche ou à droite
  if (pose.ecrase) ctx.scale(1.3, 0.3); // écrasé tout plat

  const enMarche = pose.enMarche;
  const enLAir = pose.enLAir;
  const pas = enMarche ? Math.sin(pose.anim * 9) : 0; // un pas toutes les 0,35 s de marche

  const BLEU_FONCE = "#2f56a8";
  const BLEU_CLAIR = "#7cc6ee";
  const BLEU_PALE = "#86c9ef";
  const CONTOUR = "#16285a";
  const JAUNE = "#f7c843";
  const JAUNE_OMBRE = "#d9a92c"; // pour le pied de derrière
  const CONTOUR_JAUNE = "#8f6212";
  ctx.lineJoin = "round";
  ctx.lineCap = "round";

  // Les pieds : il les lève l'un après l'autre, et les laisse pendre pendant un saut
  let derriere = { x: -3.5, y: -Math.max(0, -pas) * 1.8 };
  let devant = { x: 2.5, y: -Math.max(0, pas) * 1.8 };
  if (enLAir) {
    derriere = { x: -4.5, y: -1 };
    devant = { x: 3, y: -2.5 };
  }
  dessinerPiedTiplouf(derriere.x, derriere.y, JAUNE_OMBRE, CONTOUR_JAUNE);

  // Tout le reste se dandine : il penche d'un côté puis de l'autre, en pivotant sur ses pieds
  ctx.save();
  ctx.rotate(pas * 0.08);

  // La petite queue pointue, au bout de la cape
  ctx.beginPath();
  ctx.moveTo(-5, -7);
  ctx.lineTo(-11, -2.5);
  ctx.lineTo(-4, -2.5);
  ctx.closePath();
  remplirAvecContour(BLEU_FONCE, CONTOUR);

  // Le corps rond, avec la cape bleu foncé qui couvre le dos
  ctx.beginPath();
  ajouterEllipse(0, -8.5, 7.5, 8);
  remplirAvecContour(BLEU_CLAIR, CONTOUR);
  ctx.save();
  ctx.clip(); // la cape ne déborde pas du corps
  ctx.fillStyle = BLEU_FONCE;
  ellipse(-10, -10, 4, 11);
  ctx.restore();

  // Les deux taches blanches de la poitrine
  ctx.fillStyle = "#fff";
  ellipse(3.6, -8.5, 1.3, 1.9, -0.2);
  ellipse(5.9, -8, 1.1, 1.8, -0.2);
  ctx.restore();

  dessinerPiedTiplouf(devant.x, devant.y, JAUNE, CONTOUR_JAUNE);

  ctx.save();
  ctx.rotate(pas * 0.08);

  // La grosse tête ronde bleu foncé
  ctx.beginPath();
  ajouterEllipse(1.5, -18.5, 8, 7.5);
  remplirAvecContour(BLEU_FONCE, CONTOUR);

  // Le visage blanc, et le motif bleu pâle en couronne au-dessus du bec
  ctx.save();
  ctx.clip();
  ctx.fillStyle = "#fff";
  ellipse(6, -18.5, 5, 5.3);
  ctx.beginPath();
  ctx.moveTo(6.8, -17.4);
  ctx.lineTo(6.3, -21.5); // la pointe de gauche
  ctx.lineTo(7.6, -20.2);
  ctx.lineTo(8.3, -22.8); // celle du milieu, la plus haute
  ctx.lineTo(9, -20.2);
  ctx.lineTo(9.6, -21);   // celle de droite
  ctx.lineTo(9.8, -17.4);
  ctx.closePath();
  ctx.fillStyle = BLEU_PALE;
  ctx.fill();
  ctx.restore();

  // Grand œil noir avec un reflet blanc
  ctx.fillStyle = "#111a2e";
  ellipse(4.2, -19.6, 1.7, 2.3);
  ctx.fillStyle = "#fff";
  ellipse(3.7, -20.6, 0.6, 0.7);

  // Le petit bec jaune
  ctx.beginPath();
  ajouterEllipse(9.8, -16.8, 2.5, 1.6);
  remplirAvecContour(JAUNE, CONTOUR_JAUNE, 1.4);

  // La nageoire : elle pend le long du corps, se balance quand il marche,
  // et se lève en arrière pour battre vite pendant un saut
  const angle = enLAir ? 1.5 + Math.sin(temps * 25) * 0.4 : 0.5 + pas * 0.25;
  ctx.save();
  ctx.translate(1, -12.5);
  ctx.rotate(angle);
  ctx.beginPath();
  ajouterEllipse(0, 4.5, 2, 5);
  remplirAvecContour(BLEU_CLAIR, CONTOUR, 1.6);
  ctx.restore();
  ctx.restore();
}

// Un pied de Tiplouf : jaune et plat, avec trois orteils ronds devant
function dessinerPiedTiplouf(x, y, couleur, contour) {
  ctx.beginPath();
  ajouterEllipse(x + 1, y - 1.3, 3.6, 1.4);
  ajouterEllipse(x + 4.2, y - 1.4, 1.1, 1.1);
  ajouterEllipse(x + 4.5, y - 0.6, 1.1, 1);
  ajouterEllipse(x + 3.4, y - 0.4, 1, 1);
  remplirAvecContour(couleur, contour, 1.4);
}

// Un bras d'Arcko, de l'épaule à la main, avec trois petits doigts ronds au bout
function dessinerBrasArcko(x, y, main, couleur, contour) {
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(main.x, main.y);
  ctx.lineWidth = 3.6;
  ctx.strokeStyle = contour;
  ctx.stroke();
  ctx.lineWidth = 2;
  ctx.strokeStyle = couleur;
  ctx.stroke();
  ctx.beginPath();
  ajouterEllipse(main.x + 0.9, main.y - 0.9, 0.9, 0.9);
  ajouterEllipse(main.x + 1.3, main.y + 0.3, 0.9, 0.9);
  ajouterEllipse(main.x + 0.4, main.y + 1.2, 0.9, 0.9);
  remplirAvecContour(couleur, contour, 1);
}

function dessinerEffets() {
  ctx.font = "bold 16px system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  for (const f of effets) {
    if (f.type === "piece") {
      dessinerPiece(f.x, f.y, temps * 20);
    } else if (f.type === "texte") {
      ctx.globalAlpha = Math.min(1, f.t * 2); // s'efface sur la fin
      texteContour(f.texte, f.x, f.y, f.couleur, 3);
      ctx.globalAlpha = 1;
    } else if (f.type === "gain") {
      ctx.globalAlpha = Math.min(1, f.t * 2);
      ctx.textAlign = "right";
      texteContour(`${f.gain}×`, f.x - 2, f.y, "#fff", 3);
      ctx.textAlign = "center";
      dessinerPiece(f.x + 8, f.y, 0);
      ctx.globalAlpha = 1;
    }
  }
}

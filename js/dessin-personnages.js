// =====================================================
//  Dessin des pièces, du drapeau, du renard et des ennemis
// =====================================================

function dessinerPiece(cx, cy, phase) {
  const largeur = Math.max(1.5, Math.abs(Math.cos(phase)) * 8); // la pièce tourne
  ctx.fillStyle = "#c98a0c";
  ellipse(cx, cy, largeur, 10);
  ctx.fillStyle = "#ffd23f";
  ellipse(cx, cy, largeur * 0.65, 7);
}

function dessinerDrapeau() {
  const d = drapeau;
  ctx.fillStyle = "#e3e7ec";
  ctx.fillRect(d.x, d.haut, d.l, d.bas - d.haut);
  ctx.fillStyle = "#9aa1ab";
  ctx.fillRect(d.x + 4, d.haut, 2, d.bas - d.haut);
  ctx.fillStyle = "#ffcf3a";
  ellipse(d.x + 3, d.haut - 4, 7, 7);
  ctx.fillStyle = "#e8742a";
  triangle(d.x, d.drapY, d.x - 44, d.drapY + 15, d.x, d.drapY + 30);
  ctx.fillStyle = "#fff6e8";
  ellipse(d.x - 12, d.drapY + 15, 4, 4);
}

// Sans rien entre les parenthèses, c'est le renard du niveau ; la carte du monde passe le sien.
function dessinerJoueur(j = joueur) {
  ctx.save();
  // L'origine est placée entre les pattes du renard
  ctx.translate(Math.round(j.x + j.l / 2), Math.round(j.y + j.h));
  if (j.mort) {
    ctx.translate(0, -15);
    ctx.rotate(Math.PI);
    ctx.translate(0, 15);
  }
  ctx.scale(j.dir, 1); // regarde à gauche ou à droite

  const enMarche = j.auSol && Math.abs(j.vx) > 5;
  const pas = enMarche ? Math.sin(j.anim / 7) : 0;

  // queue
  ctx.fillStyle = "#e8742a";
  ellipse(-14, -13 - pas, 9, 5.5, -0.5);
  ctx.fillStyle = "#fff6e8";
  ellipse(-21, -17 - pas, 4, 3.5, -0.5);

  // pattes
  ctx.fillStyle = "#5a3418";
  if (!j.auSol && !j.mort) {
    ctx.fillRect(-8, -7, 5, 5);
    ctx.fillRect(3, -5, 5, 5);
  } else {
    ctx.fillRect(-7 + pas * 3, -6, 5, 6);
    ctx.fillRect(2 - pas * 3, -6, 5, 6);
  }

  // corps et ventre
  ctx.fillStyle = "#e8742a";
  ctx.beginPath();
  ctx.roundRect(-10, -19, 20, 15, 6);
  ctx.fill();
  ctx.fillStyle = "#fff6e8";
  ellipse(4, -11, 4.5, 5);

  // tête et oreilles
  ctx.fillStyle = "#e8742a";
  ellipse(3, -22, 8.5, 8);
  triangle(-4, -27, -1, -37, 3, -29);
  triangle(4, -29, 9, -37, 11, -26);

  // museau, truffe, œil
  ctx.fillStyle = "#fff6e8";
  ellipse(10, -20, 5, 3.5);
  ctx.fillStyle = "#222";
  ellipse(14.5, -21, 1.8, 1.6);
  ellipse(6, -24, 1.6, 2);

  ctx.restore();
}

// Chaque type d'ennemi (TYPES_ENNEMIS, dans reglages.js) a sa fonction de dessin.
// Pour ajouter un type : écris sa fonction plus bas, puis ajoute-la dans cette liste.
const DESSINS_ENNEMIS = {
  gloup: dessinerGloup,
  souche: dessinerSouche,
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
  DESSINS_ENNEMIS[e.type.id](e);
  ctx.restore();
}

// Le gloup : une petite boule violette (hitbox 28 × 24)
function dessinerGloup(e) {
  if (e.mort && !e.ejecte) {
    // écrasé tout plat
    ctx.fillStyle = "#8e5bd8";
    ellipse(0, -4, 17, 4);
    return;
  }

  const s = Math.sin(e.anim * 8) * 0.08; // il se dandine
  ctx.scale(1 + s, 1 - s);

  ctx.fillStyle = "#8e5bd8";
  ctx.beginPath();
  ctx.moveTo(-15, 0);
  ctx.quadraticCurveTo(-16, -26, 0, -26);
  ctx.quadraticCurveTo(16, -26, 15, 0);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "rgba(255, 255, 255, 0.35)";
  ellipse(-6, -18, 4, 3);

  const regard = Math.sign(e.vx) * 2;
  ctx.fillStyle = "#fff";
  ellipse(-5, -12, 4, 4.5);
  ellipse(5, -12, 4, 4.5);
  ctx.fillStyle = "#1d1430";
  ellipse(-5 + regard, -11, 2, 2.5);
  ellipse(5 + regard, -11, 2, 2.5);
}

// La souche : un gros tronc coupé qui marche sur ses racines (hitbox 44 × 60)
function dessinerSouche(e) {
  if (e.mort && !e.ejecte) {
    // écrasée : il ne reste qu'un tas d'écorce
    ctx.fillStyle = "#5b3b22";
    ellipse(0, -5, 24, 5);
    return;
  }

  const pas = Math.sin(e.anim * 5);    // les racines avancent l'une après l'autre
  const regard = sensEnnemi(e) * 1.5;  // les yeux regardent où elle marche

  // racines (les pieds)
  ctx.fillStyle = "#4a2f1b";
  ctx.beginPath();
  ctx.roundRect(-18 + pas * 4, -9, 13, 9, 3);
  ctx.roundRect(5 - pas * 4, -9, 13, 9, 3);
  ctx.fill();

  ctx.translate(0, -Math.abs(pas) * 1.5); // le tronc se soulève un peu à chaque pas

  // bras en branches
  ctx.strokeStyle = "#563620";
  ctx.lineWidth = 3;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(-16, -28);
  ctx.lineTo(-25, -36 + pas * 3);
  ctx.moveTo(-21, -32 + pas * 1.5);
  ctx.lineTo(-24, -27 + pas * 1.5);
  ctx.moveTo(16, -28);
  ctx.lineTo(25, -36 - pas * 3);
  ctx.moveTo(21, -32 - pas * 1.5);
  ctx.lineTo(24, -27 - pas * 1.5);
  ctx.stroke();

  // tronc, un peu plus large en bas
  ctx.fillStyle = "#6e4a2e";
  ctx.beginPath();
  ctx.moveTo(-20, -6);
  ctx.lineTo(-16, -50);
  ctx.lineTo(16, -50);
  ctx.lineTo(20, -6);
  ctx.quadraticCurveTo(0, -2, -20, -6);
  ctx.fill();
  ctx.fillStyle = "rgba(0, 0, 0, 0.18)"; // ombre sur le côté droit
  ctx.beginPath();
  ctx.moveTo(9, -50);
  ctx.lineTo(16, -50);
  ctx.lineTo(20, -6);
  ctx.lineTo(12, -5);
  ctx.fill();

  // rainures de l'écorce
  ctx.fillStyle = "#563620";
  ctx.fillRect(-13, -46, 2, 14);
  ctx.fillRect(10, -47, 2, 11);
  ctx.fillRect(-11, -16, 2, 9);
  ctx.fillRect(12, -19, 2, 11);

  // dessus coupé, avec les cernes du bois
  ctx.fillStyle = "#d9b779";
  ellipse(0, -50, 16, 5);
  ctx.fillStyle = "#b8915a";
  ellipse(0, -50, 10, 3);
  ctx.fillStyle = "#d9b779";
  ellipse(0, -50, 5, 1.5);

  // mousse et petite pousse
  ctx.fillStyle = "#3f9e34";
  ellipse(-9, -51, 7, 3);
  ctx.fillStyle = "#62c94a";
  ellipse(-10, -52, 4, 1.6);
  ctx.strokeStyle = "#3f9e34";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(7, -51);
  ctx.lineTo(8, -59);
  ctx.stroke();
  ctx.fillStyle = "#62c94a";
  ellipse(11, -59, 4, 2, -0.5);

  // yeux qui brillent au fond de deux trous
  ctx.fillStyle = "#2b1a0f";
  ellipse(-7, -34, 5.5, 5);
  ellipse(7, -34, 5.5, 5);
  ctx.fillStyle = "#ffd23f";
  ellipse(-7 + regard, -34, 3, 3);
  ellipse(7 + regard, -34, 3, 3);
  ctx.fillStyle = "#1d1430";
  ellipse(-7 + regard * 1.5, -34, 1.2, 2);
  ellipse(7 + regard * 1.5, -34, 1.2, 2);

  // sourcils froncés
  ctx.strokeStyle = "#3d2614";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-13, -42);
  ctx.lineTo(-3, -39);
  ctx.moveTo(13, -42);
  ctx.lineTo(3, -39);
  ctx.stroke();

  // bouche avec deux dents
  ctx.fillStyle = "#2b1a0f";
  ctx.beginPath();
  ctx.roundRect(-7 + regard, -24, 14, 5, 2);
  ctx.fill();
  ctx.fillStyle = "#f3ead2";
  ctx.fillRect(-4 + regard, -24, 3, 2);
  ctx.fillRect(2 + regard, -24, 3, 2);
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
    }
  }
}

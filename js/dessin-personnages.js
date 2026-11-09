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

function dessinerJoueur() {
  const j = joueur;
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

function dessinerEnnemi(e) {
  ctx.save();
  ctx.translate(Math.round(e.x + e.l / 2), Math.round(e.y + e.h));

  if (e.mort && !e.ejecte) {
    // écrasé tout plat
    ctx.fillStyle = "#8e5bd8";
    ellipse(0, -4, 17, 4);
    ctx.restore();
    return;
  }
  if (e.ejecte) {
    ctx.translate(0, -12);
    ctx.scale(1, -1); // à l'envers
    ctx.translate(0, 12);
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

  ctx.restore();
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

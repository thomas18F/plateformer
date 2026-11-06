// =====================================================
//  Dessin du fond et des tuiles du niveau
// =====================================================

// Nombre pseudo-aléatoire mais toujours le même pour un n donné (pour le décor)
function hasard(n) {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
}

// ---------- Fond ----------
function dessinerFond() {
  const ciel = ctx.createLinearGradient(0, 0, 0, H);
  ciel.addColorStop(0, "#4fa8ee");
  ciel.addColorStop(1, "#bfe6ff");
  ctx.fillStyle = ciel;
  ctx.fillRect(0, 0, W, H);

  // Plus c'est loin, plus ça défile lentement (effet de parallaxe)
  dessinerNuages(camera.x * 0.3);
  dessinerCollines(camera.x * 0.15, 400, 170, "#9fcfb0", 380);
  dessinerCollines(camera.x * 0.35, 450, 110, "#74b98a", 240);
}

function dessinerNuages(decalage) {
  ctx.fillStyle = "#ffffff";
  const espace = 320;
  const debut = Math.floor(decalage / espace) - 1;
  for (let i = debut; i <= debut + Math.ceil(W / espace) + 1; i++) {
    const x = i * espace - decalage + hasard(i) * 100;
    const y = 60 + hasard(i + 50) * 110;
    const s = 0.7 + hasard(i + 99) * 0.6;
    ellipse(x, y, 30 * s, 18 * s);
    ellipse(x + 28 * s, y - 10 * s, 26 * s, 22 * s);
    ellipse(x + 55 * s, y, 28 * s, 16 * s);
  }
}

function dessinerCollines(decalage, base, hauteur, couleur, espace) {
  ctx.fillStyle = couleur;
  const debut = Math.floor(decalage / espace) - 1;
  for (let i = debut; i <= debut + Math.ceil(W / espace) + 2; i++) {
    const cx = i * espace - decalage;
    const h = hauteur * (0.6 + 0.4 * hasard(i));
    ctx.beginPath();
    ctx.ellipse(cx, base, espace * 0.7, h, 0, Math.PI, 0);
    ctx.fill();
  }
  ctx.fillRect(0, base, W, H - base);
}

// ---------- Décor ----------
function dessinerDecor() {
  const c1 = Math.floor(camera.x / TILE);
  const c2 = c1 + Math.ceil(W / TILE) + 1;
  for (let r = 0; r < grille.length; r++) {
    for (let c = c1; c <= c2; c++) {
      const t = grille[r][c];
      if (!t || t === " ") continue;
      const rebond = rebonds[c + "," + r];
      const dy = rebond !== undefined ? -Math.sin((rebond / 0.2) * Math.PI) * 8 : 0;
      dessinerTuile(t, c * TILE, r * TILE + dy, c, r);
    }
  }
}

function dessinerTuile(t, x, y, c, r) {
  switch (t) {
    case "#": {
      ctx.fillStyle = "#a0602f";
      ctx.fillRect(x, y, TILE, TILE);
      ctx.fillStyle = "#86491f";
      const h = hasard(c * 7 + r * 13);
      ctx.fillRect(x + 4 + h * 8, y + 14, 4, 4);
      ctx.fillRect(x + 18, y + 22 - h * 6, 5, 4);
      if (!estSolide(tuileA(c, r - 1))) {
        // herbe sur le dessus
        ctx.fillStyle = "#3f9e34";
        ctx.fillRect(x, y, TILE, 10);
        ctx.fillRect(x + 5, y + 10, 4, 3);
        ctx.fillRect(x + 20, y + 10, 5, 4);
        ctx.fillStyle = "#62c94a";
        ctx.fillRect(x, y, TILE, 5);
      }
      break;
    }
    case "X":
      ctx.fillStyle = "#8b919c";
      ctx.fillRect(x, y, TILE, TILE);
      ctx.fillStyle = "#b3b9c3";
      ctx.fillRect(x, y, TILE, 4);
      ctx.fillRect(x, y, 4, TILE);
      ctx.fillStyle = "#5e636c";
      ctx.fillRect(x, y + TILE - 4, TILE, 4);
      ctx.fillRect(x + TILE - 4, y, 4, TILE);
      break;
    case "B":
      ctx.fillStyle = "#c8642c";
      ctx.fillRect(x, y, TILE, TILE);
      ctx.fillStyle = "#7c3512";
      ctx.fillRect(x, y, TILE, 2);
      ctx.fillRect(x, y + 10, TILE, 2);
      ctx.fillRect(x, y + 21, TILE, 2);
      ctx.fillRect(x, y + TILE - 2, TILE, 2);
      ctx.fillRect(x + 15, y + 2, 2, 8);
      ctx.fillRect(x + 6, y + 12, 2, 9);
      ctx.fillRect(x + 24, y + 12, 2, 9);
      ctx.fillRect(x + 15, y + 23, 2, 7);
      break;
    case "?": {
      ctx.fillStyle = "#b5781a";
      ctx.fillRect(x, y, TILE, TILE);
      ctx.fillStyle = "#f2b630";
      ctx.fillRect(x + 2, y + 2, TILE - 4, TILE - 4);
      ctx.fillStyle = "#b5781a";
      for (const [a, b] of [[5, 5], [25, 5], [5, 25], [25, 25]]) ctx.fillRect(x + a, y + b, 2, 2);
      const brillance = 0.7 + 0.3 * Math.sin(temps * 5);
      ctx.fillStyle = `rgba(255, 255, 255, ${brillance})`;
      triangle(x + 16, y + 7, x + 24, y + 16, x + 8, y + 16);
      triangle(x + 8, y + 16, x + 24, y + 16, x + 16, y + 25);
      break;
    }
    case "U":
      ctx.fillStyle = "#6b4520";
      ctx.fillRect(x, y, TILE, TILE);
      ctx.fillStyle = "#8a5a2b";
      ctx.fillRect(x + 2, y + 2, TILE - 4, TILE - 4);
      ctx.fillStyle = "#6b4520";
      for (const [a, b] of [[5, 5], [25, 5], [5, 25], [25, 25]]) ctx.fillRect(x + a, y + b, 2, 2);
      break;
    case "^":
      ctx.fillStyle = "#d5d9e0";
      ctx.strokeStyle = "#6b707a";
      ctx.lineWidth = 2;
      for (let i = 0; i < 2; i++) {
        ctx.beginPath();
        ctx.moveTo(x + i * 16 + 1, y + TILE);
        ctx.lineTo(x + i * 16 + 8, y + 10);
        ctx.lineTo(x + i * 16 + 15, y + TILE);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }
      break;
  }
}

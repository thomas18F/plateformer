// =====================================================
//  Dessin du fond et des tuiles du niveau
// =====================================================

// Nombre pseudo-aléatoire mais toujours le même pour un n donné (pour le décor)
function hasard(n) {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
}

// ---------- Fond ----------
// Chaque niveau choisit son fond avec « fond » dans niveau.js : "plaine" (par défaut), "foret" ou "grotte".
function dessinerFond() {
  const fond = NIVEAUX[numeroNiveau].fond || "plaine";
  if (fond === "grotte") {
    dessinerFondGrotte();
    return;
  }

  const ciel = ctx.createLinearGradient(0, 0, 0, H);
  ciel.addColorStop(0, "#4fa8ee");
  ciel.addColorStop(1, "#bfe6ff");
  ctx.fillStyle = ciel;
  ctx.fillRect(0, 0, W, H);

  // Plus c'est loin, plus ça défile lentement (effet de parallaxe).
  // On dessine du plus loin au plus proche : chaque couche cache le bas de la précédente.
  dessinerNuages(camera.x * 0.3);
  dessinerCollines(camera.x * 0.15, 400, 170, "#9fcfb0", 380);
  if (fond === "foret") dessinerRangeeArbres(camera.x * 0.25, 405, "#8ac69e", 50, 0.8);
  dessinerCollines(camera.x * 0.35, 450, 110, "#74b98a", 240);
  if (fond === "foret") dessinerRangeeArbres(camera.x * 0.5, 480, "#5c9f70", 90, 1.1);
}

// Dans la grotte : pas de ciel, mais de la roche de plus en plus claire quand elle est proche.
function dessinerFondGrotte() {
  const roche = ctx.createLinearGradient(0, 0, 0, H);
  roche.addColorStop(0, "#1f150e");
  roche.addColorStop(1, "#33231a");
  ctx.fillStyle = roche;
  ctx.fillRect(0, 0, W, H);

  // Loin (défile lentement) : des pointes sombres
  dessinerPointes(camera.x * 0.15, 70, 1, "#3a281c", 60, 150, 0);     // stalactites
  dessinerPointes(camera.x * 0.15, 430, -1, "#3a281c", 80, 110, 50);  // stalagmites
  // Plus près (défile plus vite) : des pointes plus claires
  dessinerPointes(camera.x * 0.35, 50, 1, "#4d3526", 100, 120, 100);
  dessinerPointes(camera.x * 0.35, 470, -1, "#4d3526", 120, 140, 150);
}

// Une rangée de pointes de roche qui défile.
// « bord » = hauteur où s'arrête la roche pleine.
// sens = 1 : la roche est en haut et les pointes pendent (stalactites) ;
// sens = -1 : la roche est en bas et les pointes montent (stalagmites).
// « graine » change le tirage au hasard, pour que deux rangées ne se ressemblent pas.
function dessinerPointes(decalage, bord, sens, couleur, espace, longueur, graine) {
  ctx.fillStyle = couleur;
  if (sens > 0) ctx.fillRect(0, 0, W, bord);
  else ctx.fillRect(0, bord, W, H - bord);
  const debut = Math.floor(decalage / espace) - 1;
  for (let i = debut; i <= debut + Math.ceil(W / espace) + 2; i++) {
    const x = i * espace - decalage + (hasard(i + graine) - 0.5) * espace * 0.5;
    const lg = longueur * (0.4 + 0.6 * hasard(i + graine + 20));
    const demi = espace * (0.25 + 0.15 * hasard(i + graine + 40));
    triangle(x - demi, bord, x + demi, bord, x, bord + sens * lg);
  }
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

// Une rangée d'arbres tout plats (une seule couleur), posés sur la ligne « base ».
// « espace » = distance moyenne entre deux arbres, « taille » = 1 pour environ 100 px de haut.
function dessinerRangeeArbres(decalage, base, couleur, espace, taille) {
  ctx.fillStyle = couleur;
  const debut = Math.floor(decalage / espace) - 1;
  for (let i = debut; i <= debut + Math.ceil(W / espace) + 2; i++) {
    const x = i * espace - decalage + (hasard(i + 300) - 0.5) * espace * 0.6;
    const t = taille * (0.75 + 0.5 * hasard(i + 400));
    if (hasard(i + 500) < 0.5) silhouetteSapin(x, base, t);
    else silhouetteFeuillu(x, base, t);
  }
  ctx.fillRect(0, base, W, H - base); // le sol de la forêt, qu'on voit au fond des trous
}

function silhouetteSapin(x, base, t) {
  ctx.fillRect(x - 4 * t, base - 15 * t, 8 * t, 15 * t);
  triangle(x, base - 110 * t, x - 22 * t, base - 55 * t, x + 22 * t, base - 55 * t);
  triangle(x, base - 85 * t, x - 30 * t, base - 30 * t, x + 30 * t, base - 30 * t);
  triangle(x, base - 60 * t, x - 36 * t, base - 12 * t, x + 36 * t, base - 12 * t);
}

function silhouetteFeuillu(x, base, t) {
  ctx.fillRect(x - 5 * t, base - 40 * t, 10 * t, 40 * t);
  ellipse(x, base - 65 * t, 30 * t, 30 * t);
  ellipse(x - 20 * t, base - 45 * t, 20 * t, 16 * t);
  ellipse(x + 20 * t, base - 45 * t, 20 * t, 16 * t);
}

// ---------- Décorations (arbres…) : seulement dessinées, sans hitbox ----------
function dessinerDecorations() {
  for (const d of decorations) {
    if (d.x < camera.x - 100 || d.x > camera.x + W + 100) continue; // hors de l'écran
    if (d.type === "arbre") dessinerArbre(d.x, d.y, d.graine);
  }
}

// x = milieu du tronc, y = pied de l'arbre
function dessinerArbre(x, y, graine) {
  const t = 0.85 + hasard(graine) * 0.3; // taille : entre 85 % et 115 %
  const haut = y - 50 * t;               // haut du tronc

  // Tronc, avec un côté plus sombre
  ctx.fillStyle = "#6b4520";
  ctx.fillRect(x - 6, haut, 12, y - haut);
  ctx.fillStyle = "#523416";
  ctx.fillRect(x + 2, haut, 4, y - haut);

  // Feuillage : des boules de vert, de la plus sombre à la plus claire
  ctx.fillStyle = "#2f7d2a";
  ellipse(x, haut - 14 * t, 34 * t, 26 * t);
  ellipse(x - 20 * t, haut + 2, 20 * t, 16 * t);
  ellipse(x + 20 * t, haut + 2, 20 * t, 16 * t);
  ctx.fillStyle = "#3f9e34";
  ellipse(x - 6 * t, haut - 20 * t, 24 * t, 18 * t);
  ctx.fillStyle = "#62c94a";
  ellipse(x - 12 * t, haut - 28 * t, 10 * t, 7 * t);
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
    case "R": {
      // Roche de grotte : sert de sol, de mur et de plafond
      ctx.fillStyle = "#7a4e2c";
      ctx.fillRect(x, y, TILE, TILE);
      const h = hasard(c * 7 + r * 13);
      ctx.fillStyle = "#653f22";
      ctx.fillRect(x + 3 + h * 10, y + 9 + h * 5, 7, 5);
      ctx.fillRect(x + 18 - h * 4, y + 21, 8, 5);
      ctx.fillStyle = "#8f6038";
      ctx.fillRect(x + 20 - h * 6, y + 7 + h * 4, 5, 3);
      if (r > 0 && !estSolide(tuileA(c, r - 1))) {
        // on peut marcher dessus : bord clair
        ctx.fillStyle = "#a8774a";
        ctx.fillRect(x, y, TILE, 5);
      }
      if (r < grille.length - 1 && !estSolide(tuileA(c, r + 1))) {
        // dessous du plafond : bord sombre
        ctx.fillStyle = "#4f3119";
        ctx.fillRect(x, y + TILE - 5, TILE, 5);
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

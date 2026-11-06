// =====================================================
//  Collisions : qui touche quoi, et le décor qui bloque
// =====================================================

function chevauche(a, b) {
  return a.x < b.x + b.l && a.x + a.l > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function tuileA(c, r) {
  if (c < 0 || c >= grille[0].length) return "X"; // murs invisibles sur les côtés
  if (r < 0 || r >= grille.length) return " ";
  return grille[r][c];
}

function estSolide(t) {
  return t === "#" || t === "X" || t === "B" || t === "?" || t === "U";
}

// Liste des cases solides qui touchent l'entité
function tuilesTouchees(ent) {
  const c1 = Math.floor(ent.x / TILE);
  const c2 = Math.floor((ent.x + ent.l - 0.01) / TILE);
  const r1 = Math.floor(ent.y / TILE);
  const r2 = Math.floor((ent.y + ent.h - 0.01) / TILE);
  const liste = [];
  for (let r = r1; r <= r2; r++) {
    for (let c = c1; c <= c2; c++) {
      if (estSolide(tuileA(c, r))) liste.push({ c, r });
    }
  }
  return liste;
}

// Déplace une entité et la fait buter contre le décor.
// On traite l'axe X puis l'axe Y séparément : c'est plus simple et plus fiable.
function deplacer(ent, dt) {
  const res = { sol: false, mur: false, tete: [] };

  ent.x += ent.vx * dt;
  for (const t of tuilesTouchees(ent)) {
    if (ent.vx > 0) ent.x = t.c * TILE - ent.l;
    else if (ent.vx < 0) ent.x = (t.c + 1) * TILE;
    res.mur = true;
  }
  if (res.mur) ent.vx = 0;

  ent.y += ent.vy * dt;
  for (const t of tuilesTouchees(ent)) {
    if (ent.vy > 0) {
      ent.y = t.r * TILE - ent.h;
      res.sol = true;
    } else if (ent.vy < 0) {
      ent.y = (t.r + 1) * TILE;
      res.tete.push(t);
    }
  }
  if (res.sol || res.tete.length > 0) ent.vy = 0;

  return res;
}

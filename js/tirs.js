// =====================================================
//  Les tirs : petits cercles rouges lancés avec la touche X
// =====================================================

// Crée un tir devant le renard, dans la direction où il regarde
function tirer() {
  const j = joueur;
  tirs.push({
    x: j.dir > 0 ? j.x + j.l : j.x, // part de l'avant du renard
    y: j.y + j.h / 2,               // à mi-hauteur
    sens: j.dir,                    // 1 = vers la droite, -1 = vers la gauche
    parcouru: 0,                    // distance déjà parcourue (px)
  });
  sons.tir();
}

// Fait avancer les tirs en ligne droite, et les retire après PORTEE_TIR pixels
// (ou plus tôt s'ils rencontrent un bloc et que TIR_BLOQUE_PAR_DECOR est activé)
function majTirs(dt) {
  for (const t of tirs) {
    // on n'avance jamais plus loin que la portée, même sur la dernière image
    const pas = Math.min(VITESSE_TIR * dt, PORTEE_TIR - t.parcouru);
    t.x += t.sens * pas;
    t.parcouru += pas;
    if (TIR_BLOQUE_PAR_DECOR && tirToucheLeDecor(t)) t.arrete = true;
  }
  tirs = tirs.filter((t) => t.parcouru < PORTEE_TIR && !t.arrete);
}

// Le tir touche-t-il un bloc solide (un bloc qui a une hitbox) ?
// On le traite comme un petit carré autour du cercle, et on réutilise
// la même fonction que pour les collisions du renard et des ennemis.
function tirToucheLeDecor(t) {
  const zone = { x: t.x - RAYON_TIR, y: t.y - RAYON_TIR, l: RAYON_TIR * 2, h: RAYON_TIR * 2 };
  return tuilesTouchees(zone).length > 0;
}

function dessinerTirs() {
  ctx.fillStyle = "#e53935";
  for (const t of tirs) ellipse(t.x, t.y, RAYON_TIR, RAYON_TIR);
}

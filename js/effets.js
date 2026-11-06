// =====================================================
//  Effets : pièces qui sautent, textes de score, blocs qui rebondissent
// =====================================================

function ajouterTexte(x, y, texte) {
  effets.push({ type: "texte", x, y, texte, t: 0.8 });
}

function majEffets(dt) {
  for (const f of effets) {
    f.t -= dt;
    if (f.type === "piece") {
      f.vy += 1400 * dt;
      f.y += f.vy * dt;
    } else {
      f.y -= 40 * dt;
    }
  }
  effets = effets.filter((f) => f.t > 0);

  for (const cle in rebonds) {
    rebonds[cle] += dt;
    if (rebonds[cle] > 0.2) delete rebonds[cle];
  }
}

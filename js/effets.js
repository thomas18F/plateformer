// =====================================================
//  Effets : pièces qui sautent, textes de dégâts, blocs qui rebondissent
// =====================================================

// Un petit texte qui monte puis s'efface (par exemple les dégâts « -5 »)
function ajouterTexte(x, y, texte, couleur = "#fff") {
  effets.push({ type: "texte", x, y, texte, couleur, t: 0.8 });
}

// Affiche « -N » au-dessus du personnage touché, avant de lui retirer ses PV.
// N = les PV vraiment perdus : jamais plus que ceux qui lui restent.
// Le texte reste dans l'écran, même si le personnage est tombé dans un trou.
function afficherDegats(cible, degats, couleur) {
  const pvPerdus = Math.min(degats, cible.pv);
  const y = Math.min(cible.y - 10, hauteurNiveau - 20);
  ajouterTexte(cible.x + cible.l / 2, y, "-" + pvPerdus, couleur);
}

function majEffets(dt) {
  for (const f of effets) {
    f.t -= dt;
    if (f.type === "piece") {
      f.vy += 1400 * dt;
      f.y += f.vy * dt;
    } else if (f.type === "texte") {
      f.y -= 40 * dt;
    }
  }
  effets = effets.filter((f) => f.t > 0);

  for (const cle in rebonds) {
    rebonds[cle] += dt;
    if (rebonds[cle] > 0.2) delete rebonds[cle];
  }
}

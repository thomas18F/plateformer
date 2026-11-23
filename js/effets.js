// =====================================================
//  Effets : pièces qui sautent, textes de dégâts, blocs qui rebondissent
// =====================================================

// Un petit texte qui monte puis s'efface (par exemple les dégâts « -5 »)
function ajouterTexte(x, y, texte, couleur = "#fff") {
  effets.push({ type: "texte", x, y, texte, couleur, t: 0.8 });
}

// Le Pokémon gagne n pièces : une pièce saute depuis (x, y), puis « n×● » monte et s'efface
function gagnerPieces(n, x, y) {
  nbPieces += n;
  effets.push({ type: "piece", x, y, vy: -450, t: 0.45, gain: n });
  sons.piece();
}

// Affiche « -N » au-dessus du personnage touché, avant de lui retirer ses PV.
// N = les PV vraiment perdus : jamais plus que ceux qui lui restent.
// 0 dégât veut dire que la capacité n'a aucun effet sur ses types (×0) : on affiche « Immunisé ».
// Le texte reste dans l'écran, même si le personnage est tombé dans un trou.
function afficherDegats(cible, degats, couleur) {
  const pvPerdus = Math.min(degats, cible.pv);
  const texte = degats === 0 ? "Immunisé" : "-" + pvPerdus;
  const y = Math.min(cible.y - 10, hauteurNiveau - 20);
  ajouterTexte(cible.x + cible.l / 2, y, texte, couleur);
}

function majEffets(dt) {
  for (const f of effets) {
    f.t -= dt;
    if (f.type === "piece") {
      f.vy += 1400 * dt;
      f.y += f.vy * dt;
      // La pièce (sortie d'un bloc ou d'un ennemi battu) laisse place à « N×● », qui monte puis s'efface
      if (f.t <= 0 && f.gain) {
        f.type = "gain";
        f.t = 0.8;
      }
    } else if (f.type === "texte" || f.type === "gain") {
      f.y -= 40 * dt;
    }
  }
  effets = effets.filter((f) => f.t > 0);

  for (const cle in rebonds) {
    rebonds[cle] += dt;
    if (rebonds[cle] > 0.2) delete rebonds[cle];
  }
}

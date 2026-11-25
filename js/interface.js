// =====================================================
//  Bandeau en haut de l'écran et écrans (titre, pause, victoire…)
// =====================================================

function dessinerHUD() {
  ctx.font = "bold 20px system-ui, sans-serif";
  ctx.textBaseline = "middle";
  ctx.textAlign = "left";
  texteContour(`PV  ${Math.max(0, joueur.pv)} / ${joueur.espece.pv}`, 20, 26);
  dessinerPiece(172, 26, 0);
  texteContour(`× ${String(nbPieces).padStart(2, "0")}`, 186, 26);
  ctx.textAlign = "right";
  texteContour(`NIVEAU  ${numeroNiveau + 1}`, W - 20, 26);
}

function dessinerEcran() {
  if (etat === "jeu" || etat === "transition") return;

  ctx.fillStyle = "rgba(15, 20, 35, 0.6)";
  ctx.fillRect(0, 0, W, H);
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const clignote = Math.floor(temps * 2) % 2 === 0;

  const titre = (texte, couleur) => {
    ctx.font = "bold 60px system-ui, sans-serif";
    texteContour(texte, W / 2, 150, couleur, 8);
  };
  const lignes = (liste, y) => {
    ctx.font = "20px system-ui, sans-serif";
    liste.forEach((l, i) => texteContour(l, W / 2, y + i * 34));
  };
  const invite = (texte) => {
    ctx.font = "bold 26px system-ui, sans-serif";
    if (clignote) texteContour(texte, W / 2, 450, "#ffe27a");
  };

  if (etat === "titre") {
    titre("Super Pokémon Plateformer", "#ffb347");
    lignes([
      "← → : se déplacer       Espace ou ↑ : sauter (reste appuyé pour sauter plus haut)",
      "X : flammèche     C : écrasement     V : balle ombre     M : voir la carte",
      "Active écrasement avec C, puis saute sur un aspicot dans les 3 secondes",
      `Tape les blocs dorés par en dessous et va jusqu'au bout des ${NIVEAUX.length} niveaux !`,
    ], 240);
    invite("Appuie sur Entrée pour jouer");
  } else if (etat === "pause") {
    titre("Pause", "#fff");
    lignes(["P ou Entrée pour reprendre"], 250);
  } else if (etat === "victoire") {
    // Seulement après le dernier niveau : entre deux niveaux, c'est la transition (transition.js)
    titre("Bravo, tu as fini le jeu !", "#7dff9a");
    lignes([
      `Pièces : ${nbPieces}`,
      `Temps : ${Math.floor(chrono)} s`,
    ], 240);
    invite("Entrée pour rejouer");
  } else if (etat === "gameover") {
    titre("Partie terminée", "#ff7d7d");
    invite("Entrée pour recommencer");
  }
}

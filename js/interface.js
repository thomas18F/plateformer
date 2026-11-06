// =====================================================
//  Score en haut de l'écran et écrans (titre, pause, victoire…)
// =====================================================

function dessinerHUD() {
  ctx.font = "bold 20px system-ui, sans-serif";
  ctx.textBaseline = "middle";
  ctx.textAlign = "left";
  texteContour(`SCORE  ${String(score).padStart(6, "0")}`, 20, 26);
  dessinerPiece(262, 26, 0);
  texteContour(`× ${String(nbPieces).padStart(2, "0")}`, 276, 26);
  texteContour(`VIES  ${vies}`, 400, 26);
  ctx.textAlign = "right";
  texteContour(`TEMPS  ${Math.floor(chrono)}`, W - 20, 26);
}

function dessinerEcran() {
  if (etat === "jeu" || etat === "drapeau") return;

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
    titre("Le Petit Renard", "#ffb347");
    lignes([
      "← → : se déplacer       X : tirer",
      "Espace ou ↑ : sauter (reste appuyé pour sauter plus haut)",
      "Saute sur les gloups violets pour les écraser",
      "Tape les blocs dorés par en dessous",
      "Atteins le drapeau au bout du niveau !",
    ], 240);
    invite("Appuie sur Entrée pour jouer");
  } else if (etat === "pause") {
    titre("Pause", "#fff");
    lignes(["P ou Entrée pour reprendre"], 250);
  } else if (etat === "victoire") {
    titre("Niveau terminé !", "#7dff9a");
    lignes([
      `Score : ${score}`,
      `Pièces : ${nbPieces}`,
      `Temps : ${Math.floor(chrono)} s`,
      `Bonus drapeau : ${bonusDrapeau}`,
    ], 240);
    invite("Entrée pour rejouer");
  } else if (etat === "gameover") {
    titre("Partie terminée", "#ff7d7d");
    lignes([`Score : ${score}`], 250);
    invite("Entrée pour recommencer");
  }
}

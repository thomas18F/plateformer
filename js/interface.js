// =====================================================
//  Bandeau en haut de l'écran et écrans (titre, pause, victoire…)
// =====================================================

function dessinerHUD() {
  ctx.font = "bold 20px system-ui, sans-serif";
  ctx.textBaseline = "middle";
  ctx.textAlign = "left";
  texteContour(`PV  ${Math.max(0, joueur.pv)} / ${PV_JOUEUR}`, 20, 26);
  dessinerPiece(172, 26, 0);
  texteContour(`× ${String(nbPieces).padStart(2, "0")}`, 186, 26);
  ctx.textAlign = "right";
  texteContour(`NIVEAU  ${numeroNiveau + 1}`, W - 20, 26);
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
      "← → : se déplacer       X : flammèche       C : écrasement       V : balle ombre       B : charge",
      "Espace ou ↑ : sauter (reste appuyé pour sauter plus haut)",
      "Active écrasement avec C, puis saute sur un gloup dans les 3 secondes",
      "Active charge avec B : dash de 32 px et attaque latérale pendant 3 secondes",
      "Tape les blocs dorés par en dessous",
      `Atteins le drapeau au bout de chacun des ${NIVEAUX.length} niveaux !`,
    ], 240);
    invite("Appuie sur Entrée pour jouer");
  } else if (etat === "pause") {
    titre("Pause", "#fff");
    lignes(["P ou Entrée pour reprendre"], 250);
  } else if (etat === "victoire") {
    const fini = estDernierNiveau();
    titre(fini ? "Bravo, tu as fini le jeu !" : `Niveau ${numeroNiveau + 1} terminé !`, "#7dff9a");
    lignes([
      `Pièces : ${nbPieces}`,
      `Temps : ${Math.floor(chrono)} s`,
    ], 240);
    invite(fini ? "Entrée pour rejouer" : "Entrée pour revenir à la carte");
  } else if (etat === "gameover") {
    titre("Partie terminée", "#ff7d7d");
    invite("Entrée pour recommencer");
  }
}

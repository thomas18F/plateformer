// =====================================================
//  La boucle principale : mise à jour, dessin, démarrage
// =====================================================

// ---------- Mise à jour générale ----------
function mettreAJour(dt) {
  temps += dt;
  switch (etat) {
    case "titre":
      if (appuye.entree || appuye.saut) nouvellePartie();
      break;
    case "carte":
      majCarte(dt);
      break;
    case "jeu":
      if (appuye.pause) { etat = "pause"; break; }
      if (!joueur.mort) chrono += dt;
      majJoueur(dt);
      if (!joueur.mort) {
        majEnnemis(dt);
        majTirs(dt);
        majCamera(dt);
      }
      majEffets(dt);
      break;
    case "pause":
      if (appuye.pause || appuye.entree) etat = "jeu";
      break;
    case "drapeau":
      majDrapeau(dt);
      majTirs(dt);
      majEffets(dt);
      majCamera(dt);
      break;
    case "victoire":
      majEffets(dt);
      if (appuye.entree) {
        if (estDernierNiveau()) nouvellePartie();
        else retourCarteApresVictoire();
      }
      break;
    case "gameover":
      majEffets(dt);
      if (appuye.entree) nouvellePartie();
      break;
  }
  appuye = {};
}

// ---------- Dessin d'une image ----------
function dessiner() {
  // Avant chaque image : tout ce qui sera dessiné est agrandi ZOOM fois.
  // Un rectangle de 32 × 32 « pixels du jeu » couvre donc 64 × 64 vrais pixels.
  ctx.setTransform(ZOOM, 0, 0, ZOOM, 0, 0);

  if (etat === "carte") {
    dessinerCarte(); // la carte du monde prend tout l'écran
    return;
  }

  dessinerFond();

  ctx.save();
  ctx.translate(-Math.round(camera.x), 0); // tout le monde bouge avec la caméra
  dessinerDecorations(); // en premier : les tuiles et les personnages passent devant
  dessinerDecor();
  dessinerDrapeau();
  for (const p of pieces) dessinerPiece(p.x + p.l / 2, p.y + p.h / 2, temps * 4 + p.x * 0.05);
  for (const e of ennemis) dessinerEnnemi(e);
  dessinerJoueur();
  dessinerTirs();
  dessinerEffets();
  ctx.restore();

  if (etat !== "titre") dessinerHUD();
  dessinerEcran();
}

// ---------- Boucle de jeu (physique à 60 pas par seconde, quel que soit l'écran) ----------
const PAS = 1 / 60;
let dernier = 0;
let cumul = 0;

function boucle(maintenant) {
  cumul += Math.min((maintenant - dernier) / 1000, 0.1);
  dernier = maintenant;
  while (cumul >= PAS) {
    mettreAJour(PAS);
    cumul -= PAS;
  }
  dessiner();
  requestAnimationFrame(boucle);
}

// ---------- C'est parti ! ----------
chargerNiveau();
requestAnimationFrame((t) => {
  dernier = t;
  boucle(t);
});

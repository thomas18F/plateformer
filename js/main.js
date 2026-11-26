// =====================================================
//  La boucle principale : mise à jour, dessin, démarrage
// =====================================================

// ---------- Mise à jour de tout ce qui bouge dans le niveau ----------
// obeitAuxTouches = false pendant une transition : le Pokémon ne fait plus rien de lui-même
function majNiveau(dt, obeitAuxTouches) {
  majJoueur(dt, obeitAuxTouches);
  if (!joueur.mort) {
    majEnnemis(dt);
    majRafales(dt); // les projectiles suivants d'une rafale (balle graine…)
    majTirs(dt);
    majCamera(dt);
  }
  majEffets(dt);
}

// ---------- Mise à jour générale ----------
function mettreAJour(dt) {
  temps += dt;
  switch (etat) {
    case "titre":
      if (appuye.entree || appuye.saut) nouvellePartie();
      break;
    case "carte":
      majCarte();
      break;
    case "jeu":
      if (appuye.pause) { etat = "pause"; break; }
      if (appuye.carte) { etat = "carte"; break; } // le niveau attend, comme en pause : on le reprend là où on en était
      if (!joueur.mort) chrono += dt;
      majNiveau(dt, true);
      break;
    case "transition":
      // Pas de carte ni de pause ici, et le Pokémon n'obéit plus aux touches (voir transition.js)
      majNiveau(dt, false);
      majTransition(dt);
      break;
    case "pause":
      if (appuye.pause || appuye.entree) etat = "jeu";
      break;
    case "victoire":
      majEffets(dt);
      if (appuye.entree) nouvellePartie(); // on n'arrive ici qu'après le dernier niveau
      break;
    case "gameover":
      majEffets(dt);
      // Retour au dernier centre Pokémon ; s'il n'est passé devant aucun, tout recommence au niveau 1
      if (appuye.entree) {
        if (pointDeSauvegarde) reprendreAuCentre();
        else nouvellePartie();
      }
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
  dessinerCentresPokemon(); // pareil : le Pokémon passe devant
  dessinerDecor();
  for (const p of pieces) dessinerPiece(p.x + p.l / 2, p.y + p.h / 2, temps * 4 + p.x * 0.05);
  for (const e of ennemis) dessinerEnnemi(e);
  dessinerJoueur();
  dessinerStatuts(); // les bulles de brûlure ou de poison, par-dessus les Pokémon
  dessinerRalentissements(); // les fils de sécrétion, par-dessus les Pokémon aussi
  dessinerTirs();
  dessinerEffets();
  ctx.restore();

  if (etat !== "titre") dessinerHUD();
  dessinerEcran();
  if (etat === "transition") dessinerTransition(); // en dernier : le noir cache aussi le bandeau
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

// =====================================================
//  Les tirs du renard (cercles rouges, touche X)
//  et ceux des ennemis (triangles violets), tous dans la même liste.
//  Le champ « camp » dit qui a tiré : "joueur" ou "ennemi".
// =====================================================

// Crée un tir qui part de l'avant du tireur (renard ou ennemi), à mi-hauteur
function creerTir(tireur, sens, camp, projectile) {
  tirs.push({
    x: sens > 0 ? tireur.x + tireur.l : tireur.x,
    y: tireur.y + tireur.h / 2,
    sens,         // 1 = vers la droite, -1 = vers la gauche
    camp,         // "joueur" ou "ennemi"
    forme: projectile.forme,
    couleur: projectile.couleur,
    rayon: projectile.rayon,
    spectral: projectile.spectral,
    vitesse: projectile.vitesse, // px/s
    portee: projectile.portee,  // distance maximale (px)
    degats: projectile.degats,
    parcouru: 0,  // distance déjà parcourue (px)
  });
}

// Le renard tire dans la direction où il regarde
function activerCapacite(utilisateur, capacite, camp) {
  const sens = camp === "joueur" ? utilisateur.dir : sensEnnemi(utilisateur);
  creerTir(utilisateur, sens, camp, capacite.projectile);
  if (camp === "joueur") sons.tir();
  else sons.tirEnnemi();
}

// Fait avancer les tirs en ligne droite, et les retire :
//  - après leur portée,
//  - s'ils rencontrent un bloc (sauf s'ils sont spectraux),
//  - s'ils touchent leur cible : un ennemi pour un tir du renard, le renard pour un tir ennemi.
// Les tirs ne se touchent pas entre eux : ils se croisent.
function majTirs(dt) {
  for (const tir of tirs) {
    // on n'avance jamais plus loin que la portée, même sur la dernière image
    const pas = Math.min(tir.vitesse * dt, tir.portee - tir.parcouru);
    tir.x += tir.sens * pas;
    tir.parcouru += pas;

    if (!tir.spectral && tirToucheLeDecor(tir)) {
      tir.arrete = true;
      continue;
    }

    if (tir.camp === "joueur") {
      const ennemi = ennemiTouchePar(tir);
      if (ennemi) {
        blesserEnnemi(ennemi, tir.degats);
        tir.arrete = true; // un tir ne blesse qu'un seul ennemi
      }
    } else if (etat === "jeu" && chevauche(hitboxTir(tir), joueur)) {
      // (pas pendant la descente du drapeau : le niveau est déjà gagné)
      blesserJoueur(tir.degats);
      tir.arrete = true;
    }
  }
  tirs = tirs.filter((tir) => tir.parcouru < tir.portee && !tir.arrete);
}

// La hitbox d'un tir : un petit carré autour du dessin
function hitboxTir(tir) {
  return { x: tir.x - tir.rayon, y: tir.y - tir.rayon, l: tir.rayon * 2, h: tir.rayon * 2 };
}

// Le tir touche-t-il un bloc solide (un bloc qui a une hitbox) ?
// On réutilise la même fonction que pour les collisions du renard et des ennemis.
function tirToucheLeDecor(tir) {
  return tuilesTouchees(hitboxTir(tir)).length > 0;
}

// Le premier ennemi vivant touché par le tir (ou undefined s'il n'y en a aucun)
function ennemiTouchePar(tir) {
  const zone = hitboxTir(tir);
  return ennemis.find((ennemi) => !ennemi.mort && chevauche(zone, ennemi));
}

function dessinerTirs() {
  for (const t of tirs) {
    const r = t.rayon;
    if (t.forme === "cercle") {
      ctx.fillStyle = t.couleur;
      ellipse(t.x, t.y, r, r);
    } else {
      ctx.fillStyle = t.couleur;
      triangle(t.x + t.sens * r, t.y, t.x - t.sens * r, t.y - r, t.x - t.sens * r, t.y + r);
    }
  }
}

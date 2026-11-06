// =====================================================
//  Les tirs du renard (cercles rouges, touche X)
//  et ceux des ennemis (triangles violets), tous dans la même liste.
//  Le champ « camp » dit qui a tiré : "joueur" ou "ennemi".
// =====================================================

// Crée un tir qui part de l'avant du tireur (renard ou ennemi), à mi-hauteur
function creerTir(tireur, sens, camp, vitesse, portee) {
  tirs.push({
    x: sens > 0 ? tireur.x + tireur.l : tireur.x,
    y: tireur.y + tireur.h / 2,
    sens,         // 1 = vers la droite, -1 = vers la gauche
    camp,         // "joueur" ou "ennemi"
    vitesse,      // px/s
    portee,       // distance maximale (px)
    parcouru: 0,  // distance déjà parcourue (px)
  });
}

// Le renard tire dans la direction où il regarde
function tirer() {
  creerTir(joueur, joueur.dir, "joueur", VITESSE_TIR, PORTEE_TIR);
  sons.tir();
}

// Un ennemi tire dans la direction où il marche
function tirerEnnemi(e) {
  creerTir(e, sensEnnemi(e), "ennemi", VITESSE_TIR_ENNEMI, PORTEE_TIR_ENNEMI);
  sons.tirEnnemi();
}

// Fait avancer les tirs en ligne droite, et les retire :
//  - après leur portée,
//  - s'ils rencontrent un bloc (seulement si TIR_BLOQUE_PAR_DECOR est activé),
//  - s'ils touchent leur cible : un ennemi pour un tir du renard, le renard pour un tir ennemi.
// Les tirs ne se touchent pas entre eux : ils se croisent.
function majTirs(dt) {
  for (const t of tirs) {
    // on n'avance jamais plus loin que la portée, même sur la dernière image
    const pas = Math.min(t.vitesse * dt, t.portee - t.parcouru);
    t.x += t.sens * pas;
    t.parcouru += pas;

    if (TIR_BLOQUE_PAR_DECOR && tirToucheLeDecor(t)) {
      t.arrete = true;
      continue;
    }

    if (t.camp === "joueur") {
      const e = ennemiTouchePar(t);
      if (e) {
        blesserEnnemi(e, DEGATS_TIR);
        t.arrete = true; // un tir ne blesse qu'un seul ennemi
      }
    } else if (etat === "jeu" && chevauche(hitboxTir(t), joueur)) {
      // (pas pendant la descente du drapeau : le niveau est déjà gagné)
      blesserJoueur(DEGATS_TIR_ENNEMI);
      t.arrete = true;
    }
  }
  tirs = tirs.filter((t) => t.parcouru < t.portee && !t.arrete);
}

// La hitbox d'un tir : un petit carré autour du dessin
function hitboxTir(t) {
  return { x: t.x - RAYON_TIR, y: t.y - RAYON_TIR, l: RAYON_TIR * 2, h: RAYON_TIR * 2 };
}

// Le tir touche-t-il un bloc solide (un bloc qui a une hitbox) ?
// On réutilise la même fonction que pour les collisions du renard et des ennemis.
function tirToucheLeDecor(t) {
  return tuilesTouchees(hitboxTir(t)).length > 0;
}

// Le premier ennemi vivant touché par le tir (ou undefined s'il n'y en a aucun)
function ennemiTouchePar(t) {
  const zone = hitboxTir(t);
  return ennemis.find((e) => !e.mort && chevauche(zone, e));
}

function dessinerTirs() {
  const r = RAYON_TIR;
  for (const t of tirs) {
    if (t.camp === "joueur") {
      ctx.fillStyle = "#e53935"; // cercle rouge
      ellipse(t.x, t.y, r, r);
    } else {
      ctx.fillStyle = "#6d28d9"; // triangle violet, pointe dans le sens du tir
      triangle(t.x + t.sens * r, t.y, t.x - t.sens * r, t.y - r, t.x - t.sens * r, t.y + r);
    }
  }
}

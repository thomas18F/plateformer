// =====================================================
//  Les ennemis (les gloups)
// =====================================================

function creerEnnemi(x, y) {
  return {
    x: x + 2, y: y + 8, l: 28, h: 24, vx: -VITESSE_ENNEMI, vy: 0,
    pv: PV_ENNEMI, // points de vie
    attenteTir: 0, // secondes à attendre avant de pouvoir tirer à nouveau
    actif: false, mort: false, ejecte: false, timer: 0, anim: Math.random() * 10,
  };
}

function majEnnemis(dt) {
  for (const e of ennemis) {
    if (e.mort) {
      e.timer -= dt;
      if (e.ejecte) {
        e.vy += GRAVITE * dt;
        e.y += e.vy * dt;
      }
      continue;
    }

    // Les ennemis ne bougent qu'une fois arrivés à l'écran
    if (!e.actif) {
      if (e.x < camera.x + W + TILE) e.actif = true;
      else continue;
    }

    e.anim += dt;
    e.vy = Math.min(e.vy + GRAVITE * dt, CHUTE_MAX);
    const sens = Math.sign(e.vx);
    const res = deplacer(e, dt);
    if (res.mur) {
      e.vx = -sens * VITESSE_ENNEMI;
    } else if (res.sol) {
      // Demi-tour au bord du vide
      const devant = sens > 0 ? e.x + e.l + 1 : e.x - 1;
      const sousLesPieds = tuileA(Math.floor(devant / TILE), Math.floor((e.y + e.h + 1) / TILE));
      if (!estSolide(sousLesPieds)) e.vx = -e.vx;
    }
    if (e.y > hauteurNiveau) {
      e.mort = true;
      e.timer = 0;
      continue;
    }

    // Tir : si le renard est dans la zone de détection et que le délai est écoulé
    e.attenteTir = Math.max(0, e.attenteTir - dt);
    if (e.attenteTir === 0 && chevauche(zoneDetection(e), joueur)) {
      tirerEnnemi(e);
      e.attenteTir = DELAI_TIR_ENNEMI;
    }
  }

  // Deux ennemis qui se cognent repartent chacun de leur côté
  for (let i = 0; i < ennemis.length; i++) {
    for (let k = i + 1; k < ennemis.length; k++) {
      const a = ennemis[i], b = ennemis[k];
      if (a.mort || b.mort || !chevauche(a, b)) continue;
      const aGauche = a.x < b.x;
      a.vx = aGauche ? -VITESSE_ENNEMI : VITESSE_ENNEMI;
      b.vx = aGauche ? VITESSE_ENNEMI : -VITESSE_ENNEMI;
    }
  }

  ennemis = ennemis.filter((e) => !e.mort || e.timer > 0);
}

// Le sens dans lequel l'ennemi marche : 1 = vers la droite, -1 = vers la gauche
function sensEnnemi(e) {
  return e.vx < 0 ? -1 : 1;
}

// La zone de détection : un rectangle devant l'ennemi, de la même hauteur que lui
function zoneDetection(e) {
  const sens = sensEnnemi(e);
  return {
    x: sens > 0 ? e.x + e.l : e.x - DETECTION_ENNEMI,
    y: e.y,
    l: DETECTION_ENNEMI,
    h: e.h,
  };
}

// Retire des points de vie à un ennemi ; il meurt quand il n'en a plus
function blesserEnnemi(e, degats) {
  e.pv -= degats;
  if (e.pv <= 0) ecraserEnnemi(e, true); // éjecté, comme quand on frappe le bloc sous lui
}

function ecraserEnnemi(e, ejecte) {
  e.mort = true;
  e.ejecte = ejecte;
  e.timer = ejecte ? 1.5 : 0.5;
  if (ejecte) e.vy = -350;
  score += 100;
  ajouterTexte(e.x + e.l / 2, e.y - 10, "+100");
  sons.ecrase();
}

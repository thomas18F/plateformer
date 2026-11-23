// =====================================================
//  Les ennemis (aspicots, simularbres…)
// =====================================================

// x, y : le coin en haut à gauche de la case de départ (en px).
// L'ennemi est posé en bas de cette case et centré dessus :
// un grand ennemi déborde donc vers le haut et un peu sur les côtés.
function creerEnnemi(x, y, nom, capaciteId) {
  const espece = POKEDEX.find((p) => p.id === nom) || POKEDEX[0]; // aspicot par défaut
  return {
    espece, // sa fiche du POKEDEX (reglages.js) : taille, PV, vitesse, gravité…
    x: x + (TILE - espece.l) / 2, y: y + TILE - espece.h, l: espece.l, h: espece.h,
    vx: -espece.vitesse, vy: 0,
    pv: espece.pv, // points de vie
    types: [...espece.types], // une copie : chaque ennemi a sa propre liste, qu'on peut changer sans toucher au POKEDEX
    capacite: CAPACITES.find((c) => c.id === capaciteId) || null,
    attenteTir: 0, // secondes à attendre avant de pouvoir tirer à nouveau
    statut: null,  // brûlure, poison… (voir statuts.js)
    actif: false, mort: false, ejecte: false, timer: 0, anim: Math.random() * 10,
  };
}

function majEnnemis(dt) {
  for (const e of ennemis) {
    if (e.mort) {
      e.timer -= dt;
      if (e.ejecte) {
        appliquerGravite(e, dt); // gravité normale : même un ennemi qui flotte retombe quand il est éjecté
        e.y += e.vy * dt;
      }
      continue;
    }

    // Les ennemis ne bougent qu'une fois arrivés à l'écran
    if (!e.actif) {
      if (e.x < camera.x + W + TILE) e.actif = true;
      else continue;
    }

    majStatut(e, dt); // la brûlure ou le poison font perdre des PV de temps en temps
    if (e.mort) continue;

    e.anim += dt;
    appliquerGravite(e, dt, estVolant(e) ? 0 : 1); // un ennemi de type vol flotte : il reste à sa hauteur
    const sens = Math.sign(e.vx);
    const res = deplacer(e, dt);
    if (res.mur) {
      e.vx = -sens * e.espece.vitesse;
    } else if (res.sol) {
      // Demi-tour au bord du vide
      const devant = sens > 0 ? e.x + e.l + 1 : e.x - 1;
      const sousLesPieds = tuileA(Math.floor(devant / TILE), Math.floor((e.y + e.h + 1) / TILE));
      if (!estSolide(sousLesPieds)) e.vx = -e.vx;
    }
    if (e.y > hauteurNiveau) {
      e.mort = true;
      e.timer = 0;
      gagnerValeur(e); // tombé dans un trou (un ennemi de type vol touché par anti-air) : il compte comme battu
      continue;
    }

    // Tir : si le Pokémon est dans la zone de détection et que le délai est écoulé
    e.attenteTir = Math.max(0, e.attenteTir - dt);
    if (e.capacite && e.attenteTir === 0 && chevauche(zoneDetection(e), joueur)) {
      activerCapacite(e, e.capacite, "ennemi");
      e.attenteTir = DELAI_TIR_ENNEMI;
    }
  }

  // Deux ennemis qui se cognent repartent chacun de leur côté
  for (let i = 0; i < ennemis.length; i++) {
    for (let k = i + 1; k < ennemis.length; k++) {
      const a = ennemis[i], b = ennemis[k];
      if (a.mort || b.mort || !chevauche(a, b)) continue;
      const aGauche = a.x < b.x;
      a.vx = aGauche ? -a.espece.vitesse : a.espece.vitesse;
      b.vx = aGauche ? b.espece.vitesse : -b.espece.vitesse;
    }
  }

  ennemis = ennemis.filter((e) => !e.mort || e.timer > 0);
}

// Le sens dans lequel l'ennemi marche : 1 = vers la droite, -1 = vers la gauche
function sensEnnemi(e) {
  return e.vx < 0 ? -1 : 1;
}

// La zone de détection : un rectangle devant l'ennemi, de la même hauteur que lui.
// Si sa capacité tire vers le haut (anti-air), c'est un rectangle juste au-dessus de lui, de sa largeur :
// il tire quand le Pokémon lui saute par-dessus.
// Si elle tire vers le bas (bombe beurk), c'est un rectangle juste en dessous de lui, de sa largeur :
// il tire quand le Pokémon passe sous lui.
function zoneDetection(e) {
  const direction = e.capacite?.projectile?.direction;
  if (direction === "haut") {
    return { x: e.x, y: e.y - DETECTION_ENNEMI, l: e.l, h: DETECTION_ENNEMI };
  }
  if (direction === "bas") {
    return { x: e.x, y: e.y + e.h, l: e.l, h: DETECTION_ENNEMI };
  }
  const sens = sensEnnemi(e);
  return {
    x: sens > 0 ? e.x + e.l : e.x - DETECTION_ENNEMI,
    y: e.y,
    l: DETECTION_ENNEMI,
    h: e.h,
  };
}

// Retire des points de vie à un ennemi ; il meurt quand il n'en a plus.
// couleur : celle du « -N » (par exemple la couleur du statut, pour les dégâts de brûlure ou de poison).
function blesserEnnemi(e, degats, couleur = COULEUR_DEGATS_ENNEMI) {
  if (e.mort) return; // déjà battu : il ne rapporte pas ses pièces une deuxième fois
  afficherDegats(e, degats, couleur);
  e.pv -= degats;
  if (e.pv <= 0) {
    ecraserEnnemi(e, true); // éjecté, comme quand on frappe le bloc sous lui
    gagnerValeur(e);
  }
}

// L'ennemi est battu : le Pokémon gagne sa « valeur » en pièces (POKEDEX, reglages.js)
function gagnerValeur(e) {
  if (!e.espece.valeur) return;
  const y = Math.min(e.y, hauteurNiveau - 20); // s'il est tombé dans un trou, la pièce saute quand même dans l'écran
  gagnerPieces(e.espece.valeur, e.x + e.l / 2, y);
}

function ecraserEnnemi(e, ejecte) {
  e.mort = true;
  e.ejecte = ejecte;
  e.timer = ejecte ? 1.5 : 0.5;
  if (ejecte) e.vy = -350;
  sons.ecrase();
}

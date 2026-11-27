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
    charge: null,  // sa charge en cours (voir charge.js)
    statut: null,  // brûlure, poison… (voir statuts.js)
    ralentissement: null, // sécrétion (voir ralentir dans statuts.js)
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
    majRalentissement(e, dt);
    // Pendant une charge, c'est elle qui décide de sa vitesse : arrêt, puis dash (voir charge.js)
    const enCharge = majCharge(e, dt);
    if (!enCharge) e.vx = sensEnnemi(e) * vitesseEnnemi(e); // il ralentit dès qu'il est touché, et repart à sa vitesse dès la fin

    e.anim += dt;
    const sens = Math.sign(e.vx);
    const xAvantDeplacement = e.x;
    const res = deplacerEnnemi(e, dt);
    if (enCharge) {
      // Pendant le dash, il ne fait pas demi-tour : ni contre un mur (le dash s'arrête), ni au bord du vide (il peut tomber)
      suivreCharge(e, xAvantDeplacement, res);
      if (e.charge.finie) e.vx = e.charge.direction * vitesseEnnemi(e); // à la fin du dash, il repart en marchant dans le même sens
    } else if (res.mur) {
      e.vx = -sens * vitesseEnnemi(e);
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

    // Pendant le dash de sa charge, il blesse le Pokémon qu'il percute
    // (pas si le Pokémon est arrivé au bout ou pendant la transition : il est invulnérable)
    if (etat === "jeu" && chevauche(e, joueur)) toucherParCharge(e, joueur);

    // Tir : si sa capacité toucherait le Pokémon et que le délai est écoulé
    e.attenteTir = Math.max(0, e.attenteTir - dt);
    if (e.capacite && e.attenteTir === 0 && peutToucher(e, e.capacite, joueur)) {
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
      a.vx = aGauche ? -vitesseEnnemi(a) : vitesseEnnemi(a);
      b.vx = aGauche ? vitesseEnnemi(b) : -vitesseEnnemi(b);
    }
  }

  ennemis = ennemis.filter((e) => !e.mort || e.timer > 0);
}

// La vitesse de marche de l'ennemi (px/s) : celle de son espèce, moins s'il est ralenti (sécrétion)
function vitesseEnnemi(e) {
  return e.espece.vitesse * facteurVitesse(e);
}

// Le sens dans lequel l'ennemi marche : 1 = vers la droite, -1 = vers la gauche.
// Pendant une charge, c'est celui de la charge : il est à l'arrêt pendant la préparation, mais il regarde toujours devant lui.
function sensEnnemi(e) {
  if (e.charge) return e.charge.direction;
  return e.vx < 0 ? -1 : 1;
}

// La gravité puis le déplacement d'un ennemi (un ennemi de type vol flotte : il reste à sa hauteur).
// Sert à l'ennemi lui-même et à sa charge fantôme (chargePeutToucher) : ils bougent exactement pareil.
function deplacerEnnemi(e, dt) {
  appliquerGravite(e, dt, estVolant(e) ? 0 : 1);
  return deplacer(e, dt);
}

// L'ennemi toucherait-il la cible s'il utilisait cette capacité maintenant ?
// Chaque sorte de capacité (« effet » dans CAPACITES) a sa propre façon de le savoir :
//  - un projectile : on lance un tir fantôme et on regarde s'il arrive jusqu'à la cible (tirPeutToucher dans tirs.js) ;
//  - une charge : on fait foncer un ennemi fantôme et on regarde s'il percute la cible (chargePeutToucher dans charge.js).
// Pour donner aux ennemis une autre sorte de capacité, il faudra ajouter sa règle ici (et la lancer dans activerCapacite).
function peutToucher(e, capacite, cible) {
  if (capacite.effet === "projectile") return tirPeutToucher(e, capacite, "ennemi", cible);
  if (capacite.effet === "charge") return chargePeutToucher(e, capacite, cible);
  return false;
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

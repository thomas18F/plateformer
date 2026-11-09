// =====================================================
//  Le renard : déplacement, saut, dangers, drapeau
// =====================================================

function creerJoueur(x, y) {
  return {
    x, y, l: 22, h: 30, vx: 0, vy: 0, dir: 1,
    auSol: false, coyote: 0, memoSaut: 0, anim: 0,
    dureeEcrasement: 0,
    dureeCharge: 0, distanceDashRestante: 0, directionDash: 1,
    ennemisTouchésParCharge: new Set(),
    pv: PV_JOUEUR, // points de vie
    delaiPics: 0,  // tant que c'est > 0, les pics ne blessent pas
    mort: false, timerMort: 0,
  };
}

function approcher(valeur, cible, pas) {
  return valeur < cible ? Math.min(valeur + pas, cible) : Math.max(valeur - pas, cible);
}

function majJoueur(dt) {
  const j = joueur;

  if (j.mort) {
    j.vy = Math.min(j.vy + GRAVITE * dt, CHUTE_MAX);
    j.y += j.vy * dt;
    j.timerMort -= dt;
    if (j.timerMort <= 0) finDeVie();
    return;
  }

  // Déplacement horizontal, sauf pendant le petit dash de charge.
  const sens = (touches.droite ? 1 : 0) - (touches.gauche ? 1 : 0);
  if (j.distanceDashRestante > 0) {
    j.vx = j.directionDash * Math.min(
      CAPACITES.find((c) => c.id === "charge").vitesseDash,
      j.distanceDashRestante / dt,
    );
  } else if (sens !== 0) {
    j.dir = sens;
    let accel = j.auSol ? ACCEL_SOL : ACCEL_AIR;
    if (j.vx * sens < 0) accel *= 2; // demi-tour plus nerveux
    j.vx = approcher(j.vx, sens * VITESSE_MARCHE, accel * dt);
  } else {
    j.vx = approcher(j.vx, 0, (j.auSol ? FRICTION_SOL : FRICTION_SOL * 0.25) * dt);
  }

  // Saut
  // - memoSaut : un appui un peu trop tôt avant d'atterrir compte quand même
  // - coyote : on peut encore sauter juste après avoir quitté le bord
  if (appuye.saut) j.memoSaut = 0.12;
  j.memoSaut -= dt;
  j.coyote -= dt;
  if (j.memoSaut > 0 && j.coyote > 0) {
    j.vy = -(FORCE_SAUT + Math.abs(j.vx) * 0.15); // on saute un peu plus haut en marchant
    j.memoSaut = 0;
    j.coyote = 0;
    sons.saut();
  }

  // Une capacité est activée une seule fois par appui sur sa touche.
  j.dureeEcrasement = Math.max(0, j.dureeEcrasement - dt);
  j.dureeCharge = Math.max(0, j.dureeCharge - dt);
  for (const attribution of CAPACITES_JOUEUR) {
    if (appuye[attribution.action]) {
      const capacite = CAPACITES.find((c) => c.id === attribution.capacite);
      if (!capacite) continue;
      if (capacite.type === "ecrasement") j.dureeEcrasement = capacite.duree;
      else if (capacite.type === "charge") {
        j.dureeCharge = capacite.duree;
        j.distanceDashRestante = capacite.distanceDash;
        j.directionDash = j.dir;
        j.ennemisTouchésParCharge.clear();
      }
      else activerCapacite(j, capacite, "joueur");
    }
  }

  // Gravité : plus forte si on relâche le saut, pour faire des petits sauts
  let g = GRAVITE;
  if (j.vy < 0 && !touches.saut) g *= 2.5;
  j.vy = Math.min(j.vy + g * dt, CHUTE_MAX);

  // Collisions avec le décor
  const basAvant = j.y + j.h;
  const xAvantDeplacement = j.x;
  const res = deplacer(j, dt);
  if (j.distanceDashRestante > 0) {
    j.distanceDashRestante = Math.max(0, j.distanceDashRestante - Math.abs(j.x - xAvantDeplacement));
    if (res.mur || j.distanceDashRestante === 0) {
      j.distanceDashRestante = 0;
      j.vx = 0;
    }
  }
  j.auSol = res.sol;
  if (j.auSol) j.coyote = 0.1;
  if (res.tete.length > 0) frapperBloc(blocLePlusProche(res.tete, j));

  j.anim += Math.abs(j.vx) * dt;

  // Dangers
  if (j.y > hauteurNiveau) return blesserJoueur(j.pv, true); // tomber dans un trou fait perdre tous les PV
  j.delaiPics = Math.max(0, j.delaiPics - dt);
  if (j.delaiPics === 0 && touchePics(j)) {
    j.delaiPics = DELAI_PICS;
    j.vy = -FORCE_SAUT * 0.7; // le renard rebondit hors des pics
    blesserJoueur(DEGATS_PICS);
    if (j.mort) return;
  }

  // Pièces
  for (const p of pieces) {
    if (chevauche(j, p)) {
      p.prise = true;
      nbPieces++;
      sons.piece();
    }
  }
  pieces = pieces.filter((p) => !p.prise);

  // Les dégâts de contact ne s'appliquent qu'avec la capacité correspondante.
  const tombait = j.vy > 0;
  for (const e of ennemis) {
    if (e.mort || !chevauche(j, e)) continue;
    const tombeSurLeDessus = tombait && basAvant <= e.y + 12;
    if (tombeSurLeDessus && j.dureeEcrasement > 0) {
      const capaciteEcrasement = CAPACITES.find((c) => c.id === "ecrasement");
      blesserEnnemi(e, capaciteEcrasement.degats);
      j.vy = touches.saut ? -FORCE_SAUT : -FORCE_SAUT * 0.6;
    } else if (j.dureeCharge > 0 && !tombeSurLeDessus) {
      if (!j.ennemisTouchésParCharge.has(e)) {
        const capaciteCharge = CAPACITES.find((c) => c.id === "charge");
        blesserEnnemi(e, capaciteCharge.degats);
        j.ennemisTouchésParCharge.add(e);
      }
    }
  }

  // Drapeau
  const mat = { x: drapeau.x, y: drapeau.haut, l: drapeau.l, h: drapeau.bas - drapeau.haut };
  if (chevauche(j, mat)) attraperDrapeau();
}

function blocLePlusProche(liste, j) {
  const centre = j.x + j.l / 2;
  const distance = (t) => Math.abs((t.c + 0.5) * TILE - centre);
  return liste.reduce((meilleur, t) => (distance(t) < distance(meilleur) ? t : meilleur));
}

function frapperBloc(t) {
  const type = grille[t.r][t.c];
  if (type === "?") {
    grille[t.r][t.c] = "U"; // bloc vide
    nbPieces++;
    effets.push({ type: "piece", x: t.c * TILE + TILE / 2, y: t.r * TILE, vy: -450, t: 0.45 });
    sons.piece();
  } else if (type === "B" || type === "U") {
    sons.bloc();
  }
  if (type === "B" || type === "?") rebonds[t.c + "," + t.r] = 0;
}

function touchePics(j) {
  const c1 = Math.floor(j.x / TILE), c2 = Math.floor((j.x + j.l - 0.01) / TILE);
  const r1 = Math.floor(j.y / TILE), r2 = Math.floor((j.y + j.h - 0.01) / TILE);
  for (let r = r1; r <= r2; r++) {
    for (let c = c1; c <= c2; c++) {
      const zone = { x: c * TILE + 4, y: r * TILE + 12, l: 24, h: 20 };
      if (tuileA(c, r) === "^" && chevauche(j, zone)) return true;
    }
  }
  return false;
}

// Retire des points de vie au renard ; la partie est perdue quand il n'en a plus.
// tombeDansLeVide choisit l'animation de mort (chute dans un trou ou petit saut).
function blesserJoueur(degats, tombeDansLeVide = false) {
  afficherDegats(joueur, degats, COULEUR_DEGATS_JOUEUR);
  joueur.pv -= degats;
  if (joueur.pv <= 0) mourir(tombeDansLeVide);
}

function mourir(tombeDansLeVide) {
  const j = joueur;
  if (j.mort) return;
  j.mort = true;
  j.vx = 0;
  j.vy = tombeDansLeVide ? 0 : -550;
  j.timerMort = tombeDansLeVide ? 1.2 : 2;
  sons.mort();
}

function finDeVie() {
  etat = "gameover";
}

function attraperDrapeau() {
  const j = joueur;
  j.vx = 0;
  j.vy = 0;
  j.dir = 1;
  j.x = drapeau.x - j.l;
  etat = "drapeau";
  sons.drapeau();
}

// Le renard et le fanion glissent le long du mât
function majDrapeau(dt) {
  const j = joueur;
  j.y = Math.min(j.y + 260 * dt, drapeau.bas - j.h);
  drapeau.drapY = Math.min(drapeau.drapY + 260 * dt, drapeau.bas - 34);
  if (j.y >= drapeau.bas - j.h && drapeau.drapY >= drapeau.bas - 34) {
    j.auSol = true;
    etat = "victoire";
    sons.victoire();
  }
}

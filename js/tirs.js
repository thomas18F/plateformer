// =====================================================
//  Les tirs du Pokémon et ceux des ennemis, tous dans la même liste.
//  Un tir file tout droit : à l'horizontale, vers le haut ou vers le bas (voir « direction » dans CAPACITES).
//  Le champ « camp » dit qui a tiré : "joueur" ou "ennemi".
// =====================================================

// D'où part le tir et dans quelle direction il file, selon la « direction » de son projectile :
//  - « avant » : de l'avant du tireur, à mi-hauteur, à l'horizontale dans le sens où il regarde ;
//  - « haut »  : du haut de sa tête, au milieu, tout droit vers le ciel ;
//  - « bas »   : de sous ses pieds, au milieu, tout droit vers le sol.
// dx, dy : de combien le tir avance sur chaque axe pour 1 px parcouru
//   dx = 1 vers la droite, -1 vers la gauche ; dy = -1 vers le haut, 1 vers le bas (sur le canvas, y grandit vers le bas)
function departDuTir(tireur, sens, direction) {
  const milieu = tireur.x + tireur.l / 2;
  if (direction === "haut") return { x: milieu, y: tireur.y, dx: 0, dy: -1 };
  if (direction === "bas") return { x: milieu, y: tireur.y + tireur.h, dx: 0, dy: 1 };
  return { x: sens > 0 ? tireur.x + tireur.l : tireur.x, y: tireur.y + tireur.h / 2, dx: sens, dy: 0 };
}

// Le sens dans lequel le tireur tire : celui où regarde le Pokémon, ou celui où marche l'ennemi
function sensDuTireur(tireur, camp) {
  return camp === "joueur" ? tireur.dir : sensEnnemi(tireur);
}

// Crée un tir pour le tireur (Pokémon ou ennemi) et l'ajoute au jeu
function creerTir(tireur, sens, camp, capacite) {
  tirs.push(nouveauTir(tireur, sens, camp, capacite));
}

// Un tir tout neuf, pas encore ajouté au jeu :
// creerTir l'ajoute, tirPeutToucher le fait avancer « pour de faux » pour savoir s'il toucherait.
function nouveauTir(tireur, sens, camp, capacite) {
  const projectile = capacite.projectile;
  return {
    ...departDuTir(tireur, sens, projectile.direction), // x, y, dx, dy
    camp,         // "joueur" ou "ennemi"
    forme: projectile.forme,
    couleur: projectile.couleur,
    rayon: projectile.rayon,
    longueur: projectile.longueur,   // pour un rectangle : sa taille dans le sens du tir…
    epaisseur: projectile.epaisseur, // …et en travers
    spectral: projectile.spectral,
    vitesse: projectile.vitesse, // px/s
    portee: projectile.portee,  // distance maximale (px)
    tireur,       // celui qui a tiré : son attaque compte dans les dégâts
    capacite,     // la capacité qui a tiré : son attaque, son type (pour l'efficacité) et son statut (brûlure…)
    parcouru: 0,  // distance déjà parcourue (px)
  };
}

// Le tir que le tireur lancerait maintenant avec cette capacité toucherait-il la cible, si elle restait immobile ?
// On crée un tir « fantôme » (il n'est pas ajouté au jeu) et on le fait avancer pas à pas jusqu'à sa portée,
// avec les mêmes règles que les vrais tirs dans majTirs : il s'arrête sur un bloc (sauf s'il est spectral),
// et il touche dès qu'il chevauche la cible.
// Tout vient de la fiche de la capacité (direction, taille, portée, spectral…) :
// un nouveau projectile n'a rien de plus à régler pour que les ennemis sachent quand le lancer.
const PAS_FANTOME = 4; // px : plus petit que les blocs, les Pokémon et les projectiles, pour que le fantôme ne passe à travers de rien
function tirPeutToucher(tireur, capacite, camp, cible) {
  const fantome = nouveauTir(tireur, sensDuTireur(tireur, camp), camp, capacite);
  while (fantome.parcouru < fantome.portee) {
    avancerTir(fantome, PAS_FANTOME);
    if (!fantome.spectral && tirToucheLeDecor(fantome)) return false;
    if (chevauche(hitboxTir(fantome), cible)) return true;
  }
  return false;
}

// Le Pokémon (ou un ennemi) lance une capacité :
//  - une charge : il s'arrête un instant puis fonce devant lui (voir charge.js) ;
//  - un projectile : un seul tir, ou toute une rafale si la capacité en a une
//    (« rafale » dans CAPACITES, comme balle graine). Le premier projectile part tout de suite,
//    les suivants sont tirés par majRafales, un toutes les « intervalle » secondes.
function activerCapacite(utilisateur, capacite, camp) {
  if (capacite.effet === "charge") {
    lancerCharge(utilisateur, capacite, sensDuTireur(utilisateur, camp));
    return;
  }
  tirer(utilisateur, capacite, camp);
  const rafale = capacite.rafale;
  if (rafale) {
    const nombre = rafale.min + Math.floor(Math.random() * (rafale.max - rafale.min + 1)); // entre min et max compris
    rafales.push({ tireur: utilisateur, capacite, camp, restants: nombre - 1, avantTir: rafale.intervalle });
  }
}

// Un projectile, tiré dans la direction où le Pokémon regarde à cet instant
// (ou vers le haut pour anti-air, vers le bas pour bombe beurk)
function tirer(utilisateur, capacite, camp) {
  creerTir(utilisateur, sensDuTireur(utilisateur, camp), camp, capacite);
  if (camp === "joueur") sons.tir();
  else sons.tirEnnemi();
}

// Les rafales en cours tirent leurs projectiles suivants, chacun depuis là où est le tireur à ce moment-là.
// Une rafale s'arrête quand elle a tout tiré, ou si son tireur est K.O.
function majRafales(dt) {
  for (const r of rafales) {
    if (r.tireur.mort) {
      r.restants = 0;
      continue;
    }
    r.avantTir -= dt;
    while (r.avantTir <= 0 && r.restants > 0) {
      tirer(r.tireur, r.capacite, r.camp);
      r.restants--;
      r.avantTir += r.capacite.rafale.intervalle;
    }
  }
  rafales = rafales.filter((r) => r.restants > 0);
}

// Fait avancer les tirs en ligne droite, et les retire :
//  - après leur portée,
//  - s'ils rencontrent un bloc (sauf s'ils sont spectraux),
//  - s'ils touchent leur cible : un ennemi pour un tir du Pokémon, le Pokémon pour un tir ennemi.
// Les tirs ne se touchent pas entre eux : ils se croisent.
function majTirs(dt) {
  for (const tir of tirs) {
    avancerTir(tir, tir.vitesse * dt);

    if (!tir.spectral && tirToucheLeDecor(tir)) {
      tir.arrete = true;
      continue;
    }

    if (tir.camp === "joueur") {
      const ennemi = ennemiTouchePar(tir);
      if (ennemi) {
        subirCapacite(ennemi, tir.capacite, tir.tireur);
        tir.arrete = true; // un tir ne blesse qu'un seul ennemi
      }
    } else if (etat === "jeu" && chevauche(hitboxTir(tir), joueur)) {
      // (pas si le Pokémon est arrivé au bout ou pendant la transition : il est invulnérable)
      subirCapacite(joueur, tir.capacite, tir.tireur);
      tir.arrete = true;
    }
  }
  tirs = tirs.filter((tir) => tir.parcouru < tir.portee && !tir.arrete);
}

// Fait avancer un tir de « distance » px en ligne droite, sans jamais dépasser sa portée (même sur la dernière image).
// Sert aux vrais tirs (majTirs) comme aux tirs fantômes (tirPeutToucher) : ils bougent donc exactement pareil.
function avancerTir(tir, distance) {
  const pas = Math.min(distance, tir.portee - tir.parcouru);
  tir.x += tir.dx * pas;
  tir.y += tir.dy * pas;
  tir.parcouru += pas;
}

// La hitbox d'un tir : un petit carré autour du dessin,
// ou pour un rectangle, le rectangle lui-même, couché pour un tir horizontal et debout pour un tir vertical.
function hitboxTir(tir) {
  if (tir.forme === "rectangle") {
    const horizontal = tir.dx !== 0;
    const l = horizontal ? tir.longueur : tir.epaisseur;
    const h = horizontal ? tir.epaisseur : tir.longueur;
    return { x: tir.x - l / 2, y: tir.y - h / 2, l, h };
  }
  return { x: tir.x - tir.rayon, y: tir.y - tir.rayon, l: tir.rayon * 2, h: tir.rayon * 2 };
}

// Le tir touche-t-il un bloc solide (un bloc qui a une hitbox) ?
// On réutilise la même fonction que pour les collisions du Pokémon et des ennemis.
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
    } else if (t.forme === "carre") {
      // le carré dessiné est exactement sa hitbox
      ctx.fillStyle = t.couleur;
      ctx.fillRect(t.x - r, t.y - r, r * 2, r * 2);
    } else if (t.forme === "rectangle") {
      // pareil : le rectangle dessiné est exactement sa hitbox
      const zone = hitboxTir(t);
      ctx.fillStyle = t.couleur;
      ctx.fillRect(zone.x, zone.y, zone.l, zone.h);
    } else {
      // La pointe du triangle regarde là où va le tir (dx, dy) ;
      // les deux autres coins sont derrière, de part et d'autre (px, py : perpendiculaire à dx, dy).
      const px = -t.dy, py = t.dx;
      ctx.fillStyle = t.couleur;
      triangle(
        t.x + t.dx * r, t.y + t.dy * r,
        t.x - t.dx * r + px * r, t.y - t.dy * r + py * r,
        t.x - t.dx * r - px * r, t.y - t.dy * r - py * r,
      );
    }
  }
}

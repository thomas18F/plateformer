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

// Crée un tir pour le tireur (Pokémon ou ennemi)
function creerTir(tireur, sens, camp, capacite) {
  const projectile = capacite.projectile;
  tirs.push({
    ...departDuTir(tireur, sens, projectile.direction), // x, y, dx, dy
    camp,         // "joueur" ou "ennemi"
    forme: projectile.forme,
    couleur: projectile.couleur,
    rayon: projectile.rayon,
    spectral: projectile.spectral,
    vitesse: projectile.vitesse, // px/s
    portee: projectile.portee,  // distance maximale (px)
    degats: projectile.degats,   // avant l'efficacité des types
    capacite,     // la capacité qui a tiré : son type (pour l'efficacité) et son statut (brûlure…)
    parcouru: 0,  // distance déjà parcourue (px)
  });
}

// Le Pokémon tire dans la direction où il regarde (ou vers le haut pour anti-air, vers le bas pour bombe beurk)
function activerCapacite(utilisateur, capacite, camp) {
  const sens = camp === "joueur" ? utilisateur.dir : sensEnnemi(utilisateur);
  creerTir(utilisateur, sens, camp, capacite);
  if (camp === "joueur") sons.tir();
  else sons.tirEnnemi();
}

// Fait avancer les tirs en ligne droite, et les retire :
//  - après leur portée,
//  - s'ils rencontrent un bloc (sauf s'ils sont spectraux),
//  - s'ils touchent leur cible : un ennemi pour un tir du Pokémon, le Pokémon pour un tir ennemi.
// Les tirs ne se touchent pas entre eux : ils se croisent.
function majTirs(dt) {
  for (const tir of tirs) {
    // on n'avance jamais plus loin que la portée, même sur la dernière image
    const pas = Math.min(tir.vitesse * dt, tir.portee - tir.parcouru);
    tir.x += tir.dx * pas;
    tir.y += tir.dy * pas;
    tir.parcouru += pas;

    if (!tir.spectral && tirToucheLeDecor(tir)) {
      tir.arrete = true;
      continue;
    }

    if (tir.camp === "joueur") {
      const ennemi = ennemiTouchePar(tir);
      if (ennemi) {
        subirCapacite(ennemi, tir.capacite, tir.degats);
        tir.arrete = true; // un tir ne blesse qu'un seul ennemi
      }
    } else if (etat === "jeu" && chevauche(hitboxTir(tir), joueur)) {
      // (pas si le Pokémon est arrivé au bout ou pendant la transition : il est invulnérable)
      subirCapacite(joueur, tir.capacite, tir.degats);
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

// =====================================================
//  La charge : le Pokémon (ou un ennemi) s'arrête un instant, puis fonce droit devant lui.
//  Tant qu'il fonce, il blesse ceux qu'il percute (une seule fois chacun).
//  Les réglages sont dans la capacité « charge » (CAPACITES, reglages.js).
//
//  Pendant une charge, celui qui charge a un champ « charge » :
//    capacite         : la capacité utilisée
//    direction        : 1 vers la droite, -1 vers la gauche (choisie au lancement, elle ne change plus)
//    preparation      : secondes d'arrêt qui restent avant de foncer
//    distanceRestante : px qu'il lui reste à parcourir en fonçant
//    touches          : ceux qu'il a déjà blessés pendant cette charge
//    finie            : true quand le dash est fini (au bout de sa distance, ou contre un mur)
//  Sinon, ce champ vaut null.
// =====================================================

// Lance une charge dans le sens donné. Rien ne se passe s'il est déjà en train de charger.
function lancerCharge(utilisateur, capacite, sens) {
  if (utilisateur.charge) return;
  utilisateur.charge = {
    capacite,
    direction: sens,
    preparation: capacite.preparation,
    distanceRestante: capacite.distanceDash,
    touches: new Set(),
    finie: false,
  };
  utilisateur.vx = 0; // il s'arrête tout de suite
}

// À chaque image, avant le déplacement : la charge décide de la vitesse horizontale.
// Pendant la préparation il reste sur place, ensuite il fonce (sans dépasser la distance qui lui reste).
// Renvoie true s'il est en train de charger : le reste du code ne doit alors pas toucher à sa vitesse horizontale.
function majCharge(utilisateur, dt) {
  if (utilisateur.charge?.finie) utilisateur.charge = null; // on attend l'image suivante pour l'effacer : voir suivreCharge
  const c = utilisateur.charge;
  if (!c) return false;
  if (c.preparation > 0) {
    c.preparation -= dt;
    utilisateur.vx = 0;
  } else {
    utilisateur.vx = c.direction * Math.min(c.capacite.vitesseDash, c.distanceRestante / dt);
  }
  return true;
}

// À chaque image, après le déplacement : compte la distance vraiment parcourue.
// Le dash s'arrête net au bout de sa distance, ou plus tôt s'il rencontre un mur.
// La charge reste là jusqu'à l'image suivante : ceux qu'il percute sur cette dernière image sont quand même touchés.
function suivreCharge(utilisateur, xAvantDeplacement, res) {
  const c = utilisateur.charge;
  if (!c || c.preparation > 0) return;
  c.distanceRestante -= Math.abs(utilisateur.x - xAvantDeplacement);
  if (res.mur || c.distanceRestante < 0.5) { // 0.5 px : les tout petits restes de calcul ne comptent pas
    c.finie = true;
    utilisateur.vx = 0;
  }
}

// Est-il en train de foncer ? (pas pendant la préparation : il ne blesse personne tant qu'il est à l'arrêt)
function chargeEnCours(utilisateur) {
  return !!utilisateur.charge && utilisateur.charge.preparation <= 0;
}

// Celui qui fonce percute la cible : elle subit la charge, une seule fois par charge.
// Ne fait rien s'il n'est pas en train de foncer.
function toucherParCharge(utilisateur, cible) {
  if (!chargeEnCours(utilisateur)) return;
  const c = utilisateur.charge;
  if (c.touches.has(cible)) return;
  c.touches.add(cible);
  subirCapacite(cible, c.capacite, utilisateur);
}

// La charge que l'ennemi lancerait maintenant percuterait-elle la cible, si elle restait immobile ?
// Comme pour les tirs (tirPeutToucher), on fait foncer un ennemi « fantôme » (une copie, pas ajoutée au jeu),
// avec exactement les mêmes fonctions que le vrai : il s'arrête contre un mur, et il peut tomber d'un bord.
// Le fantôme saute la préparation : pendant ce temps-là, l'ennemi reste sur place.
function chargePeutToucher(e, capacite, cible) {
  const fantome = { ...e, charge: null };
  lancerCharge(fantome, capacite, sensEnnemi(e));
  fantome.charge.preparation = 0;
  const dt = PAS_FANTOME / capacite.vitesseDash; // le temps qu'il met à avancer de PAS_FANTOME px
  while (!fantome.charge.finie) {
    majCharge(fantome, dt);
    const xAvant = fantome.x;
    const res = deplacerEnnemi(fantome, dt);
    suivreCharge(fantome, xAvant, res);
    if (chevauche(fantome, cible)) return true;
  }
  return false;
}

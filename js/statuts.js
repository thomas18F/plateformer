// =====================================================
//  Un Pokémon touché par une capacité, et les statuts (brûlure, poison…)
//  Les réglages des statuts sont dans STATUTS (reglages.js).
// =====================================================

// La cible (le Pokémon ou un ennemi) est touchée par une capacité :
// elle perd des PV selon ses types, puis la capacité peut lui retirer un type et lui donner un statut.
// degats : avant l'efficacité des types (pour un tir, ce sont ceux de son projectile).
function subirCapacite(cible, capacite, degats) {
  blesser(cible, degatsSelonTypes(degats, capacite.type, cible));
  retirerType(cible, capacite);
  tenterStatut(cible, capacite);
}

// Certaines capacités font perdre un type à la cible (« retireType » dans CAPACITES) :
// anti-air fait tomber un Pokémon de type vol, qui n'est plus de type vol.
// On ne change que la liste de cette cible : le POKEDEX, lui, ne bouge pas (voir creerEnnemi).
// Un Pokémon qui n'avait que ce type n'en a plus aucun : toutes les capacités lui font alors des dégâts normaux.
function retirerType(cible, capacite) {
  const type = capacite.retireType;
  if (!type || cible.mort || !cible.types.includes(type)) return;
  cible.types = cible.types.filter((t) => t !== type);
  ajouterTexte(cible.x + cible.l / 2, cible.y - 28, `Perd le type ${type} !`);
}

// Retire des PV à la cible, que ce soit le Pokémon ou un ennemi
function blesser(cible, degats, couleur) {
  if (cible === joueur) blesserJoueur(degats, false, couleur);
  else blesserEnnemi(cible, degats, couleur);
}

// La cible attrape le statut de la capacité, avec la chance indiquée (0.1 = 1 fois sur 10).
// Rien ne se passe si la capacité n'a pas de statut, si la cible est morte, si elle a déjà un statut
// ou si un de ses types l'en protège.
function tenterStatut(cible, capacite) {
  if (!capacite.statut || cible.mort || cible.statut) return;
  const regle = STATUTS[capacite.statut.nom];
  if (cible.types.some((type) => regle.immunites.includes(type))) return;
  if (Math.random() >= capacite.statut.chance) return;

  cible.statut = {
    nom: capacite.statut.nom,
    coupsRestants: Math.round(regle.duree / regle.intervalle), // nombre de fois où il va perdre des PV
    avantCoup: regle.intervalle,                                // secondes avant la prochaine perte de PV
  };
  // un peu plus haut que le « -5 » de l'attaque, pour ne pas le cacher
  ajouterTexte(cible.x + cible.l / 2, cible.y - 28, regle.texte, regle.couleur);
}

// À chaque image : la cible qui a un statut perd des PV de temps en temps, jusqu'à la fin du statut
function majStatut(cible, dt) {
  const s = cible.statut;
  if (!s) return;
  const regle = STATUTS[s.nom];
  s.avantCoup -= dt;
  if (s.avantCoup > 0) return;
  s.avantCoup += regle.intervalle;
  s.coupsRestants--;
  if (s.coupsRestants <= 0) cible.statut = null; // avant de blesser : s'il en meurt, il n'a plus de statut
  blesser(cible, regle.degats, regle.couleur);
}

// Des petites bulles de la couleur du statut montent le long des Pokémon qui en ont un
function dessinerStatuts() {
  for (const cible of [joueur, ...ennemis]) {
    if (!cible.statut || cible.mort) continue;
    ctx.fillStyle = STATUTS[cible.statut.nom].couleur;
    for (let i = 0; i < 3; i++) {
      const avance = (temps * 0.8 + i / 3) % 1; // de 0 (en bas) à 1 (en haut), puis ça recommence
      ctx.globalAlpha = 1 - avance;              // elle s'efface en montant
      ellipse(
        cible.x + cible.l * (0.2 + 0.3 * i) + Math.sin(temps * 6 + i * 2) * 2,
        cible.y + cible.h * (1 - avance),
        3, 3,
      );
    }
  }
  ctx.globalAlpha = 1;
}

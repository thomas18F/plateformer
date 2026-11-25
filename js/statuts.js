// =====================================================
//  Un Pokémon touché par une capacité, les statuts (brûlure, poison…) et le ralentissement (sécrétion)
//  Les réglages des statuts sont dans STATUTS (reglages.js).
// =====================================================

// La cible (le Pokémon ou un ennemi) est touchée par une capacité de l'attaquant :
// elle perd des PV (calculerDegats, sauf pour une capacité « sansDegats »),
// puis la capacité peut lui retirer un type, lui donner un statut et la ralentir.
// attaquant : celui qui a utilisé la capacité (pour un tir, celui qui a tiré).
function subirCapacite(cible, capacite, attaquant) {
  if (!capacite.sansDegats) blesser(cible, calculerDegats(attaquant, capacite, cible));
  retirerType(cible, capacite);
  tenterStatut(cible, capacite);
  ralentir(cible, capacite);
}

// Les dégâts d'une capacité :
//   (attaque de l'attaquant + attaque de la capacité − défense de la cible) × efficacité des types
// L'attaque et la défense viennent de leurs fiches du POKEDEX, l'efficacité des types de la cible telle qu'elle est maintenant.
// Arrondis à un nombre entier de PV, et au moins 1 PV (même si la défense est plus forte que l'attaque),
// sauf si la capacité n'a aucun effet sur la cible (×0).
function calculerDegats(attaquant, capacite, cible) {
  const multiplicateur = efficacite(capacite.type, cible);
  if (multiplicateur === 0) return 0;
  const avantTypes = attaquant.espece.attaque + capacite.attaque - cible.espece.defense;
  return Math.max(1, Math.round(avantTypes * multiplicateur));
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

// Certaines capacités ralentissent la cible (« ralentissement » dans CAPACITES) : sécrétion.
// Ça marche à chaque fois, quels que soient ses types, et ça ne compte pas comme un statut :
// un Pokémon brûlé ou empoisonné peut aussi être ralenti.
// S'il est touché alors qu'il est déjà ralenti, le ralentissement repart pour toute sa durée (il ne se cumule pas).
function ralentir(cible, capacite) {
  const regle = capacite.ralentissement;
  if (!regle || cible.mort) return;
  cible.ralentissement = { facteur: regle.facteur, tempsRestant: regle.duree };
  ajouterTexte(cible.x + cible.l / 2, cible.y - 28, "Ralenti !", COULEUR_RALENTISSEMENT);
}

// À chaque image : le ralentissement s'use, puis s'arrête au bout de sa durée
function majRalentissement(cible, dt) {
  const r = cible.ralentissement;
  if (!r) return;
  r.tempsRestant -= dt;
  if (r.tempsRestant <= 0) cible.ralentissement = null;
}

// Ce par quoi multiplier la vitesse de marche de la cible : 1 si elle n'est pas ralentie
function facteurVitesse(cible) {
  return cible.ralentissement ? cible.ralentissement.facteur : 1;
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

// Deux fils de sécrétion restent collés en travers des Pokémon ralentis
function dessinerRalentissements() {
  ctx.fillStyle = COULEUR_RALENTISSEMENT;
  ctx.globalAlpha = 0.7;
  for (const cible of [joueur, ...ennemis]) {
    if (!cible.ralentissement || cible.mort) continue;
    ctx.fillRect(cible.x, cible.y + cible.h * 0.4, cible.l, 2);
    ctx.fillRect(cible.x, cible.y + cible.h * 0.7, cible.l, 2);
  }
  ctx.globalAlpha = 1;
}

// =====================================================
//  Les types : une capacité fait plus ou moins de dégâts
//  selon les types de sa cible (table EFFICACITES, dans reglages.js)
// =====================================================

// Le multiplicateur d'une capacité de type « typeAttaque » contre une cible (joueur ou ennemi).
// Contre une cible à deux types, les deux multiplicateurs se multiplient (×2 et ×2 = ×4).
function efficacite(typeAttaque, cible) {
  let multiplicateur = 1;
  for (const typeCible of cible.types) {
    multiplicateur *= EFFICACITES[typeAttaque]?.[typeCible] ?? 1; // absent de la table : ×1
  }
  return multiplicateur;
}

// Un Pokémon de type vol flotte dans les airs : la gravité ne l'attire pas.
// On regarde ses types tels qu'ils sont maintenant : s'il perd son type vol (anti-air), il tombe.
// Ça ne vaut que pour les ennemis : le Pokémon du joueur tombe toujours, sinon il ne redescendrait pas de ses sauts.
function estVolant(pokemon) {
  return pokemon.types.includes("vol");
}

// Les dégâts d'une capacité de type « typeAttaque » contre une cible, une fois l'efficacité appliquée.
// Arrondis à un nombre entier de PV, et au moins 1 PV, sauf si la capacité n'a aucun effet (×0).
function degatsSelonTypes(degats, typeAttaque, cible) {
  const multiplicateur = efficacite(typeAttaque, cible);
  if (multiplicateur === 0) return 0;
  return Math.max(1, Math.round(degats * multiplicateur));
}

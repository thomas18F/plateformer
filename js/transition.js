// =====================================================
//  La transition entre deux niveaux : un cercle qui se referme sur le Pokémon
// =====================================================
//
// 1. fermeture : le noir part des bords de l'écran ; seul un rond autour du Pokémon reste visible,
//    et ce rond rapetisse jusqu'à ce que tout l'écran soit noir
// 2. l'écran est tout noir : on charge le niveau suivant (sorti par la droite) ou précédent (sorti par la gauche)
// 3. ouverture : le rond réapparaît sur le Pokémon et grandit jusqu'à montrer tout le nouveau niveau
// 4. le niveau commence
// Pendant tout ce temps, etat vaut "transition" : le niveau continue de bouger,
// mais le Pokémon n'obéit plus aux touches (main.js) et ne peut pas être blessé (blesserJoueur).

let phaseTransition = "fermeture"; // fermeture | ouverture
let avanceeTransition = 0;         // de 0 (début de la phase) à 1 (fin de la phase)
let sensTransition = 1;            // 1 : vers le niveau suivant, -1 : vers le niveau précédent

function demarrerTransition(sens) {
  etat = "transition";
  phaseTransition = "fermeture";
  avanceeTransition = 0;
  sensTransition = sens;
}

function majTransition(dt) {
  avanceeTransition += dt / DUREE_TRANSITION;
  if (avanceeTransition < 1) return;

  if (phaseTransition === "fermeture") {
    changerDeNiveau(sensTransition); // l'écran est tout noir : le changement de niveau ne se voit pas
    phaseTransition = "ouverture";
    avanceeTransition = 0;
  } else {
    etat = "jeu"; // le rond a disparu : le niveau commence pour de bon
  }
}

function dessinerTransition() {
  // Le centre du rond visible : le milieu du Pokémon, là où il est sur l'écran
  const cx = joueur.x + joueur.l / 2 - Math.round(camera.x);
  const cy = joueur.y + joueur.h / 2;
  // Le rayon qui laisse voir tout l'écran : la distance jusqu'au coin de l'écran le plus éloigné
  const rayonMax = Math.hypot(Math.max(cx, W - cx), Math.max(cy, H - cy));

  // noir : 0 = rien n'est caché, 1 = tout l'écran est noir.
  // Il augmente pendant la fermeture et diminue pendant l'ouverture.
  // t * t * (3 - 2 * t) : le cercle démarre doucement et ralentit à la fin, au lieu d'aller à vitesse constante.
  const t = phaseTransition === "fermeture" ? avanceeTransition : 1 - avanceeTransition;
  const noir = t * t * (3 - 2 * t);
  const rayon = rayonMax * (1 - noir);

  // On peint tout l'écran en noir, sauf un trou rond autour du Pokémon.
  // « evenodd » : la partie couverte à la fois par le rectangle et par le rond (le trou) n'est pas peinte.
  ctx.fillStyle = "#000";
  ctx.beginPath();
  ctx.rect(0, 0, W, H);
  ctx.arc(cx, cy, rayon, 0, Math.PI * 2);
  ctx.fill("evenodd");
}

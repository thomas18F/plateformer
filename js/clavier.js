// =====================================================
//  Le clavier
// =====================================================

const touches = {};   // touches actuellement enfoncées
let appuye = {};      // touches qui viennent juste d'être enfoncées

function actionDeLaTouche(e) {
  switch (e.key.toLowerCase()) {
    case "arrowleft": return "gauche";
    case "arrowright": return "droite";
    case "arrowup": case " ": return "saut";
    case "x": return "tir";
    case "enter": return "entree";
    case "p": case "escape": return "pause";
  }
  return null;
}

window.addEventListener("keydown", (e) => {
  if (e.ctrlKey || e.metaKey || e.altKey) return;
  const action = actionDeLaTouche(e);
  if (!action) return;
  e.preventDefault();
  if (!touches[action]) appuye[action] = true;
  touches[action] = true;
  initAudio();
});

window.addEventListener("keyup", (e) => {
  const action = actionDeLaTouche(e);
  if (action) touches[action] = false;
});

// Si la fenêtre perd le focus : on relâche tout et on met en pause
window.addEventListener("blur", () => {
  for (const k in touches) touches[k] = false;
  if (etat === "jeu") etat = "pause";
});

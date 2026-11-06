// =====================================================
//  Le canvas, le zoom et des petits outils de dessin
// =====================================================

const canvas = document.getElementById("jeu");
const ctx = canvas.getContext("2d");

// Le jeu raisonne toujours sur un écran de 960 × 544 « pixels du jeu »...
const W = 960;
const H = 544;
// ...mais le canvas a ZOOM fois plus de vrais pixels, pour un dessin plus net.
// Essaie ZOOM = 1 pour comparer : le jeu est identique, seulement moins fin.
const ZOOM = 2;
canvas.width = W * ZOOM;   // 1920
canvas.height = H * ZOOM;  // 1088

function ellipse(x, y, rx, ry, rotation = 0) {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, rotation, 0, Math.PI * 2);
  ctx.fill();
}

function triangle(x1, y1, x2, y2, x3, y3) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.lineTo(x3, y3);
  ctx.closePath();
  ctx.fill();
}

function texteContour(texte, x, y, couleur = "#fff", epaisseur = 4) {
  ctx.lineJoin = "round";
  ctx.lineWidth = epaisseur;
  ctx.strokeStyle = "rgba(20, 25, 40, 0.9)";
  ctx.strokeText(texte, x, y);
  ctx.fillStyle = couleur;
  ctx.fillText(texte, x, y);
}

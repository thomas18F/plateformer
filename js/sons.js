// =====================================================
//  Les sons (générés, pas de fichiers)
// =====================================================

let audio = null;

function initAudio() {
  if (!audio) {
    try { audio = new AudioContext(); } catch { audio = null; }
  }
  if (audio && audio.state === "suspended") audio.resume();
}

function son(freqDebut, freqFin, duree, type = "square", volume = 0.07) {
  if (!audio) return;
  const t = audio.currentTime;
  const osc = audio.createOscillator();
  const gain = audio.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freqDebut, t);
  osc.frequency.exponentialRampToValueAtTime(freqFin, t + duree);
  gain.gain.setValueAtTime(volume, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + duree);
  osc.connect(gain).connect(audio.destination);
  osc.start(t);
  osc.stop(t + duree);
}

const sons = {
  saut: () => son(280, 560, 0.15),
  tir: () => son(900, 300, 0.1, "square", 0.05),
  tirEnnemi: () => son(380, 140, 0.18, "triangle", 0.09),
  piece: () => { son(990, 990, 0.07); setTimeout(() => son(1320, 1320, 0.2), 70); },
  ecrase: () => son(420, 90, 0.15, "triangle", 0.15),
  bloc: () => son(160, 80, 0.08, "square", 0.08),
  mort: () => son(520, 60, 0.9, "sawtooth", 0.06),
  drapeau: () => son(900, 250, 0.6, "triangle", 0.1),
  victoire: () => [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => son(f, f, 0.25), i * 130)),
};

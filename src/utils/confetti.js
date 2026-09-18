import confetti from 'canvas-confetti';

export function fireCelebration() {
  try {
    const end = Date.now() + 1500;
    const colors = ['#ff8bb7', '#b892ff', '#5fe0b9', '#ffb570', '#7cd4fd'];

    (function frame() {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.7 },
        colors: colors
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.7 },
        colors: colors
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();
  } catch {}
}

export function fireLittleBurst(x = 0.5, y = 0.5) {
  try {
    confetti({
      particleCount: 25,
      spread: 60,
      origin: { x, y },
      colors: ['#ff8bb7', '#5fe0b9', '#ffb570'],
      startVelocity: 25,
      ticks: 80
    });
  } catch {}
}

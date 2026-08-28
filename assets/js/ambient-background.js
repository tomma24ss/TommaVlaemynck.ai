/**
 * Subtle ambient dots across the full page — lighter than the hero network.
 */
(function () {
  const canvas = document.getElementById('ambient-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const COLOR = '0, 217, 255';
  const PARTICLE_COUNT = 14;
  const CONNECT_DIST = 110;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let width = 0;
  let height = 0;
  let particles = [];

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    if (width === 0 || height === 0) return;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    if (particles.length === 0) initParticles();
  }

  function initParticles() {
    particles = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: 0.12 * (Math.random() - 0.5),
        vy: 0.12 * (Math.random() - 0.5),
        radius: 1 + Math.random() * 1.2,
        phase: Math.random() * Math.PI * 2,
      });
    }
  }

  function updateParticles() {
    particles.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0 || p.x > width) p.vx *= -1;
      if (p.y < 0 || p.y > height) p.vy *= -1;

      p.x = Math.max(0, Math.min(width, p.x));
      p.y = Math.max(0, Math.min(height, p.y));
    });
  }

  function drawFrame() {
    ctx.clearRect(0, 0, width, height);

    for (let a = 0; a < particles.length; a++) {
      for (let b = a + 1; b < particles.length; b++) {
        const p = particles[a];
        const q = particles[b];
        const dx = q.x - p.x;
        const dy = q.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist >= CONNECT_DIST) continue;

        const fade = 1 - dist / CONNECT_DIST;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(q.x, q.y);
        ctx.strokeStyle = `rgba(${COLOR}, ${0.03 + fade * 0.05})`;
        ctx.lineWidth = 0.6;
        ctx.stroke();
      }
    }

    particles.forEach((p) => {
      const twinkle = 0.55 + 0.45 * Math.sin(p.phase);
      const alpha = 0.08 + twinkle * 0.1;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius * 2.2, 0, Math.PI * 2);
      const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius * 2.2);
      glow.addColorStop(0, `rgba(${COLOR}, ${alpha * 0.35})`);
      glow.addColorStop(1, `rgba(${COLOR}, 0)`);
      ctx.fillStyle = glow;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${COLOR}, ${alpha})`;
      ctx.fill();

      if (!reducedMotion) p.phase += 0.012;
    });
  }

  function loop() {
    if (!reducedMotion) updateParticles();
    drawFrame();

    if (!reducedMotion && document.visibilityState === 'visible') {
      requestAnimationFrame(loop);
    }
  }

  function start() {
    resize();
    if (width === 0 || height === 0) {
      requestAnimationFrame(start);
      return;
    }

    window.addEventListener('resize', resize);
    document.addEventListener('visibilitychange', () => {
      if (!reducedMotion && document.visibilityState === 'visible') {
        requestAnimationFrame(loop);
      }
    });

    if (reducedMotion) drawFrame();
    else loop();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();

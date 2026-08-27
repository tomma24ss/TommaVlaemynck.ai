/**
 * 3D particle network — free-flowing nodes with depth, fading cross-layer connections.
 */
(function () {
  const canvas = document.getElementById('graph-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const COLOR = '0, 217, 255';
  const COLOR_DEEP = '0, 134, 193';
  const FOCAL = 820;
  const DEPTH = 1400;
  const CONNECT_DIST = 155;
  const MOUSE_RADIUS = 220;
  const PARTICLE_COUNT = 88;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let width = 0;
  let height = 0;
  let mouseX = -1000;
  let mouseY = -1000;
  let smoothMouseX = -1000;
  let smoothMouseY = -1000;
  let particles = [];
  let projected = [];

  function resize() {
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    width = rect.width;
    height = rect.height;
    if (width === 0 || height === 0) return;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    if (particles.length === 0) initParticles();
  }

  function initParticles() {
    particles = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const depthBias = Math.pow(Math.random(), 1.4);
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        z: depthBias * DEPTH,
        vx: 0.55 * (Math.random() - 0.5),
        vy: 0.55 * (Math.random() - 0.5),
        vz: 0.35 * (Math.random() - 0.5),
        radius: 1.2 + Math.random() * 1.6,
      });
    }
  }

  function project(p) {
    const scale = FOCAL / (FOCAL + p.z);
    return {
      x: width * 0.5 + (p.x - width * 0.5) * scale,
      y: height * 0.5 + (p.y - height * 0.5) * scale,
      scale,
      z: p.z,
    };
  }

  function trackMouse(e) {
    const hero = document.getElementById('hero');
    if (!hero) return;
    const rect = hero.getBoundingClientRect();
    if (
      e.clientX < rect.left || e.clientX > rect.right ||
      e.clientY < rect.top || e.clientY > rect.bottom
    ) {
      mouseX = -1000;
      mouseY = -1000;
      return;
    }
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
  }

  function updateParticles() {
    const cx = width * 0.5;
    const cy = height * 0.5;
    const drift = 0.00018;

    particles.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.z += p.vz;

      if (p.x < 0 || p.x > width) p.vx *= -1;
      if (p.y < 0 || p.y > height) p.vy *= -1;
      if (p.z < 40 || p.z > DEPTH) p.vz *= -1;

      p.x = Math.max(0, Math.min(width, p.x));
      p.y = Math.max(0, Math.min(height, p.y));
      p.z = Math.max(40, Math.min(DEPTH, p.z));

      const dx = p.x - cx;
      const dy = p.y - cy;
      const angle = drift * (1.1 - p.z / DEPTH);
      p.x = cx + dx * Math.cos(angle) - dy * Math.sin(angle);
      p.y = cy + dx * Math.sin(angle) + dy * Math.cos(angle);
    });
  }

  function drawFrame() {
    ctx.clearRect(0, 0, width, height);

    smoothMouseX += (mouseX - smoothMouseX) * 0.1;
    smoothMouseY += (mouseY - smoothMouseY) * 0.1;

    if (!reducedMotion) updateParticles();

    projected = particles.map((p, i) => ({ i, ...project(p) }));
    projected.sort((a, b) => b.z - a.z);

    for (let a = 0; a < projected.length; a++) {
      for (let b = a + 1; b < projected.length; b++) {
        const p = projected[a];
        const q = projected[b];
        const dx = q.x - p.x;
        const dy = q.y - p.y;
        const screenDist = Math.sqrt(dx * dx + dy * dy);
        const avgScale = (p.scale + q.scale) * 0.5;
        const maxDist = CONNECT_DIST * avgScale;

        if (screenDist >= maxDist) continue;

        const zDiff = Math.abs(p.z - q.z);
        const depthBlend = 1 - zDiff / DEPTH;
        const distFade = 1 - screenDist / maxDist;
        const midX = (p.x + q.x) * 0.5;
        const midY = (p.y + q.y) * 0.5;
        const midMouse = Math.hypot(midX - smoothMouseX, midY - smoothMouseY);
        const lineGlow = Math.max(0, 1 - midMouse / MOUSE_RADIUS);

        const alpha =
          distFade * depthBlend * avgScale * (0.1 + 0.22 * depthBlend) +
          lineGlow * 0.35 * avgScale;

        if (alpha < 0.02) continue;

        const useDeep = depthBlend < 0.45;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(q.x, q.y);
        ctx.strokeStyle = `rgba(${useDeep ? COLOR_DEEP : COLOR}, ${Math.min(alpha, 0.55)})`;
        ctx.lineWidth = (0.5 + avgScale * 0.8) * (1 + lineGlow * 0.8);
        ctx.stroke();
      }
    }

    projected.forEach((p) => {
      const particle = particles[p.i];
      const mouseDist = Math.hypot(p.x - smoothMouseX, p.y - smoothMouseY);
      const mouseGlow = Math.max(0, 1 - mouseDist / MOUSE_RADIUS);
      const depthAlpha = 0.12 + 0.55 * p.scale;
      const drawRadius = particle.radius * p.scale * (1.8 + mouseGlow * 1.2);
      const nodeAlpha = depthAlpha + mouseGlow * 0.35;

      if (mouseGlow > 0.08) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, drawRadius * 2.4, 0, Math.PI * 2);
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, drawRadius * 2.4);
        grad.addColorStop(0, `rgba(${COLOR}, ${0.22 * mouseGlow * p.scale})`);
        grad.addColorStop(1, `rgba(${COLOR}, 0)`);
        ctx.fillStyle = grad;
        ctx.fill();
      }

      ctx.beginPath();
      ctx.arc(p.x, p.y, drawRadius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${p.scale < 0.55 ? COLOR_DEEP : COLOR}, ${Math.min(nodeAlpha, 0.92)})`;
      ctx.fill();
    });
  }

  function loop() {
    drawFrame();
    requestAnimationFrame(loop);
  }

  function start() {
    resize();
    if (width === 0 || height === 0) {
      requestAnimationFrame(start);
      return;
    }

    window.addEventListener('resize', resize);
    document.addEventListener('mousemove', trackMouse, { passive: true });
    document.addEventListener('mouseleave', () => {
      mouseX = -1000;
      mouseY = -1000;
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

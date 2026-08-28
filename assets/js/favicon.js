/**
 * Animated tab icon — letter T formed by pulsing connected dots.
 */
(function () {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let link = document.querySelector("link[rel='icon'][data-dynamic]");
  if (!link) {
    link = document.createElement('link');
    link.rel = 'icon';
    link.type = 'image/png';
    link.setAttribute('data-dynamic', 'true');
    document.head.appendChild(link);
  }

  const size = 32;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const nodes = [
    { x: 9, y: 8, r: 1.75 },
    { x: 13, y: 8, r: 1.75 },
    { x: 16, y: 8, r: 2.25 },
    { x: 19, y: 8, r: 1.75 },
    { x: 23, y: 8, r: 1.75 },
    { x: 16, y: 12, r: 1.75 },
    { x: 16, y: 16, r: 1.75 },
    { x: 16, y: 20, r: 1.75 },
    { x: 16, y: 23, r: 1.75 },
  ];

  const edges = [
    [0, 1], [1, 2], [2, 3], [3, 4],
    [2, 5], [5, 6], [6, 7], [7, 8],
  ];

  let frame = 0;

  function drawNode(node, intensity) {
    const glow = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, node.r * 3.5);
    glow.addColorStop(0, `rgba(0, 217, 255, ${intensity * 0.55})`);
    glow.addColorStop(1, 'rgba(0, 217, 255, 0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(node.x, node.y, node.r * 3.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = `rgba(0, 217, 255, ${0.55 + intensity * 0.45})`;
    ctx.beginPath();
    ctx.arc(node.x, node.y, node.r, 0, Math.PI * 2);
    ctx.fill();
  }

  function render() {
    ctx.clearRect(0, 0, size, size);

    ctx.fillStyle = '#0a0e14';
    ctx.beginPath();
    ctx.roundRect(0, 0, size, size, 6);
    ctx.fill();

    edges.forEach(([from, to], index) => {
      const pulse = 0.2 + 0.8 * (0.5 + 0.5 * Math.sin(frame * 0.07 - index * 0.9));
      ctx.strokeStyle = `rgba(0, 217, 255, ${0.1 + pulse * 0.35})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(nodes[from].x, nodes[from].y);
      ctx.lineTo(nodes[to].x, nodes[to].y);
      ctx.stroke();
    });

    nodes.forEach((node, index) => {
      const junctionBoost = index === 2 ? 0.12 : 0;
      const intensity = 0.4 + 0.6 * (0.5 + 0.5 * Math.sin(frame * 0.07 - index * 0.75)) + junctionBoost;
      drawNode(node, Math.min(intensity, 1));
    });

    link.href = canvas.toDataURL('image/png');
    frame += 1;

    if (!reducedMotion && document.visibilityState === 'visible') {
      requestAnimationFrame(render);
    }
  }

  render();

  if (!reducedMotion) {
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        requestAnimationFrame(render);
      }
    });
  }
})();

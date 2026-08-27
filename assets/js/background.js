/**
 * Knowledge Graph Background
 * Animated node-edge network with data pulses — personal hub nodes for expertise areas.
 */
(function () {
  const canvas = document.getElementById('graph-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const COLORS = {
    accent: '0, 217, 255',
    accentDeep: '0, 134, 193',
    hub: '0, 217, 255',
  };

  const HUBS = [
    { label: 'Data', x: 0.12, y: 0.32 },
    { label: 'AI', x: 0.88, y: 0.26 },
    { label: 'ML', x: 0.78, y: 0.78 },
    { label: 'Auto', x: 0.15, y: 0.72 },
    { label: 'Vision', x: 0.85, y: 0.55 },
  ];

  const CONFIG = {
    nodeCount: 58,
    connectDist: 140,
    hubConnectDist: 200,
    hubPull: 0.018,
    mouseRadius: 220,
    pulseSpeed: 0.012,
    maxPulses: 24,
  };

  let width = 0;
  let height = 0;
  let mouseX = -1000;
  let mouseY = -1000;
  let smoothMouseX = -1000;
  let smoothMouseY = -1000;
  let nodes = [];
  let pulses = [];
  let reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function resize() {
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    width = rect.width;
    height = rect.height;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    initNodes();
  }

  function initNodes() {
    nodes = [];
    pulses = [];

    HUBS.forEach((hub, i) => {
      nodes.push({
        x: hub.x * width,
        y: hub.y * height,
        vx: 0,
        vy: 0,
        radius: 5,
        baseRadius: 5,
        isHub: true,
        label: hub.label,
        hubIndex: i,
        phase: Math.random() * Math.PI * 2,
      });
    });

    for (let i = 0; i < CONFIG.nodeCount; i++) {
      const nearestHub = HUBS[Math.floor(Math.random() * HUBS.length)];
      const angle = Math.random() * Math.PI * 2;
      const dist = 40 + Math.random() * 180;
      nodes.push({
        x: nearestHub.x * width + Math.cos(angle) * dist,
        y: nearestHub.y * height + Math.sin(angle) * dist,
        vx: (Math.random() - 0.5) * 0.9,
        vy: (Math.random() - 0.5) * 0.9,
        radius: 1.2 + Math.random() * 1.8,
        baseRadius: 1.2 + Math.random() * 1.8,
        isHub: false,
        parentHub: nearestHub.label,
        phase: Math.random() * Math.PI * 2,
      });
    }
  }

  function spawnPulse(from, to) {
    if (pulses.length >= CONFIG.maxPulses) return;
    if (Math.random() > 0.35) return;
    pulses.push({
      from,
      to,
      t: 0,
      speed: CONFIG.pulseSpeed + Math.random() * 0.008,
    });
  }

  function getConnections() {
    const connections = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i];
        const b = nodes[j];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const maxDist = (a.isHub || b.isHub) ? CONFIG.hubConnectDist : CONFIG.connectDist;
        if (dist < maxDist) {
          connections.push({ a, b, dist, maxDist });
        }
      }
    }
    return connections;
  }

  function drawStatic() {
    const connections = getConnections();
    connections.forEach(({ a, b, dist, maxDist }) => {
      const alpha = 0.15 * (1 - dist / maxDist);
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.strokeStyle = `rgba(${COLORS.accent}, ${alpha})`;
      ctx.lineWidth = 1;
      ctx.stroke();
    });

    nodes.forEach((node) => {
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.isHub ? 5 : node.radius, 0, Math.PI * 2);
      ctx.fillStyle = node.isHub
        ? `rgba(${COLORS.hub}, 0.85)`
        : `rgba(${COLORS.accent}, 0.5)`;
      ctx.fill();

      if (node.isHub) {
        ctx.font = '600 11px Inter, system-ui, sans-serif';
        ctx.fillStyle = `rgba(${COLORS.accent}, 0.9)`;
        ctx.textAlign = 'center';
        ctx.fillText(node.label, node.x, node.y - 14);
      }
    });
  }

  function update() {
    smoothMouseX += (mouseX - smoothMouseX) * 0.08;
    smoothMouseY += (mouseY - smoothMouseY) * 0.08;

    nodes.forEach((node) => {
      if (node.isHub) {
        node.phase += 0.02;
        node.radius = node.baseRadius + Math.sin(node.phase) * 1.2;
        return;
      }

      HUBS.forEach((hub, i) => {
        if (node.parentHub !== hub.label) return;
        const hx = hub.x * width;
        const hy = hub.y * height;
        const dx = hx - node.x;
        const dy = hy - node.y;
        node.vx += dx * CONFIG.hubPull * 0.3;
        node.vy += dy * CONFIG.hubPull * 0.3;
      });

      const mdx = smoothMouseX - node.x;
      const mdy = smoothMouseY - node.y;
      const mDist = Math.sqrt(mdx * mdx + mdy * mdy);
      if (mDist < CONFIG.mouseRadius && mDist > 0) {
        const force = (1 - mDist / CONFIG.mouseRadius) * 0.04;
        node.vx += (mdx / mDist) * force;
        node.vy += (mdy / mDist) * force;
      }

      node.vx *= 0.992;
      node.vy *= 0.992;
      node.x += node.vx;
      node.y += node.vy;

      if (node.x < 0 || node.x > width) node.vx *= -1;
      if (node.y < 0 || node.y > height) node.vy *= -1;
      node.x = Math.max(0, Math.min(width, node.x));
      node.y = Math.max(0, Math.min(height, node.y));

      node.phase += 0.03;
      const mouseGlow = mDist < CONFIG.mouseRadius
        ? (1 - mDist / CONFIG.mouseRadius) * 2
        : 0;
      node.radius = node.baseRadius + Math.sin(node.phase) * 0.4 + mouseGlow;
    });

    pulses = pulses.filter((p) => {
      p.t += p.speed;
      return p.t <= 1;
    });
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);

    const connections = getConnections();

    connections.forEach(({ a, b, dist, maxDist }) => {
      const midX = (a.x + b.x) / 2;
      const midY = (a.y + b.y) / 2;
      const mdx = midX - smoothMouseX;
      const mdy = midY - smoothMouseY;
      const mDist = Math.sqrt(mdx * mdx + mdy * mdy);
      const mouseBoost = mDist < CONFIG.mouseRadius
        ? (1 - mDist / CONFIG.mouseRadius) * 0.5
        : 0;

      const alpha = (0.12 + mouseBoost) * (1 - dist / maxDist);
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.strokeStyle = `rgba(${COLORS.accent}, ${alpha})`;
      ctx.lineWidth = 1 + mouseBoost * 1.5;
      ctx.stroke();

      if (!reducedMotion && Math.random() < 0.002) spawnPulse(a, b);
    });

    pulses.forEach((pulse) => {
      const x = pulse.from.x + (pulse.to.x - pulse.from.x) * pulse.t;
      const y = pulse.from.y + (pulse.to.y - pulse.from.y) * pulse.t;
      const fade = Math.sin(pulse.t * Math.PI);

      ctx.beginPath();
      ctx.arc(x, y, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${COLORS.accent}, ${0.9 * fade})`;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(x, y, 6, 0, Math.PI * 2);
      const grad = ctx.createRadialGradient(x, y, 0, x, y, 6);
      grad.addColorStop(0, `rgba(${COLORS.accent}, ${0.4 * fade})`);
      grad.addColorStop(1, `rgba(${COLORS.accent}, 0)`);
      ctx.fillStyle = grad;
      ctx.fill();
    });

    nodes.forEach((node) => {
      const mdx = node.x - smoothMouseX;
      const mdy = node.y - smoothMouseY;
      const mDist = Math.sqrt(mdx * mdx + mdy * mdy);
      const mouseGlow = mDist < CONFIG.mouseRadius
        ? (1 - mDist / CONFIG.mouseRadius)
        : 0;

      if (mouseGlow > 0.1) {
        const glowR = node.radius * (node.isHub ? 4 : 3) * (1 + mouseGlow);
        ctx.beginPath();
        ctx.arc(node.x, node.y, glowR, 0, Math.PI * 2);
        const grad = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, glowR);
        grad.addColorStop(0, `rgba(${COLORS.accent}, ${0.25 * mouseGlow})`);
        grad.addColorStop(1, `rgba(${COLORS.accent}, 0)`);
        ctx.fillStyle = grad;
        ctx.fill();
      }

      ctx.beginPath();
      ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
      const nodeAlpha = node.isHub ? 0.9 : 0.45 + mouseGlow * 0.4;
      ctx.fillStyle = `rgba(${COLORS.accent}, ${nodeAlpha})`;
      ctx.fill();

      if (node.isHub) {
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius + 3, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${COLORS.accentDeep}, 0.4)`;
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.font = '600 11px Inter, system-ui, sans-serif';
        ctx.fillStyle = `rgba(255, 255, 255, ${0.7 + mouseGlow * 0.3})`;
        ctx.textAlign = 'center';
        ctx.fillText(node.label, node.x, node.y - 16);
      }
    });
  }

  function loop() {
    if (!reducedMotion) update();
    draw();
    requestAnimationFrame(loop);
  }

  resize();
  window.addEventListener('resize', resize);

  canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
  });

  canvas.addEventListener('mouseleave', () => {
    mouseX = -1000;
    mouseY = -1000;
  });

  if (reducedMotion) {
    drawStatic();
  } else {
    loop();
  }
})();

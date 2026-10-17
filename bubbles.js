(function () {
  var canvas = document.getElementById('bubbles');
  if (!canvas || !canvas.getContext) return;
  var ctx = canvas.getContext('2d');
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var w = 0, h = 0, dpr = Math.max(1, window.devicePixelRatio || 1);
  var bubbles = [];
  var color = '#8FB4D6';

  function readColor() {
    var c = getComputedStyle(document.documentElement).getPropertyValue('--bubble').trim();
    if (c) color = c;
  }
  function resize() {
    var r = canvas.getBoundingClientRect();
    w = r.width; h = r.height;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  function spawn(initial) {
    var max = 6 + Math.random() * 22;
    return {
      x: Math.random() * w,
      y: initial ? Math.random() * h : h + 10,
      r: initial ? Math.random() * max : 0.5,
      max: max,
      vy: 0.15 + Math.random() * 0.35,
      drift: (Math.random() - 0.5) * 0.25,
      pop: 0
    };
  }
  function init() {
    readColor(); resize();
    var n = Math.max(10, Math.round(w / 45));
    bubbles = [];
    for (var i = 0; i < n; i++) bubbles.push(spawn(true));
  }
  function draw() {
    ctx.clearRect(0, 0, w, h);
    ctx.strokeStyle = color;
    for (var i = 0; i < bubbles.length; i++) {
      var b = bubbles[i];
      if (b.pop > 0) {
        ctx.globalAlpha = Math.max(0, 0.45 * (1 - b.pop / 14));
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.max + b.pop * 1.4, 0, Math.PI * 2);
        ctx.setLineDash([2, 5]);
        ctx.stroke();
        ctx.setLineDash([]);
      } else {
        ctx.globalAlpha = 0.18 + 0.3 * (b.r / b.max);
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
    ctx.globalAlpha = 1;
  }
  function step() {
    for (var i = 0; i < bubbles.length; i++) {
      var b = bubbles[i];
      if (b.pop > 0) {
        b.pop++;
        if (b.pop > 14) bubbles[i] = spawn(false);
        continue;
      }
      b.y -= b.vy; b.x += b.drift;
      if (b.r < b.max) b.r += 0.06;
      else if (Math.random() < 0.006) b.pop = 1;
      if (b.y < -b.max) bubbles[i] = spawn(false);
    }
    draw();
    requestAnimationFrame(step);
  }
  init();
  draw();
  window.addEventListener('resize', function () { init(); draw(); });
  if (window.matchMedia) {
    var mq = window.matchMedia('(prefers-color-scheme: dark)');
    var onScheme = function () { readColor(); draw(); };
    if (mq.addEventListener) mq.addEventListener('change', onScheme);
  }
  new MutationObserver(function () { readColor(); draw(); })
    .observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  if (!reduce) requestAnimationFrame(step);
})();

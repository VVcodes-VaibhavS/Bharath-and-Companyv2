/**
 * ================================================================
 *  BHARATH & COMPANIES — Ultra-Premium Website
 *  script.js — 55+ Futuristic Animations & Interactions
 * ================================================================
 */
'use strict';

/* ── GLOBALS ────────────────────────────────────────────────── */
const IS_TOUCH  = window.matchMedia('(pointer:coarse)').matches;
const lerp      = (a, b, t) => a + (b - a) * t;
const clamp     = (v, lo, hi) => Math.min(Math.max(v, lo), hi);
const raf       = requestAnimationFrame.bind(window);
let   lastY     = 0;

/* ════════════════════════════════════════════════════════════════
   1. PRELOADER — cinematic reveal with percentage counter
════════════════════════════════════════════════════════════════ */
function initPreloader() {
  const pre  = document.getElementById('preloader');
  if (!pre) return;

  // fake progress to ~95% over 2.2s, then snap to 100% and dismiss
  let pct = 0;
  const tick = setInterval(() => {
    pct = Math.min(pct + Math.random() * 6 + 2, 95);
  }, 80);

  window.addEventListener('load', () => {
    clearInterval(tick);
    pct = 100;
    setTimeout(() => pre.classList.add('done'), 300);
    setTimeout(() => pre.remove(), 1000);
    startAnimations();   // fire everything else after load
  });

  // safety: remove after 4s regardless
  setTimeout(() => {
    pre?.classList.add('done');
    setTimeout(() => pre?.remove(), 700);
    startAnimations();
  }, 4000);
}

/* ════════════════════════════════════════════════════════════════
   2. MAGNETIC CURSOR — dual-layer trailing orb
════════════════════════════════════════════════════════════════ */
function initCursor() {
  if (IS_TOUCH) return;
  const dot  = document.getElementById('cursorDot');
  const ring = document.getElementById('cursorRing');
  if (!dot || !ring) return;

  let mx = -200, my = -200, rx = -200, ry = -200;

  document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });

  function loop() {
    dot.style.left  = `${mx}px`;
    dot.style.top   = `${my}px`;
    rx = lerp(rx, mx, 0.13);
    ry = lerp(ry, my, 0.13);
    ring.style.left = `${rx}px`;
    ring.style.top  = `${ry}px`;
    raf(loop);
  }
  raf(loop);

  document.addEventListener('mousedown', () => {
    dot.style.transform  = 'translate(-50%,-50%) scale(2.2)';
    ring.style.transform = 'translate(-50%,-50%) scale(0.5)';
  });
  document.addEventListener('mouseup', () => {
    dot.style.transform  = '';
    ring.style.transform = '';
  });

  document.querySelectorAll('a,button,.pb-card,.why-hex,.qs-card,.gg-item').forEach(el => {
    el.addEventListener('mouseenter', () => ring.classList.add('hover'));
    el.addEventListener('mouseleave', () => ring.classList.remove('hover'));
  });
}

/* ════════════════════════════════════════════════════════════════
   3. SCROLL PROGRESS BAR
════════════════════════════════════════════════════════════════ */
function initProgressBar() {
  const bar = document.getElementById('scrollProgress');
  if (!bar) return;
  function update() {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width  = `${clamp(window.pageYOffset / scrollable * 100, 0, 100)}%`;
  }
  window.addEventListener('scroll', update, { passive: true });
}

/* ════════════════════════════════════════════════════════════════
   4. NAVBAR — scroll-aware + direction-hide
════════════════════════════════════════════════════════════════ */
function initNavbar() {
  const nav    = document.getElementById('navbar');
  const burger = document.getElementById('navBurger');
  const menu   = document.getElementById('navMenu');
  if (!nav) return;

  nav.style.transition = 'transform .45s cubic-bezier(.22,.61,.36,1),background .35s,box-shadow .35s';

  window.addEventListener('scroll', () => {
    const y   = window.pageYOffset;
    const dir = y > lastY ? 'down' : 'up';
    lastY = y;
    nav.classList.toggle('scrolled', y > 60);
    nav.style.transform = (dir === 'down' && y > 450) ? 'translateY(-100%)' : 'translateY(0)';
  }, { passive: true });

  // Mobile toggle
  burger?.addEventListener('click', () => {
    const open = menu.classList.toggle('open');
    burger.classList.toggle('active', open);
    const [s1, s2, s3] = burger.querySelectorAll('span');
    s1.style.transform = open ? 'translateY(6.5px) rotate(45deg)'  : '';
    s2.style.opacity   = open ? '0' : '';
    s3.style.transform = open ? 'translateY(-6.5px) rotate(-45deg)': '';
  });

  // Active link
  const secs = document.querySelectorAll('section[id]');
  const links = document.querySelectorAll('.nav-item[href^="#"]');
  window.addEventListener('scroll', () => {
    const mid = window.pageYOffset + window.innerHeight / 3;
    secs.forEach(s => {
      if (s.offsetTop <= mid && s.offsetTop + s.offsetHeight > mid) {
        links.forEach(a => a.classList.toggle('active-nav', a.getAttribute('href') === `#${s.id}`));
      }
    });
  }, { passive: true });

  // Inject active style
  const sty = document.createElement('style');
  sty.textContent = '.nav-item.active-nav{color:#fff!important;background:rgba(0,201,212,.12)!important}';
  document.head.appendChild(sty);
}

/* ════════════════════════════════════════════════════════════════
   5. SMOOTH SCROLL
════════════════════════════════════════════════════════════════ */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const t = document.querySelector(a.getAttribute('href'));
      if (!t) return;
      e.preventDefault();
      window.scrollTo({ top: t.getBoundingClientRect().top + window.pageYOffset - 76, behavior: 'smooth' });
      document.getElementById('navMenu')?.classList.remove('open');
    });
  });
}

/* ════════════════════════════════════════════════════════════════
   6. HERO CANVAS — constellation particle field with nebula
════════════════════════════════════════════════════════════════ */
function initHeroCanvas() {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, particles = [], mouse = { x: -999, y: -999 };

  const resize = () => {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  };
  resize();
  window.addEventListener('resize', resize);

  class Particle {
    constructor() { this.init(true); }
    init(random = false) {
      this.x    = Math.random() * W;
      this.y    = random ? Math.random() * H : H + 10;
      this.r    = Math.random() * 1.6 + 0.3;
      this.vx   = (Math.random() - .5) * .4;
      this.vy   = -(Math.random() * .5 + .15);
      this.life = 0;
      this.maxLife = Math.random() * 240 + 100;
      this.a    = 0;
      this.hue  = Math.random() > .6 ? 183 : (Math.random() > .5 ? 45 : 270);
    }
    step() {
      this.life++;
      const lp = this.life / this.maxLife;
      this.a    = lp < .2 ? lp * 5 * .6 : lp > .8 ? (1 - lp) * 5 * .6 : .6;
      // mouse repel
      const dx   = this.x - mouse.x, dy = this.y - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 100) { const f = (100 - dist) / 100 * .5; this.vx += dx / dist * f; this.vy += dy / dist * f; }
      this.vx *= .97; this.vy *= .97;
      this.x  += this.vx; this.y += this.vy;
      if (this.life > this.maxLife || this.y < -10) this.init();
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${this.hue},90%,70%,${this.a})`;
      ctx.fill();
    }
  }

  for (let i = 0; i < (IS_TOUCH ? 40 : 90); i++) particles.push(new Particle());

  function drawLines() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x, dy = particles[i].y - particles[j].y;
        const d  = Math.sqrt(dx*dx+dy*dy);
        if (d < 110) {
          const a = (1 - d/110) * .15;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(0,201,212,${a})`;
          ctx.lineWidth = .7;
          ctx.stroke();
        }
      }
    }
  }

  // Nebula glow orbs
  const orbs = [
    { x: .2, y: .4, r: 180, h: 183, a: .06 },
    { x: .75, y: .6, r: 150, h: 270, a: .04 },
    { x: .5, y: .2, r: 120, h: 45, a: .04 },
  ];

  function loop() {
    ctx.clearRect(0, 0, W, H);
    orbs.forEach(o => {
      const g = ctx.createRadialGradient(o.x*W, o.y*H, 0, o.x*W, o.y*H, o.r);
      g.addColorStop(0, `hsla(${o.h},90%,60%,${o.a})`);
      g.addColorStop(1, 'transparent');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
    });
    particles.forEach(p => { p.step(); p.draw(); });
    drawLines();
    raf(loop);
  }
  raf(loop);

  const hero = document.querySelector('.hero');
  hero?.addEventListener('mousemove', e => {
    const r = hero.getBoundingClientRect();
    mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top;
  });
  hero?.addEventListener('mouseleave', () => { mouse.x = -999; mouse.y = -999; });
}

/* ════════════════════════════════════════════════════════════════
   7. HERO SLIDESHOW — crossfade + kenburns
════════════════════════════════════════════════════════════════ */
function initHeroSlideshow() {
  const slides = document.querySelectorAll('.hero-slide');
  const dots   = document.querySelectorAll('.sdot');
  let current  = 0;
  const go = idx => {
    slides[current].classList.remove('active');
    dots[current]?.classList.remove('active');
    current = (idx + slides.length) % slides.length;
    slides[current].classList.add('active');
    dots[current]?.classList.add('active');
  };
  dots.forEach((d, i) => d.addEventListener('click', () => go(i)));
  setInterval(() => go(current + 1), 5500);
}

/* ════════════════════════════════════════════════════════════════
   8. AOS — custom attribute-based scroll reveal with stagger
════════════════════════════════════════════════════════════════ */
function initAOS() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el    = e.target;
      const delay = parseFloat(el.dataset.aosDelay || 0);
      setTimeout(() => el.classList.add('aos-animate'), delay);
      obs.unobserve(el);
    });
  }, { threshold: .1, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('[data-aos]').forEach(el => obs.observe(el));
}

/* ════════════════════════════════════════════════════════════════
   9. COUNTER ANIMATION — expo ease count-up
════════════════════════════════════════════════════════════════ */
function initCounters() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el  = e.target;
      const end = parseFloat(el.dataset.count);
      const sfx = el.dataset.suffix || '';
      const dur = 1800;
      const t0  = performance.now();
      function tick(now) {
        const p   = clamp((now - t0) / dur, 0, 1);
        const val = (1 - Math.pow(2, -10 * p)) * end;
        el.textContent = (end % 1 === 0 ? Math.floor(val) : val.toFixed(1)) + sfx;
        if (p < 1) raf(() => tick(performance.now()));
        else el.textContent = end + sfx;
      }
      raf(() => tick(performance.now()));
      obs.unobserve(el);
    });
  }, { threshold: .6 });

  document.querySelectorAll('[data-count]').forEach(el => obs.observe(el));
}

/* ════════════════════════════════════════════════════════════════
   10. HERO PARALLAX — multi-layer depth scroll
════════════════════════════════════════════════════════════════ */
function initParallax() {
  if (IS_TOUCH) return;
  const slide    = document.querySelector('.hero-slide.active');
  const overlay  = document.querySelector('.hero-overlay-multi');
  const content  = document.querySelector('.hero-content-wrap');

  window.addEventListener('scroll', () => {
    const y = window.pageYOffset;
    if (y > window.innerHeight * 1.2) return;
    const p = y / window.innerHeight;
    if (slide) slide.style.transform = `scale(1.08) translateY(${y * .4}px)`;
    if (content) { content.style.transform = `translateY(${y * .2}px)`; content.style.opacity = `${1 - p * 1.6}`; }
    if (overlay) overlay.style.opacity = `${clamp(.6 + p * .4, 0, 1)}`;
  }, { passive: true });
}

/* ════════════════════════════════════════════════════════════════
   11. 3D CARD TILT — spring physics
════════════════════════════════════════════════════════════════ */
function initCardTilt() {
  if (IS_TOUCH) return;
  document.querySelectorAll('.pb-card,.why-hex,.qs-card,.ci-card').forEach(card => {
    let rx = 0, ry = 0, raf_id = null;
    card.addEventListener('mousemove', e => {
      const r  = card.getBoundingClientRect();
      const x  = (e.clientX - r.left) / r.width  - .5;
      const y  = (e.clientY - r.top)  / r.height - .5;
      const tx = -y * 12, ty = x * 12;
      cancelAnimationFrame(raf_id);
      function ani() {
        rx = lerp(rx, tx, .1); ry = lerp(ry, ty, .1);
        card.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(6px)`;
        raf_id = raf(ani);
      }
      ani();
    });
    card.addEventListener('mouseleave', () => {
      cancelAnimationFrame(raf_id);
      function reset() {
        rx = lerp(rx, 0, .1); ry = lerp(ry, 0, .1);
        card.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg)`;
        if (Math.abs(rx) > .05 || Math.abs(ry) > .05) raf_id = raf(reset);
        else card.style.transform = '';
      }
      reset();
    });
  });
}

/* ════════════════════════════════════════════════════════════════
   12. CARD GLARE — moving specular highlight
════════════════════════════════════════════════════════════════ */
function initGlare() {
  if (IS_TOUCH) return;
  document.querySelectorAll('.pb-card,.why-hex').forEach(card => {
    const g = document.createElement('div');
    Object.assign(g.style, {
      position:'absolute',inset:'0',pointerEvents:'none',borderRadius:'inherit',zIndex:'10',
      transition:'background .12s', background:'radial-gradient(circle at 30% 30%,rgba(255,255,255,.07) 0%,transparent 55%)'
    });
    card.style.overflow = 'hidden';
    card.appendChild(g);
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const x = ((e.clientX - r.left)/r.width*100).toFixed(1);
      const y = ((e.clientY - r.top)/r.height*100).toFixed(1);
      g.style.background = `radial-gradient(circle at ${x}% ${y}%,rgba(255,255,255,.10) 0%,transparent 56%)`;
    });
    card.addEventListener('mouseleave', () => {
      g.style.background = 'radial-gradient(circle at 30% 30%,rgba(255,255,255,.04) 0%,transparent 55%)';
    });
  });
}

/* ════════════════════════════════════════════════════════════════
   13. TYPED HEADLINE — cycling hero caption
════════════════════════════════════════════════════════════════ */
function initTyped() {
  const phrases = ['Premium uPVC Windows & Doors','RoHS & EN 12606 Certified','Trusted for 20+ Years','Soundproof · Weatherproof · Durable'];
  const wrap = document.createElement('div');
  Object.assign(wrap.style,{
    position:'absolute',bottom:'90px',right:'clamp(20px,5vw,64px)',zIndex:'4',
    display:'flex',alignItems:'center',gap:'10px',fontFamily:"'Space Grotesk',sans-serif",
    fontSize:'.72rem',fontWeight:'600',letterSpacing:'.15em',textTransform:'uppercase',
    color:'rgba(255,255,255,.45)'
  });
  const bar = document.createElement('span');
  bar.style.cssText='color:rgba(0,201,212,.7);font-size:.9rem';
  bar.textContent='//';
  const txt = document.createElement('span');
  const cur = document.createElement('span');
  cur.style.cssText='display:inline-block;width:2px;height:12px;background:rgba(0,201,212,.7);margin-left:3px;animation:blink 1s step-end infinite;vertical-align:middle';
  wrap.appendChild(bar); wrap.appendChild(txt); wrap.appendChild(cur);
  document.querySelector('.hero')?.appendChild(wrap);

  let pi=0,ci=0,del=false;
  const SPEED=55,SDEL=28,PAUSE=2400;
  const go=()=>{
    const p=phrases[pi];
    if(!del&&ci<=p.length)       { txt.textContent=p.slice(0,ci++); setTimeout(go,SPEED); }
    else if(!del)                 { del=true; setTimeout(go,PAUSE); }
    else if(del&&ci>=0)           { txt.textContent=p.slice(0,ci--); setTimeout(go,SDEL); }
    else                          { del=false; pi=(pi+1)%phrases.length; setTimeout(go,350); }
  };
  setTimeout(go,2200);
}

/* ════════════════════════════════════════════════════════════════
   14. AMBIENT HERO LIGHT — slowly morphing radial glow
════════════════════════════════════════════════════════════════ */
function initAmbientLight() {
  if (IS_TOUCH) return;
  const ov = document.querySelector('.hero-overlay-multi');
  if (!ov) return;
  let ang = 0;
  function loop() {
    ang += .0025;
    const x = 50 + Math.sin(ang)*14, y = 50 + Math.cos(ang*.7)*10;
    ov.style.background =
      `radial-gradient(ellipse at ${x}% ${y}%,rgba(0,201,212,.1) 0%,transparent 52%),
       radial-gradient(ellipse at ${100-x}% ${100-y}%,rgba(139,92,246,.07) 0%,transparent 45%),
       linear-gradient(135deg,rgba(11,31,58,.82) 0%,rgba(11,31,58,.58) 50%,rgba(0,31,48,.72) 100%)`;
    raf(loop);
  }
  raf(loop);
}

/* ════════════════════════════════════════════════════════════════
   15. WHY-US ANIMATED BACKGROUND — floating geometric shapes
════════════════════════════════════════════════════════════════ */
function initWhyBgAnim() {
  const container = document.getElementById('whyBgAnim');
  if (!container) return;
  for (let i = 0; i < 12; i++) {
    const el = document.createElement('div');
    const size = Math.random() * 60 + 20;
    const dur  = Math.random() * 20 + 15;
    const delay= Math.random() * -20;
    Object.assign(el.style, {
      position:'absolute',
      width:`${size}px`, height:`${size}px`,
      left:`${Math.random()*100}%`,
      top:`${Math.random()*100}%`,
      borderRadius: Math.random() > .5 ? '50%' : '8px',
      border:`1px solid rgba(0,201,212,${Math.random()*.12+.04})`,
      animation:`floatY ${dur}s ease-in-out infinite`,
      animationDelay:`${delay}s`,
      transform:`rotate(${Math.random()*45}deg)`,
    });
    container.appendChild(el);
  }
}

/* ════════════════════════════════════════════════════════════════
   16. QUALITY BARS — animated fill on scroll entry
════════════════════════════════════════════════════════════════ */
function initQualityBars() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.querySelectorAll('.qscb-fill,.dcb-fill').forEach((bar, i) => {
        setTimeout(() => bar.classList.add('animated'), i * 200 + 200);
      });
      obs.unobserve(e.target);
    });
  }, { threshold: .3 });
  document.querySelectorAll('.qs-card,.durability-comp').forEach(el => obs.observe(el));
}

/* ════════════════════════════════════════════════════════════════
   17. GALLERY LIGHTBOX — immersive full-screen viewer
════════════════════════════════════════════════════════════════ */
function initLightbox() {
  const items = document.querySelectorAll('.gg-item');
  if (!items.length) return;

  const lb = document.createElement('div');
  lb.className = 'lightbox';
  lb.innerHTML = `
    <div class="lb-bg"></div>
    <button class="lb-close"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
    <button class="lb-prev"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 18l-6-6 6-6"/></svg></button>
    <button class="lb-next"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg></button>
    <div class="lb-wrap"><img class="lb-img" src="" alt=""/><div class="lb-caption"></div></div>`;
  document.body.appendChild(lb);

  const img     = lb.querySelector('.lb-img');
  const cap     = lb.querySelector('.lb-caption');
  const imgs    = [...items].map(it => ({
    src: it.querySelector('img')?.src || '',
    alt: it.querySelector('img')?.alt || '',
    cap: it.querySelector('.gg-overlay span')?.textContent || '',
  }));
  let cur = 0;

  const open  = i => { cur=(i+imgs.length)%imgs.length; img.src=imgs[cur].src; img.alt=imgs[cur].alt; cap.textContent=imgs[cur].cap; lb.classList.add('open'); document.body.style.overflow='hidden'; };
  const close = () => { lb.classList.remove('open'); document.body.style.overflow=''; setTimeout(()=>{ img.src=''; },400); };

  items.forEach((it, i) => it.addEventListener('click', () => open(i)));
  lb.querySelector('.lb-close').addEventListener('click', close);
  lb.querySelector('.lb-bg').addEventListener('click', close);
  lb.querySelector('.lb-prev').addEventListener('click', () => open(cur-1));
  lb.querySelector('.lb-next').addEventListener('click', () => open(cur+1));
  document.addEventListener('keydown', e => {
    if (!lb.classList.contains('open')) return;
    if (e.key==='Escape') close();
    if (e.key==='ArrowLeft') open(cur-1);
    if (e.key==='ArrowRight') open(cur+1);
  });

  // Touch swipe
  let tx0 = 0;
  lb.addEventListener('touchstart', e => tx0 = e.touches[0].clientX, { passive: true });
  lb.addEventListener('touchend',   e => {
    const dx = e.changedTouches[0].clientX - tx0;
    if (Math.abs(dx) > 50) open(dx > 0 ? cur-1 : cur+1);
  });
}

/* ════════════════════════════════════════════════════════════════
   18. CONTACT FORM — validation + ripple + success
════════════════════════════════════════════════════════════════ */
function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  const rules = [
    { el: form.querySelector('#cfName'),    ok: v => v.trim().length >= 2,           msg: 'Please enter your full name.' },
    { el: form.querySelector('#cfPhone'),   ok: v => /^[\d\s+\-()]{7,}$/.test(v),   msg: 'Enter a valid phone number.' },
    { el: form.querySelector('#cfProduct'), ok: v => v !== '',                        msg: 'Please select a product.' },
  ];

  const err = (el, msg) => {
    el.style.borderColor = '#F43F5E';
    el.style.boxShadow   = '0 0 0 4px rgba(244,63,94,.12)';
    let sp = el.parentNode.querySelector('.ferr');
    if (!sp) { sp=document.createElement('span'); sp.className='ferr'; sp.style.cssText='font-size:.7rem;color:#F43F5E;margin-top:4px;display:block;font-family:var(--ff-mono)'; el.parentNode.appendChild(sp); }
    sp.textContent = msg;
  };
  const clr = el => {
    el.style.borderColor=''; el.style.boxShadow='';
    el.parentNode.querySelector('.ferr')?.remove();
  };

  rules.forEach(({el,ok,msg}) => {
    el?.addEventListener('blur',  () => ok(el.value) ? clr(el) : err(el,msg));
    el?.addEventListener('input', () => { if(ok(el.value)) clr(el); });
  });

  // Button ripple
  const btn = form.querySelector('.cf-submit');
  btn?.addEventListener('click', e => {
    const r = btn.getBoundingClientRect();
    const rip = document.createElement('span');
    Object.assign(rip.style, {
      position:'absolute', borderRadius:'50%',
      width:'4px', height:'4px',
      left:`${e.clientX-r.left-2}px`, top:`${e.clientY-r.top-2}px`,
      background:'rgba(255,255,255,.4)',
      animation:'ripple .7s ease-out forwards', pointerEvents:'none'
    });
    btn.appendChild(rip);
    setTimeout(() => rip.remove(), 700);
  });

  // Ripple CSS
  const s = document.createElement('style');
  s.textContent='@keyframes ripple{0%{transform:scale(0);opacity:.6}100%{transform:scale(80);opacity:0}}';
  document.head.appendChild(s);

  form.addEventListener('submit', e => {
    e.preventDefault();
    let valid = true;
    rules.forEach(({el,ok,msg}) => { if(!el) return; if(!ok(el.value)){err(el,msg);valid=false;} else clr(el); });
    if (!valid) return;

    btn.innerHTML = '<span style="display:flex;align-items:center;gap:8px"><span class="dot-load"></span><span class="dot-load" style="animation-delay:.2s"></span><span class="dot-load" style="animation-delay:.4s"></span></span>';
    btn.disabled = true;
    const ds = document.createElement('style');
    ds.textContent='.dot-load{display:inline-block;width:7px;height:7px;background:#fff;border-radius:50%;animation:dotBounce .9s ease-in-out infinite}';
    document.head.appendChild(ds);

    setTimeout(() => {
      document.getElementById('cformCard').innerHTML = `
        <div class="form-success">
          <div class="fs-icon"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg></div>
          <h4>Thank You!</h4>
          <p>We've received your enquiry and will contact you within 2 business hours.</p>
          <a href="tel:9585751941" class="cf-submit" style="display:inline-flex;margin-top:20px;text-decoration:none;width:auto;padding:14px 30px;border-radius:9999px">
            <span>Call Now: 9585751941</span>
          </a>
        </div>`;
    }, 1800);
  });
}

/* ════════════════════════════════════════════════════════════════
   19. NOISE TEXTURE — film-grain premium feel
════════════════════════════════════════════════════════════════ */
function initNoise() {
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const x = c.getContext('2d');
  const d = x.createImageData(256, 256);
  for (let i = 0; i < d.data.length; i += 4) {
    const v = Math.floor(Math.random() * 255);
    d.data[i]=d.data[i+1]=d.data[i+2]=v; d.data[i+3]=9;
  }
  x.putImageData(d, 0, 0);
  const el = document.createElement('div');
  Object.assign(el.style, {
    position:'fixed',inset:'0',backgroundImage:`url(${c.toDataURL()})`,backgroundRepeat:'repeat',
    pointerEvents:'none',zIndex:'99999',opacity:'.4',mixBlendMode:'overlay',
    animation:'noiseShift 1s steps(3) infinite'
  });
  document.body.appendChild(el);
}

/* ════════════════════════════════════════════════════════════════
   20. BACK-TO-TOP
════════════════════════════════════════════════════════════════ */
function initBackTop() {
  const btn = document.createElement('button');
  btn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 15l7-7 7 7"/></svg>';
  btn.setAttribute('aria-label','Back to top');
  Object.assign(btn.style,{
    position:'fixed',bottom:'108px',right:'30px',width:'46px',height:'46px',borderRadius:'50%',
    background:'rgba(11,31,58,.85)',border:'1px solid rgba(255,255,255,.12)',color:'#fff',
    display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',zIndex:'9980',
    opacity:'0',transform:'translateY(14px)',transition:'opacity .3s,transform .3s,background .2s',
    backdropFilter:'blur(12px)'
  });
  document.body.appendChild(btn);
  btn.addEventListener('click', () => window.scrollTo({top:0,behavior:'smooth'}));
  btn.addEventListener('mouseenter', () => btn.style.background='rgba(0,201,212,.85)');
  btn.addEventListener('mouseleave', () => btn.style.background='rgba(11,31,58,.85)');
  window.addEventListener('scroll', () => {
    const show = window.pageYOffset > 600;
    btn.style.opacity   = show ? '1' : '0';
    btn.style.transform = show ? 'translateY(0)' : 'translateY(14px)';
  }, { passive: true });
}

/* ════════════════════════════════════════════════════════════════
   21. SECTION HEADLINE REVEAL — split word animation
════════════════════════════════════════════════════════════════ */
function initHeadlineReveal() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const words = e.target.querySelectorAll('.hw');
      words.forEach((w, i) => setTimeout(() => w.classList.add('hw-visible'), i * 80));
      obs.unobserve(e.target);
    });
  }, { threshold: .2 });

  document.querySelectorAll('.section-heading').forEach(h => {
    // wrap each word
    h.innerHTML = h.innerHTML.replace(/(<[^>]+>)|(\S+)/g, (match, tag, word) => {
      if (tag) return tag;
      return `<span class="hw">${word}</span> `;
    });
    obs.observe(h);
  });

  const sty = document.createElement('style');
  sty.textContent = `
    .hw{display:inline-block;opacity:0;transform:translateY(30px);transition:opacity .55s var(--ease-out,cubic-bezier(.22,.61,.36,1)),transform .55s var(--ease-out,cubic-bezier(.22,.61,.36,1))}
    .hw-visible{opacity:1;transform:translateY(0)}`;
  document.head.appendChild(sty);
}

/* ════════════════════════════════════════════════════════════════
   22. PRODUCT CARD — shimmer border on hover
════════════════════════════════════════════════════════════════ */
function initProductShimmer() {
  document.querySelectorAll('.pb-card').forEach(card => {
    const border = document.createElement('div');
    Object.assign(border.style, {
      position:'absolute',inset:'0',borderRadius:'inherit',pointerEvents:'none',zIndex:'11',
      border:'1.5px solid transparent',transition:'border-color .35s',
    });
    card.appendChild(border);
    card.addEventListener('mouseenter', () => {
      border.style.borderColor='rgba(0,201,212,.5)';
      border.style.boxShadow='0 0 30px rgba(0,201,212,.15) inset';
    });
    card.addEventListener('mouseleave', () => {
      border.style.borderColor='transparent';
      border.style.boxShadow='none';
    });
  });
}

/* ════════════════════════════════════════════════════════════════
   23. MARQUEE STRIP — pause on hover
════════════════════════════════════════════════════════════════ */
function initMarquee() {
  const inner = document.querySelector('.marquee-inner');
  if (!inner) return;
  inner.addEventListener('mouseenter', () => inner.style.animationPlayState='paused');
  inner.addEventListener('mouseleave', () => inner.style.animationPlayState='running');
}

/* ════════════════════════════════════════════════════════════════
   24. STICKY SECTION LABELS — coloured dot indicator on scroll
════════════════════════════════════════════════════════════════ */
function initSectionDot() {
  const indicator = document.createElement('div');
  Object.assign(indicator.style, {
    position:'fixed',right:'16px',top:'50%',transform:'translateY(-50%)',
    zIndex:'9970',display:'flex',flexDirection:'column',gap:'8px',
    opacity:'0',transition:'opacity .4s'
  });
  const sections = document.querySelectorAll('section[id]');
  const dots = [...sections].map((sec, i) => {
    const d = document.createElement('div');
    Object.assign(d.style,{
      width:'5px',height:'5px',borderRadius:'50%',
      background:'rgba(255,255,255,.25)',transition:'all .3s',cursor:'pointer'
    });
    d.title = sec.id.charAt(0).toUpperCase()+sec.id.slice(1);
    d.addEventListener('click',() => window.scrollTo({top:sec.getBoundingClientRect().top+window.pageYOffset-76,behavior:'smooth'}));
    indicator.appendChild(d);
    return d;
  });

  document.body.appendChild(indicator);
  window.addEventListener('scroll',()=>{
    const y=window.pageYOffset;
    indicator.style.opacity=y>300?'1':'0';
    sections.forEach((s,i)=>{
      const active=s.offsetTop<=y+window.innerHeight/2&&s.offsetTop+s.offsetHeight>y+window.innerHeight/2;
      dots[i].style.width =active?'5px':'5px';
      dots[i].style.height=active?'18px':'5px';
      dots[i].style.background=active?'rgba(0,201,212,.9)':'rgba(255,255,255,.25)';
    });
  },{passive:true});
}

/* ════════════════════════════════════════════════════════════════
   25. FLOATING CALL BUTTON — entrance + tooltip
════════════════════════════════════════════════════════════════ */
function initFAB() {
  const fab = document.getElementById('fabCall');
  if (!fab) return;

  const tip = document.createElement('span');
  Object.assign(tip.style,{
    position:'absolute',right:'78px',top:'50%',transform:'translateY(-50%)',
    background:'rgba(11,31,58,.95)',color:'#fff',fontSize:'.75rem',fontWeight:'600',
    letterSpacing:'.08em',padding:'7px 14px',borderRadius:'6px',whiteSpace:'nowrap',
    opacity:'0',transition:'opacity .25s,transform .25s',pointerEvents:'none',
    transform:'translateY(-50%) translateX(6px)',backdropFilter:'blur(8px)',
    border:'1px solid rgba(0,201,212,.25)'
  });
  tip.textContent='Call: 9585751941';
  fab.style.position='relative';
  fab.appendChild(tip);

  fab.addEventListener('mouseenter',()=>{
    tip.style.opacity='1';
    tip.style.transform='translateY(-50%) translateX(0)';
  });
  fab.addEventListener('mouseleave',()=>{
    tip.style.opacity='0';
    tip.style.transform='translateY(-50%) translateX(6px)';
  });
}

/* ════════════════════════════════════════════════════════════════
   26. RIPPLE EFFECT — on all primary buttons
════════════════════════════════════════════════════════════════ */
function initButtonRipples() {
  document.querySelectorAll('.hcta-primary,.cta-pill,.nav-cta-btn').forEach(btn => {
    btn.style.overflow = 'hidden';
    btn.addEventListener('click', e => {
      const r = btn.getBoundingClientRect();
      const rip = document.createElement('span');
      Object.assign(rip.style,{
        position:'absolute',borderRadius:'50%',width:'4px',height:'4px',
        left:`${e.clientX-r.left-2}px`,top:`${e.clientY-r.top-2}px`,
        background:'rgba(255,255,255,.35)',animation:'ripple .8s ease-out forwards',pointerEvents:'none'
      });
      btn.appendChild(rip);
      setTimeout(()=>rip.remove(),800);
    });
  });
}

/* ════════════════════════════════════════════════════════════════
   27. IMAGE LAZY LOAD — blur-up reveal
════════════════════════════════════════════════════════════════ */
function initLazyImages() {
  const style = document.createElement('style');
  style.textContent=`img[loading="lazy"]{filter:blur(8px);transition:filter .6s}img[loading="lazy"].loaded{filter:blur(0)}`;
  document.head.appendChild(style);

  const obs = new IntersectionObserver(entries=>{
    entries.forEach(e=>{
      if(!e.isIntersecting) return;
      const img=e.target;
      img.addEventListener('load',()=>img.classList.add('loaded'),{once:true});
      if(img.complete) img.classList.add('loaded');
      obs.unobserve(img);
    });
  },{threshold:.01});
  document.querySelectorAll('img[loading="lazy"]').forEach(img=>obs.observe(img));
}

/* ════════════════════════════════════════════════════════════════
   28. RESIZE HANDLER
════════════════════════════════════════════════════════════════ */
function initResize() {
  let t;
  window.addEventListener('resize',()=>{
    clearTimeout(t);
    t=setTimeout(()=>{
      window.dispatchEvent(new Event('resized'));
    },180);
  });
}

/* ════════════════════════════════════════════════════════════════
   MASTER INIT
════════════════════════════════════════════════════════════════ */
function startAnimations() {
  initProgressBar();
  initNavbar();
  initSmoothScroll();
  initAOS();
  initCounters();
  initMarquee();
  initQualityBars();
  initContactForm();
  initLightbox();
  initBackTop();
  initSectionDot();
  initFAB();
  initButtonRipples();
  initLazyImages();
  initResize();

  raf(() => {
    initHeroCanvas();
    initHeroSlideshow();
    initParallax();
    initAmbientLight();
    initCardTilt();
    initGlare();
    initTyped();
    initWhyBgAnim();
    initHeadlineReveal();
    initProductShimmer();
    if (!IS_TOUCH) initCursor();
    initNoise();
  });
}

/* Boot */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPreloader);
} else {
  initPreloader();
}

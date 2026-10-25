/* ===== helpers ===== */
const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];
const store = {
  get(k) { try { return localStorage.getItem(k); } catch { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch {} }
};

/* ===== theme toggle (remembers choice) ===== */
const root = document.documentElement;
const saved = store.get("theme");
if (saved) root.dataset.theme = saved;
$("#themeBtn").addEventListener("click", () => {
  root.dataset.theme = root.dataset.theme === "dark" ? "light" : "dark";
  store.set("theme", root.dataset.theme);
});

/* ===== mobile menu ===== */
const links = $("#links");
$("#burger").addEventListener("click", () => links.classList.toggle("open"));
$$("#links a").forEach(a => a.addEventListener("click", () => links.classList.remove("open")));

/* ===== typewriter ===== */
const roles = ["clean web experiences.", "efficient algorithms in C++.", "secure, scalable solutions.", "apps like PulsePay."];
const typed = $("#typed");
let r = 0, c = 0, del = false;
(function type() {
  const word = roles[r];
  typed.textContent = word.slice(0, c);
  if (!del && c < word.length) c++;
  else if (del && c > 0) c--;
  else if (!del) { del = true; return setTimeout(type, 1400); }
  else { del = false; r = (r + 1) % roles.length; }
  setTimeout(type, del ? 35 : 75);
})();

/* ===== particle network hero ===== */
const cv = $("#net"), ctx = cv.getContext("2d");
let W, H, pts = [], mouse = { x: null, y: null };
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
function resize() {
  W = cv.width = cv.offsetWidth;
  H = cv.height = cv.offsetHeight;
  const n = Math.min(90, Math.floor((W * H) / 14000));
  pts = Array.from({ length: n }, () => ({
    x: Math.random() * W, y: Math.random() * H,
    vx: (Math.random() - .5) * .45, vy: (Math.random() - .5) * .45
  }));
}
addEventListener("resize", resize); resize();
$("#home").addEventListener("mousemove", e => {
  const b = cv.getBoundingClientRect(); mouse.x = e.clientX - b.left; mouse.y = e.clientY - b.top;
});
$("#home").addEventListener("mouseleave", () => mouse.x = mouse.y = null);
function accentRGB() {
  const v = getComputedStyle(root).getPropertyValue("--accent").trim();
  const h = v.replace("#", "");
  return [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16)).join(",");
}
function draw() {
  ctx.clearRect(0, 0, W, H);
  const rgb = accentRGB();
  for (const p of pts) {
    p.x += p.vx; p.y += p.vy;
    if (p.x < 0 || p.x > W) p.vx *= -1;
    if (p.y < 0 || p.y > H) p.vy *= -1;
    ctx.beginPath(); ctx.arc(p.x, p.y, 1.8, 0, 7); ctx.fillStyle = `rgba(${rgb},.8)`; ctx.fill();
  }
  for (let i = 0; i < pts.length; i++) {
    for (let j = i + 1; j < pts.length; j++) {
      const d = Math.hypot(pts[i].x - pts[j].x, pts[i].y - pts[j].y);
      if (d < 120) { ctx.strokeStyle = `rgba(${rgb},${(1 - d / 120) * .25})`; ctx.beginPath(); ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(pts[j].x, pts[j].y); ctx.stroke(); }
    }
    if (mouse.x !== null) {
      const d = Math.hypot(pts[i].x - mouse.x, pts[i].y - mouse.y);
      if (d < 160) {
        ctx.strokeStyle = `rgba(${rgb},${(1 - d / 160) * .6})`; ctx.beginPath(); ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke();
        pts[i].x += (mouse.x - pts[i].x) * .004; pts[i].y += (mouse.y - pts[i].y) * .004;
      }
    }
  }
  if (!reduce) requestAnimationFrame(draw);
}
draw();

/* ===== cursor glow ===== */
const glow = $("#glow");
addEventListener("mousemove", e => { glow.style.left = e.clientX + "px"; glow.style.top = e.clientY + "px"; });

/* ===== scroll: progress bar, active link, to-top ===== */
const prog = $("#progress"), toTop = $("#toTop");
const secs = $$("main section[id]"), navLinks = $$("#links a");
addEventListener("scroll", () => {
  const h = document.documentElement;
  prog.style.width = (h.scrollTop / (h.scrollHeight - h.clientHeight)) * 100 + "%";
  toTop.classList.toggle("show", h.scrollTop > 600);
  let cur = secs[0].id;
  secs.forEach(s => { if (s.getBoundingClientRect().top < innerHeight * .4) cur = s.id; });
  navLinks.forEach(a => a.classList.toggle("active", a.getAttribute("href") === "#" + cur));
}, { passive: true });
toTop.addEventListener("click", () => scrollTo({ top: 0, behavior: "smooth" }));

/* ===== reveal on scroll + counters ===== */
function count(el) {
  const target = +el.dataset.count, dec = +(el.dataset.dec || 0), pre = el.dataset.pre || "";
  let n = 0;
  const step = () => { n += target / 40; if (n >= target) n = target; el.textContent = pre + n.toFixed(dec); if (n < target) requestAnimationFrame(step); };
  step();
}
const io = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.classList.add("in");
    const b = $("b[data-count]", e.target); if (b) count(b);
    io.unobserve(e.target);
  });
}, { threshold: .15 });
$$(".reveal").forEach((el, i) => { el.style.transitionDelay = (i % 4) * 80 + "ms"; io.observe(el); });

/* ===== project filter ===== */
$("#filters").addEventListener("click", e => {
  const btn = e.target.closest(".f"); if (!btn) return;
  $$(".f").forEach(b => b.classList.toggle("active", b === btn));
  const f = btn.dataset.f;
  $$("#projGrid .card").forEach(card => card.classList.toggle("hide", f !== "all" && !card.dataset.cat.split(" ").includes(f)));
});

/* ===== card tilt + spotlight ===== */
$$(".tilt").forEach(card => {
  card.addEventListener("mousemove", e => {
    const b = card.getBoundingClientRect();
    const x = e.clientX - b.left, y = e.clientY - b.top;
    card.style.setProperty("--mx", x + "px"); card.style.setProperty("--my", y + "px");
    const rx = ((y / b.height) - .5) * -8, ry = ((x / b.width) - .5) * 8;
    card.style.transform = `perspective(700px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-4px)`;
  });
  card.addEventListener("mouseleave", () => card.style.transform = "");
});

/* ===== flip cards: tap support on touch devices ===== */
$$(".flip").forEach(f => f.addEventListener("click", () => f.classList.toggle("on")));

/* ===== contact form: sends straight to your inbox via Web3Forms ===== */
const WEB3FORMS_KEY = "d51e8e5c-7597-49e0-99d1-69ba078dbad0";

$("#form").addEventListener("submit", async e => {
  e.preventDefault();
  const form = e.target, note = $("#note"), btn = $("button[type=submit]", form);
  const d = new FormData(form);
  d.set("message", d.get("message") || d.get("msg"));

  if (WEB3FORMS_KEY.startsWith("PASTE")) {
    const body = encodeURIComponent(`${d.get("message")}\n\n— ${d.get("name")} (${d.get("email")})`);
    location.href = `mailto:itsanshi16072006@gmail.com?subject=Portfolio%20message&body=${body}`;
    return;
  }

  d.append("access_key", WEB3FORMS_KEY);
  d.append("subject", "New message from your portfolio");
  d.append("from_name", "Portfolio Contact Form");
  btn.disabled = true; btn.textContent = "Sending…"; note.textContent = "";
  try {
    const res = await fetch("https://api.web3forms.com/submit", { method: "POST", body: d });
    const data = await res.json();
    if (data.success) { note.textContent = "Message sent! I'll get back to you soon ✨"; form.reset(); }
    else throw new Error(data.message);
  } catch (err) {
    note.textContent = "Oops, something went wrong. Please email me directly.";
  } finally {
    btn.disabled = false; btn.textContent = "Send message →";
  }
});

$("#yr").textContent = new Date().getFullYear();

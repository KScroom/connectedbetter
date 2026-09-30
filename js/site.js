(() => {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* boot */
  const boot = document.getElementById("boot");
  if (boot) {
    if (reduce) boot.remove();
    else {
      const num = document.getElementById("boot-num");
      let n = 0;
      const t = setInterval(() => {
        n = Math.min(100, n + 5);
        if (num) num.textContent = String(n).padStart(2, "0");
        if (n >= 100) {
          clearInterval(t);
          boot.classList.add("is-done");
          setTimeout(() => boot.remove(), 450);
        }
      }, 24);
    }
  }

  /* nav */
  const toggle = document.getElementById("nav-toggle");
  const panel = document.getElementById("mobile-panel");
  if (toggle && panel) {
    const close = () => { toggle.setAttribute("aria-expanded", "false"); panel.classList.remove("is-open"); };
    toggle.addEventListener("click", () => {
      const open = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!open));
      panel.classList.toggle("is-open", !open);
    });
    panel.querySelectorAll("a").forEach((a) => a.addEventListener("click", close));
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });
  }

  /* faq */
  document.querySelectorAll(".faq-item > button").forEach((button) => {
    button.addEventListener("click", () => {
      const item = button.parentElement;
      const open = item.classList.contains("open");
      item.closest(".faq").querySelectorAll(".faq-item").forEach((el) => {
        el.classList.remove("open");
        el.querySelector("button")?.setAttribute("aria-expanded", "false");
      });
      if (!open) { item.classList.add("open"); button.setAttribute("aria-expanded", "true"); }
    });
  });

  /* data: the two cards on the connected homepage */
  const previews = [
    { id: "gti", kind: "scholarship", title: "global tech innovators", text: "the scholarship card on the connected homepage, matched to a computer science track.", track: "computer science", cover: "cover-a" },
    { id: "expo", kind: "open day", title: "engineering expo", text: "the open-day card on the connected homepage dashboard.", track: "engineering", cover: "cover-b" },
  ];
  const saved = new Set();

  /* dashboard mockup */
  const app = document.getElementById("app");
  if (app) {
    const panels = [...app.querySelectorAll("[data-panel]")];
    const show = (view) => {
      panels.forEach((p) => { p.hidden = p.dataset.panel !== view; });
      app.querySelectorAll("[data-view]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.view === view)));
    };
    app.querySelectorAll("[data-view]").forEach((b) => b.addEventListener("click", () => show(b.dataset.view)));

    const list = app.querySelector("[data-opp-list]");
    const savedList = app.querySelector("[data-saved-list]");
    const search = app.querySelector("#app-search");
    const count = app.querySelector("[data-saved-count]");

    const row = (item) => {
      const on = saved.has(item.id);
      return `<div class="row-item"><div><strong>${item.title}</strong><span>${item.kind} · ${item.track}</span></div><button type="button" class="chip-btn" data-save="${item.id}" aria-pressed="${on}">${on ? "saved" : "save"}</button></div>`;
    };
    const renderList = () => {
      if (!list) return;
      const q = (search?.value || "").trim().toLowerCase();
      const rows = previews.filter((i) => `${i.title} ${i.kind} ${i.track}`.includes(q));
      list.innerHTML = rows.length ? rows.map(row).join("") : `<div class="empty"><strong>no opportunities found</strong><p>try adjusting your search or filters.</p></div>`;
      list.querySelectorAll("[data-save]").forEach((b) => b.addEventListener("click", () => {
        const id = b.dataset.save;
        saved.has(id) ? saved.delete(id) : saved.add(id);
        renderList(); renderSaved();
        if (count) count.textContent = String(saved.size);
      }));
    };
    const renderSaved = () => {
      if (!savedList) return;
      const rows = previews.filter((i) => saved.has(i.id));
      savedList.innerHTML = rows.length
        ? rows.map((i) => `<div class="row-item"><div><strong>${i.title}</strong><span>${i.kind}</span></div></div>`).join("")
        : `<div class="empty"><strong>nothing saved yet</strong><p>save a scholarship or open day from opportunities.</p></div>`;
    };
    search?.addEventListener("input", () => { show("opportunities"); renderList(); });
    renderList(); renderSaved();

    const checks = [...app.querySelectorAll("button.check")];
    const meter = app.querySelector("[data-meter]");
    const paint = () => {
      if (!meter || !checks.length) return;
      const done = checks.filter((c) => c.getAttribute("aria-pressed") === "true").length;
      meter.textContent = `${Math.round((done / checks.length) * 100)}%`;
    };
    checks.forEach((c) => c.addEventListener("click", () => { c.setAttribute("aria-pressed", String(c.getAttribute("aria-pressed") !== "true")); paint(); }));
    paint();
  }

  /* workflow steps */
  const stepData = [
    ["create your profile", "add everything once. the same profile powers discovery, matching, and every application you submit.", ["academic details and preferences", "documents and certificates", "activities and interests", "profile completion, step by step"]],
    ["find high-fit options", "browse world-class universities or go straight to fully funded opportunities tailored to you.", ["search and filter by location, major, and interest", "save and like what fits", "compare universities and active opportunities", "smart recommendations from your profile"]],
    ["apply with context", "use profile completion checks and organized materials to submit stronger applications.", ["profile readiness before you submit", "reuse 100% of your details", "materials in one organized place", "school counselor approval when you add a partnered school"]],
    ["track every outcome", "follow deadlines, application statuses, interviews, decisions, and offers in one dashboard.", ["kanban board: saved, applied, interview, offer", "automated deadline alerts", "interview dates", "decisions and offers"]],
  ];
  const steps = [...document.querySelectorAll("[data-step]")];
  if (steps.length) {
    const kicker = document.getElementById("step-kicker");
    const title = document.getElementById("step-title");
    const text = document.getElementById("step-text");
    const ul = document.getElementById("step-list");
    const set = (i) => {
      steps.forEach((s) => s.setAttribute("aria-pressed", String(Number(s.dataset.step) === i)));
      const [t, d, items] = stepData[i];
      if (kicker) kicker.innerHTML = `<i></i>step ${i + 1}`;
      if (title) title.textContent = t;
      if (text) text.textContent = d;
      if (ul) ul.innerHTML = items.map((x) => `<li>${x}</li>`).join("");
    };
    steps.forEach((s) => s.addEventListener("click", () => set(Number(s.dataset.step))));
    set(0);
  }

  /* generic toggles: [data-toggle-group] buttons show [data-pane] */
  document.querySelectorAll("[data-toggle]").forEach((b) => {
    b.addEventListener("click", () => {
      const group = b.closest("[data-toggle-group]");
      group?.querySelectorAll("[data-toggle]").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
      document.querySelectorAll(`[data-pane]`).forEach((p) => { if (p.dataset.group === group?.dataset.toggleGroup) p.hidden = p.dataset.pane !== b.dataset.toggle; });
    });
  });

  /* catalogue */
  const catalogue = document.getElementById("catalogue");
  if (catalogue) {
    const q = catalogue.querySelector("[data-q]");
    const chips = [...catalogue.querySelectorAll("[data-kind]")];
    const out = catalogue.querySelector("[data-out]");
    let kind = "all";
    const draw = () => {
      const s = (q?.value || "").trim().toLowerCase();
      const rows = previews.filter((i) => (kind === "all" || i.kind === kind) && `${i.title} ${i.text} ${i.track}`.includes(s));
      out.innerHTML = rows.length
        ? rows.map((i) => `<article class="opp"><div class="opp-cover ${i.cover}"></div><div class="opp-body"><span class="opp-kicker">${i.kind} · shown on connectedqa.com</span><h3>${i.title}</h3><p>${i.text}</p><span class="meta">${i.track}</span></div></article>`).join("")
        : `<div class="card empty" style="grid-column:1/-1"><strong>no opportunities found</strong><p>try adjusting your search or filters.</p></div>`;
    };
    chips.forEach((c) => c.addEventListener("click", () => { kind = c.dataset.kind; chips.forEach((x) => x.setAttribute("aria-pressed", String(x === c))); draw(); }));
    q?.addEventListener("input", draw);
    draw();
  }

  /* university hub */
  const hub = document.getElementById("hub");
  if (hub) {
    const fields = [...hub.querySelectorAll("input, select")];
    const out = hub.querySelector("[data-out]");
    const draw = () => {
      const active = fields.some((f) => f.value && f.value !== "any");
      out.innerHTML = active
        ? `<div class="empty"><strong>no universities found</strong><p>try adjusting your search or filters. the live network opens after you create an account.</p></div>`
        : `<div class="empty"><strong>global university hub</strong><p>discover world-class institutions tailored to your ambitions, or explore the complete global network once you are in.</p></div>`;
    };
    fields.forEach((f) => f.addEventListener("input", draw));
    draw();
  }

  /* support form -> mailto */
  const form = document.getElementById("support-form");
  form?.addEventListener("submit", (e) => {
    e.preventDefault();
    const d = new FormData(form);
    const topic = d.get("topic");
    const body = [`name: ${d.get("first")} ${d.get("last")}`, `email: ${d.get("email")}`, `topic: ${topic}`, "", d.get("message")].join("\n");
    window.location.href = `mailto:connected.qaa@gmail.com?subject=${encodeURIComponent("ConnectED support: " + topic)}&body=${encodeURIComponent(body)}`;
  });
})();

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

  /* page changes and scroll reveals */
  if (!reduce && !document.startViewTransition) document.documentElement.classList.add("no-vt");
  if (!reduce) {
    const blocks = [...document.querySelectorAll("main .section, main .hero, main .page-hero, main .auth, main .legal")];
    const paint = (el) => el.classList.add("is-in");
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        paint(entry.target);
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.16, rootMargin: "0px 0px -40px 0px" });
    const showReached = () => {
      blocks.forEach((el) => {
        if (el.classList.contains("is-in")) return;
        if (el.getBoundingClientRect().top < window.innerHeight * 0.92) paint(el);
      });
    };
    blocks.forEach((el) => {
      if (el.getBoundingClientRect().top < window.innerHeight * 0.88) paint(el);
      else { el.classList.add("reveal"); observer.observe(el); }
    });
    window.addEventListener("scroll", showReached, { passive: true });

    document.addEventListener("click", (e) => {
      if (document.startViewTransition) return;
      const a = e.target.closest("a[href]");
      if (!a || e.defaultPrevented || e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      if (a.target && a.target !== "_self") return;
      if (a.hasAttribute("download")) return;
      let url;
      try { url = new URL(a.href, location.href); } catch { return; }
      if (url.origin !== location.origin) return;
      if (url.pathname === location.pathname && url.hash) return;
      e.preventDefault();
      document.body.classList.add("is-leaving");
      window.setTimeout(() => { location.href = url.href; }, 260);
    });
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
    { id: "gti", kind: "scholarship", title: "Global Tech Innovators", text: "The scholarship card on the ConnectED homepage, matched to a computer science track.", track: "Computer science", cover: "cover-a" },
    { id: "expo", kind: "open day", title: "Engineering Expo", text: "The open-day card on the ConnectED homepage dashboard.", track: "Engineering", cover: "cover-b" },
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
      const kind = item.kind.charAt(0).toUpperCase() + item.kind.slice(1);
      return `<div class="row-item"><div><strong>${item.title}</strong><span>${kind} · ${item.track}</span></div><button type="button" class="chip-btn" data-save="${item.id}" aria-pressed="${on}">${on ? "Saved" : "Save"}</button></div>`;
    };
    const renderList = () => {
      if (!list) return;
      const q = (search?.value || "").trim().toLowerCase();
      const rows = previews.filter((i) => `${i.title} ${i.kind} ${i.track}`.includes(q));
      list.innerHTML = rows.length ? rows.map(row).join("") : `<div class="empty"><strong>No opportunities found</strong><p>Try adjusting your search or filters.</p></div>`;
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
        : `<div class="empty"><strong>Nothing saved yet</strong><p>Save a scholarship or open day from Opportunities.</p></div>`;
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
    ["Create your profile", "Add everything once. The same profile powers discovery, matching, and every application you submit.", ["Academic details and preferences", "Documents and certificates", "Activities and interests", "Profile completion, step by step"]],
    ["Find high-fit options", "Browse universities or go straight to fully funded opportunities tailored to you.", ["Search and filter by location, major, and interest", "Save what fits", "Compare universities and active opportunities", "Recommendations from your profile"]],
    ["Apply with context", "Use profile completion checks and organized materials to submit stronger applications.", ["Profile readiness before you submit", "Reuse your details on every application", "Materials in one place", "Counselor approval when you add a partnered school"]],
    ["Track every outcome", "Follow deadlines, statuses, interviews, decisions, and offers in one dashboard.", ["Board: saved, applied, interview, offer", "Deadline alerts", "Interview dates", "Decisions and offers"]],
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
      if (kicker) kicker.textContent = `Step ${i + 1}`;
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
        ? rows.map((i) => {
            const kind = i.kind.charAt(0).toUpperCase() + i.kind.slice(1);
            return `<article class="opp"><div class="opp-cover ${i.cover}"></div><div class="opp-body"><span class="opp-kicker">${kind} · shown on ConnectED</span><h3>${i.title}</h3><p>${i.text}</p><span class="meta">${i.track}</span></div></article>`;
          }).join("")
        : `<div class="card empty" style="grid-column:1/-1"><strong>No opportunities found</strong><p>Try adjusting your search or filters.</p></div>`;
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
        ? `<div class="empty"><strong>No universities found</strong><p>Try adjusting your search or filters. The full network opens after you create an account.</p></div>`
        : `<div class="empty"><strong>Global university hub</strong><p>Discover institutions tailored to your ambitions, or explore the complete network once you are in.</p></div>`;
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

  const showError = (el, message) => {
    if (!el) return;
    el.hidden = !message;
    el.textContent = message || "";
  };

  const loginForm = document.getElementById("login-form");
  loginForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = loginForm.email.value.trim();
    const password = loginForm.password.value;
    const error = document.getElementById("login-error");
    if (!email || !password) { showError(error, "Enter both your email and password."); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { showError(error, "Enter a valid email address."); return; }
    if (password.length < 8) { showError(error, "Password needs at least 8 characters."); return; }
    showError(error, "");
    document.getElementById("login-fields").hidden = true;
    const done = document.getElementById("login-done");
    document.getElementById("login-done-title").textContent = "Form looks fine.";
    document.getElementById("login-done-text").textContent = "This demo does not sign you into the live ConnectED account. Your password was not sent anywhere.";
    done.hidden = false;
  });
  document.getElementById("forgot")?.addEventListener("click", () => {
    const error = document.getElementById("login-error");
    const email = loginForm?.email.value.trim();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showError(error, "Enter the email on your account first. This demo will not send a reset email.");
      return;
    }
    showError(error, "");
    document.getElementById("login-fields").hidden = true;
    document.getElementById("login-done-title").textContent = "Reset request noted on this page only.";
    document.getElementById("login-done-text").textContent = `No email was sent to ${email}. To reach ConnectED, write to connected.qaa@gmail.com.`;
    document.getElementById("login-done").hidden = false;
  });

  const signupForm = document.getElementById("signup-form");
  signupForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    const d = new FormData(signupForm);
    const error = document.getElementById("signup-error");
    const name = String(d.get("name") || "").trim();
    const phone = String(d.get("phone") || "").replace(/\s/g, "");
    const email = String(d.get("email") || "").trim();
    const password = String(d.get("password") || "");
    const gender = String(d.get("gender") || "");
    const dob = String(d.get("dob") || "");
    const guardian = signupForm.guardian.checked;
    if (name.length < 2) { showError(error, "Enter your full name."); return; }
    if (!/^\+974\d{8}$/.test(phone)) { showError(error, "Phone should start with +974 and include 8 digits."); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { showError(error, "Enter a valid email address."); return; }
    if (password.length < 8) { showError(error, "Password needs at least 8 characters."); return; }
    if (!gender) { showError(error, "Select a gender."); return; }
    if (!dob) { showError(error, "Add your date of birth."); return; }
    if (!guardian) { showError(error, "Confirm that a parent or guardian agrees to the terms."); return; }
    showError(error, "");
    document.getElementById("signup-fields").hidden = true;
    document.getElementById("signup-done").hidden = false;
  });
})();

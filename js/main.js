/* =========================================================
   FreshCart — interactions, 3D effects & cart logic
   ========================================================= */
(() => {
  "use strict";

  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const money = (n) => "₹" + n.toLocaleString("en-IN");
  const isTouch = window.matchMedia("(hover: none)").matches;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- 3D emoji images (Microsoft Fluent Emoji) ---------- */
  const FE = (name) =>
    `https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/${encodeURIComponent(name)}/3D/${name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")}_3d.png`;

  // If an image fails to load, swap it for a native emoji so nothing looks broken.
  function fallback(img) {
    const span = document.createElement("span");
    span.className = img.className + " emoji-fallback";
    span.textContent = img.dataset.e || "🛒";
    for (const k in img.dataset) span.dataset[k] = img.dataset[k];
    span.setAttribute("aria-hidden", "true");
    img.replaceWith(span);
  }
  window.__fcFallback = fallback;

  const img = (f, e, cls = "", lazy = true) =>
    `<img src="${FE(f)}" data-e="${e}" alt="" class="${cls}" ${lazy ? 'loading="lazy"' : ""} onerror="__fcFallback(this)">`;

  /* ---------- Data ---------- */
  // Prices are indicative MRPs for the demo storefront.
  const PRODUCTS = [
    // Fruits
    { id: 1, name: "Hass Avocado", cat: "fruits", f: "Avocado", e: "🥑", price: 149, old: 199, unit: "2 pcs", rating: 4.9, tag: "Bestseller", c: "#e6f4d4" },
    { id: 2, name: "Shimla Red Apples", cat: "fruits", f: "Red apple", e: "🍎", price: 189, old: 229, unit: "1 kg", rating: 4.8, c: "#fde4e1" },
    { id: 3, name: "Robusta Bananas", cat: "fruits", f: "Banana", e: "🍌", price: 59, unit: "1 dozen", rating: 4.7, c: "#fdf3cf" },
    { id: 4, name: "Mahabaleshwar Strawberries", cat: "fruits", f: "Strawberry", e: "🍓", price: 129, old: 169, unit: "200 g", rating: 4.8, tag: "Sale", c: "#ffe1e6" },
    { id: 5, name: "Ratnagiri Alphonso Mangoes", cat: "fruits", f: "Mango", e: "🥭", price: 499, unit: "6 pcs", rating: 5.0, tag: "Seasonal", c: "#ffecd1" },
    { id: 6, name: "Nashik Seedless Grapes", cat: "fruits", f: "Grapes", e: "🍇", price: 99, unit: "500 g", rating: 4.6, c: "#efe4fb" },
    // Vegetables
    { id: 7, name: "Ooty Carrots", cat: "vegetables", f: "Carrot", e: "🥕", price: 45, unit: "500 g", rating: 4.7, tag: "Organic", c: "#ffe9d6" },
    { id: 8, name: "Fresh Broccoli", cat: "vegetables", f: "Broccoli", e: "🥦", price: 79, old: 99, unit: "1 head", rating: 4.6, c: "#e1f3dc" },
    { id: 9, name: "Country Tomatoes", cat: "vegetables", f: "Tomato", e: "🍅", price: 38, unit: "1 kg", rating: 4.5, c: "#ffe1dc" },
    { id: 10, name: "Baby Spinach (Palak)", cat: "vegetables", f: "Leafy green", e: "🥬", price: 35, unit: "250 g", rating: 4.7, tag: "Organic", c: "#e3f5d8" },
    { id: 11, name: "Big Onions", cat: "vegetables", f: "Onion", e: "🧅", price: 42, old: 55, unit: "1 kg", rating: 4.6, c: "#f6e6dc" },
    { id: 12, name: "Fresh Potatoes", cat: "vegetables", f: "Potato", e: "🥔", price: 36, unit: "1 kg", rating: 4.5, c: "#f5ead6" },
    { id: 21, name: "Green Chillies", cat: "vegetables", f: "Hot pepper", e: "🌶️", price: 15, unit: "100 g", rating: 4.4, c: "#ffe3dc" },
    { id: 22, name: "Sweet Corn", cat: "vegetables", f: "Ear of corn", e: "🌽", price: 30, unit: "2 pcs", rating: 4.6, tag: "New", c: "#fff3c9" },
    // Dairy & eggs
    { id: 13, name: "Amul Taaza Toned Milk", brand: "Amul", cat: "dairy", f: "Glass of milk", e: "🥛", price: 27, unit: "500 ml", rating: 4.8, tag: "Bestseller", c: "#e6f0fb" },
    { id: 16, name: "Amul Butter (Pasteurised)", brand: "Amul", cat: "dairy", f: "Butter", e: "🧈", price: 58, unit: "100 g", rating: 4.9, c: "#fff5d1" },
    { id: 14, name: "Amul Cheese Slices", brand: "Amul", cat: "dairy", f: "Cheese wedge", e: "🧀", price: 145, old: 160, unit: "200 g · 10 slices", rating: 4.7, c: "#fff1c7" },
    { id: 23, name: "Mother Dairy Classic Dahi", brand: "Mother Dairy", cat: "dairy", f: "Bowl with spoon", e: "🥣", price: 50, unit: "400 g", rating: 4.6, c: "#eef3f8" },
    { id: 15, name: "Farm Free-range Eggs", brand: "FreshCart Farms", cat: "dairy", f: "Egg", e: "🥚", price: 110, unit: "12 pcs", rating: 4.9, c: "#f6efe4" },
    // Staples
    { id: 24, name: "Aashirvaad Shudh Chakki Atta", brand: "Aashirvaad", cat: "staples", f: "Flatbread", e: "🫓", price: 289, old: 315, unit: "5 kg", rating: 4.8, tag: "Bestseller", c: "#f8ecd6" },
    { id: 25, name: "India Gate Basmati Rice Classic", brand: "India Gate", cat: "staples", f: "Cooked rice", e: "🍚", price: 199, old: 235, unit: "1 kg", rating: 4.7, c: "#f1f1ea" },
    { id: 26, name: "Tata Sampann Toor Dal", brand: "Tata Sampann", cat: "staples", f: "Beans", e: "🫘", price: 179, unit: "1 kg", rating: 4.6, c: "#fbecd6" },
    { id: 27, name: "Fortune Sunlite Sunflower Oil", brand: "Fortune", cat: "staples", f: "Sunflower", e: "🌻", price: 155, old: 175, unit: "1 L pouch", rating: 4.5, tag: "Sale", c: "#fff4c9" },
    { id: 28, name: "Tata Salt Iodised", brand: "Tata", cat: "staples", f: "Salt", e: "🧂", price: 28, unit: "1 kg", rating: 4.8, c: "#eef2f6" },
    { id: 29, name: "Everest Garam Masala", brand: "Everest", cat: "staples", f: "Hot pepper", e: "🌶️", price: 82, unit: "100 g", rating: 4.7, c: "#fde2d6" },
    // Snacks
    { id: 30, name: "Maggi 2-Minute Masala Noodles", brand: "Maggi", cat: "snacks", f: "Steaming bowl", e: "🍜", price: 56, unit: "4 x 70 g", rating: 4.8, tag: "Bestseller", c: "#fff1c9" },
    { id: 31, name: "Parle-G Gold Biscuits", brand: "Parle", cat: "snacks", f: "Cookie", e: "🍪", price: 30, unit: "200 g", rating: 4.7, c: "#fbe9cf" },
    { id: 32, name: "Cadbury Dairy Milk Silk", brand: "Cadbury", cat: "snacks", f: "Chocolate bar", e: "🍫", price: 95, unit: "60 g", rating: 4.9, c: "#efe1f7" },
    { id: 33, name: "Act II Butter Lovers Popcorn", brand: "Act II", cat: "snacks", f: "Popcorn", e: "🍿", price: 40, old: 50, unit: "3 x 30 g", rating: 4.4, c: "#fdeedd" },
    { id: 34, name: "Kwality Wall's Cornetto", brand: "Kwality Wall's", cat: "snacks", f: "Soft ice cream", e: "🍦", price: 45, unit: "105 ml", rating: 4.6, tag: "New", c: "#fbe6ea" },
    // Beverages
    { id: 35, name: "Tata Tea Gold", brand: "Tata Tea", cat: "beverages", f: "Teacup without handle", e: "🍵", price: 285, old: 320, unit: "500 g", rating: 4.8, c: "#e5f2dc" },
    { id: 36, name: "Bru Instant Coffee", brand: "Bru", cat: "beverages", f: "Hot beverage", e: "☕", price: 230, unit: "100 g jar", rating: 4.7, c: "#f1e5dc" },
    { id: 37, name: "Real Fruit Power Mixed Fruit", brand: "Real", cat: "beverages", f: "Beverage box", e: "🧃", price: 125, unit: "1 L", rating: 4.5, c: "#ffe9d2" },
    { id: 38, name: "Coca-Cola Original", brand: "Coca-Cola", cat: "beverages", f: "Cup with straw", e: "🥤", price: 40, unit: "750 ml", rating: 4.6, c: "#fde0e0" },
    { id: 39, name: "Tender Coconut", brand: "Farm fresh", cat: "beverages", f: "Coconut", e: "🥥", price: 55, unit: "1 pc", rating: 4.8, tag: "Fresh", c: "#e9f1e3" },
    // Bakery
    { id: 17, name: "Artisan Sourdough Loaf", brand: "FreshCart Bakehouse", cat: "bakery", f: "Bread", e: "🍞", price: 149, unit: "400 g", rating: 4.8, tag: "Fresh", c: "#f8e8d4" },
    { id: 18, name: "Butter Croissant", brand: "FreshCart Bakehouse", cat: "bakery", f: "Croissant", e: "🥐", price: 79, old: 99, unit: "2 pcs", rating: 4.9, c: "#fdebd2" },
    { id: 19, name: "French Baguette", brand: "FreshCart Bakehouse", cat: "bakery", f: "Baguette bread", e: "🥖", price: 99, unit: "1 pc", rating: 4.5, c: "#f6e6cf" },
    { id: 20, name: "Soft Pretzel", brand: "FreshCart Bakehouse", cat: "bakery", f: "Pretzel", e: "🥨", price: 69, unit: "2 pcs", rating: 4.4, c: "#f9e3cc" },
    // Household
    { id: 40, name: "Dove Cream Beauty Bathing Bar", brand: "Dove", cat: "household", f: "Soap", e: "🧼", price: 189, old: 215, unit: "3 x 100 g", rating: 4.8, c: "#e6effa" },
    { id: 41, name: "Surf Excel Easy Wash Detergent", brand: "Surf Excel", cat: "household", f: "Bubbles", e: "🫧", price: 140, unit: "1 kg", rating: 4.6, c: "#e3f0fb" },
    { id: 42, name: "Vim Lemon Dishwash Gel", brand: "Vim", cat: "household", f: "Sponge", e: "🧽", price: 105, unit: "500 ml", rating: 4.5, c: "#fbf3cc" },
    { id: 43, name: "Origami Toilet Tissue Rolls", brand: "Origami", cat: "household", f: "Roll of paper", e: "🧻", price: 160, old: 199, unit: "4 rolls", rating: 4.4, tag: "Sale", c: "#f2f1ee" },
    { id: 44, name: "Colgate Slim Soft Toothbrush", brand: "Colgate", cat: "household", f: "Toothbrush", e: "🪥", price: 99, unit: "pack of 2", rating: 4.6, c: "#e5f3f7" },

    { id: 99, name: "Weekend Harvest Box", cat: "bundle", f: "Basket", e: "🧺", price: 899, old: 1499, unit: "Family pack", rating: 5.0, c: "#e6f4d4", hidden: true },
  ];
  // Every item gets a brand label and a live stock count.
  PRODUCTS.forEach((p) => {
    p.brand ??= "Farm fresh";
    p.stock = p.hidden ? 50 : 4 + Math.floor(Math.random() * 34);
    p.maxStock = 40;
  });
  const byId = Object.fromEntries(PRODUCTS.map((p) => [p.id, p]));

  const CATEGORIES = [
    { name: "Fresh Fruits", f: "Red apple", e: "🍎", count: "120+ items", c: "#ffe1dc", filter: "fruits" },
    { name: "Vegetables", f: "Broccoli", e: "🥦", count: "180+ items", c: "#dff2d6", filter: "vegetables" },
    { name: "Dairy & Eggs", f: "Glass of milk", e: "🥛", count: "60+ items", c: "#e3eefb", filter: "dairy" },
    { name: "Atta, Rice & Dal", f: "Sheaf of rice", e: "🌾", count: "250+ items", c: "#fff0c4", filter: "staples" },
    { name: "Snacks & Munchies", f: "Cookie", e: "🍪", count: "300+ items", c: "#fbe6d4", filter: "snacks" },
    { name: "Tea, Coffee & Drinks", f: "Hot beverage", e: "☕", count: "90+ items", c: "#ece3fa", filter: "beverages" },
    { name: "Bakery", f: "Croissant", e: "🥐", count: "45+ items", c: "#fdebd2", filter: "bakery" },
    { name: "Home & Hygiene", f: "Soap", e: "🧼", count: "150+ items", c: "#dcf0f5", filter: "household" },
  ];

  const RING = [5, 24, 1, 30, 4, 16, 2, 35, 8, 32];

  const REVIEWS = [
    { name: "Priya Raman", city: "Chennai", text: "The mangoes tasted like they came straight from my grandmother's garden. Delivery was faster than my chai brewing!" },
    { name: "Arjun Mehta", city: "Bengaluru", text: "Finally a grocery app that feels premium. Everything arrives perfectly packed and the vegetables stay fresh for days." },
    { name: "Kavya Iyer", city: "Coimbatore", text: "I love the Weekend Harvest Box. It's become our family's Saturday ritual, and the kids fight over the strawberries." },
    { name: "Rahul Sharma", city: "Hyderabad", text: "Ordered at 9:42, door bell rang at 9:55. The cold-chain delivery means my milk and cheese are always chilled." },
    { name: "Meera Nair", city: "Kochi", text: "Supporting local farmers while getting organic produce at fair prices. FreshCart has completely replaced my weekly market run." },
    { name: "Vikram Das", city: "Pune", text: "The app is so smooth and beautiful. Reordering my usual basket takes literally ten seconds. Brilliant service." },
  ];

  /* ---------- Cart & wishlist state ---------- */
  const store = {
    get(k, d) { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
  };
  let cart = store.get("fc-cart", {});
  let wish = new Set(store.get("fc-wish", []));
  const FREE_SHIP = 499;
  const DELIVERY_FEE = 29;

  /* ---------- Static images in markup ---------- */
  $$("img.fimg[data-f]").forEach((el) => {
    el.addEventListener("error", () => fallback(el), { once: true });
    el.src = FE(el.dataset.f);
  });

  /* ---------- Preloader ---------- */
  const loader = $("#loader");
  const bar = $("#loaderBar");
  document.body.classList.add("loading");
  const heroImgs = $$(".hero img");
  let loaded = 0;
  const bump = () => {
    loaded++;
    bar.style.width = Math.min(100, (loaded / heroImgs.length) * 100) + "%";
  };
  heroImgs.forEach((i) => (i.complete ? bump() : (i.addEventListener("load", bump, { once: true }), i.addEventListener("error", bump, { once: true }))));
  const start = performance.now();
  const finish = () => {
    bar.style.width = "100%";
    const wait = Math.max(0, 900 - (performance.now() - start));
    setTimeout(() => {
      loader.classList.add("done");
      document.body.classList.remove("loading");
      document.body.classList.add("ready");
      runCounters();
    }, wait);
  };
  if (document.readyState === "complete") finish();
  else window.addEventListener("load", finish);
  setTimeout(() => !document.body.classList.contains("ready") && finish(), 4000);

  /* ---------- Custom cursor ---------- */
  if (!isTouch) {
    const cur = $("#cursor"), dot = $("#cursorDot");
    let mx = innerWidth / 2, my = innerHeight / 2, cx = mx, cy = my;
    addEventListener("pointermove", (e) => {
      mx = e.clientX; my = e.clientY;
      dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%, -50%)`;
    });
    (function loop() {
      cx += (mx - cx) * 0.18; cy += (my - cy) * 0.18;
      cur.style.transform = `translate(${cx}px, ${cy}px) translate(-50%, -50%)`;
      requestAnimationFrame(loop);
    })();
    document.addEventListener("pointerover", (e) => {
      cur.classList.toggle("hover", !!e.target.closest("a, button, .cat, .product, input, .ring-stage"));
    });
  }

  /* ---------- Nav, progress, back-to-top ---------- */
  const nav = $("#nav");
  const progress = $("#scrollProgress");
  const toTop = $("#toTop");
  let lastY = 0;
  const onScroll = () => {
    const y = scrollY;
    const max = document.documentElement.scrollHeight - innerHeight;
    progress.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
    nav.classList.toggle("scrolled", y > 30);
    const searchOpen = $("#searchPanel").classList.contains("open");
    const menuOpen = $("#navLinks").classList.contains("open");
    nav.classList.toggle("hidden", y > lastY && y > 500 && !searchOpen && !menuOpen);
    toTop.classList.toggle("show", y > 800);
    lastY = y;
  };
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  toTop.addEventListener("click", () => scrollTo({ top: 0, behavior: "smooth" }));

  // active link highlight
  const links = $$(".nav-links a");
  const sectionObs = new IntersectionObserver(
    (entries) => entries.forEach((en) => {
      if (en.isIntersecting) links.forEach((a) => a.classList.toggle("active", a.getAttribute("href") === "#" + en.target.id));
    }),
    { rootMargin: "-45% 0px -50% 0px" }
  );
  $$("main section[id]").forEach((s) => sectionObs.observe(s));

  // mobile menu
  const burger = $("#burger"), navLinks = $("#navLinks");
  burger.addEventListener("click", () => {
    burger.classList.toggle("open");
    navLinks.classList.toggle("open");
  });
  links.forEach((a) => a.addEventListener("click", () => { burger.classList.remove("open"); navLinks.classList.remove("open"); }));

  /* ---------- Hero 3D parallax ---------- */
  const hero = $(".hero"), scene = $("#heroScene .scene");
  if (!isTouch && !reduceMotion) {
    let tx = 0, ty = 0, x = 0, y = 0;
    hero.addEventListener("pointermove", (e) => {
      const r = hero.getBoundingClientRect();
      tx = (e.clientX - r.left) / r.width - 0.5;
      ty = (e.clientY - r.top) / r.height - 0.5;
    });
    hero.addEventListener("pointerleave", () => { tx = 0; ty = 0; });
    (function loop() {
      x += (tx - x) * 0.07; y += (ty - y) * 0.07;
      scene.style.transform = `rotateY(${x * 14}deg) rotateX(${-y * 12}deg)`;
      $$("[data-depth]", scene).forEach((el) => {
        const d = +el.dataset.depth;
        el.style.transform = `translate3d(${x * d * 0.6}px, ${y * d * 0.6}px, ${d * 0.5}px)`;
      });
      requestAnimationFrame(loop);
    })();
  }

  /* ---------- Counters ---------- */
  function runCounters() {
    $$("[data-count]").forEach((el) => {
      const target = +el.dataset.count, dec = +(el.dataset.decimal || 0);
      const t0 = performance.now(), dur = 1800;
      const step = (t) => {
        const p = Math.min(1, (t - t0) / dur);
        const v = target * (1 - Math.pow(1 - p, 4));
        el.textContent = v.toFixed(dec);
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });
  }

  /* ---------- Marquee ---------- */
  const mItems = [["Avocado", "🥑", "Farm fresh"], ["Strawberry", "🍓", "Hand-picked daily"], ["Carrot", "🥕", "100% organic"], ["Croissant", "🥐", "Baked at dawn"], ["Lemon", "🍋", "Zero pesticides"], ["Glass of milk", "🥛", "Cold-chain delivery"], ["Watermelon", "🍉", "Delivered in 15 min"]];
  const mHtml = mItems.map(([f, e, t]) => `<span class="marquee-item">${img(f, e)}${t}<span class="star">✦</span></span>`).join("");
  $("#marquee").innerHTML = mHtml + mHtml;

  /* ---------- 3D tilt ---------- */
  function tilt(el, max = 10) {
    if (isTouch || reduceMotion) return;
    if (!$(".glare", el)) el.insertAdjacentHTML("beforeend", '<span class="glare"></span>');
    el.addEventListener("pointermove", (e) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
      el.style.transition = "transform .12s ease-out";
      el.style.transform = `rotateX(${(0.5 - py) * max}deg) rotateY(${(px - 0.5) * max}deg) translateY(-6px)`;
      el.style.setProperty("--gx", px * 100 + "%");
      el.style.setProperty("--gy", py * 100 + "%");
    });
    el.addEventListener("pointerleave", () => {
      el.style.transition = "transform .7s cubic-bezier(.22,1,.36,1)";
      el.style.transform = "";
    });
  }
  $$(".tilt").forEach((el) => tilt(el, +el.dataset.tiltMax || 10));

  /* ---------- Categories ---------- */
  const catGrid = $("#catGrid");
  catGrid.innerHTML = CATEGORIES.map((c, i) => `
    <div class="cat reveal tilt" style="--c:${c.c};--d:${i % 4}" data-filter="${c.filter || ""}" tabindex="0">
      <div><h3>${c.name}</h3><small>${c.count}</small></div>
      <span class="cat-arrow"><svg viewBox="0 0 24 24"><path d="M7 17 17 7M8 7h9v9"/></svg></span>
      ${img(c.f, c.e, "cat-img")}
    </div>`).join("");
  $$(".cat", catGrid).forEach((el) => {
    tilt(el, 14);
    const go = () => {
      const f = el.dataset.filter;
      if (!f) return toast(`${$("h3", el).textContent} aisle is coming soon`, "⏳");
      setFilter(f);
      $("#shop").scrollIntoView({ behavior: "smooth" });
    };
    el.addEventListener("click", go);
    el.addEventListener("keydown", (e) => e.key === "Enter" && go());
  });

  /* ---------- Products ---------- */
  const grid = $("#productGrid");
  const heart = '<svg viewBox="0 0 24 24"><path d="M12 20s-7-4.4-9-9.2C1.6 7.3 4 4 7.4 4c2 0 3.4 1 4.6 2.6C13.2 5 14.6 4 16.6 4 20 4 22.4 7.3 21 10.8 19 15.6 12 20 12 20Z"/></svg>';
  const eye = '<svg viewBox="0 0 24 24"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></svg>';
  const plus = '<svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>';

  const tagClass = (t) => (t === "Sale" ? "sale" : t === "New" ? "new" : "");
  const footHtml = (p) =>
    cart[p.id]
      ? `<div class="qty"><button data-act="dec" aria-label="Decrease">−</button><span>${cart[p.id]}</span><button data-act="inc" aria-label="Increase">+</button></div>`
      : `<button class="add-btn" data-act="add">${plus}<span class="lbl">Add</span></button>`;
  const priceHtml = (p) => `<b>${money(p.price)}</b>${p.old ? `<s>${money(p.old)}</s>` : ""}`;
  const stockHtml = (p) => {
    const low = p.stock <= 8;
    const pct = Math.min(100, (p.stock / p.maxStock) * 100);
    return `<div class="p-stock ${low ? "low" : ""}">
      <div class="p-stock-bar"><span style="width:${pct}%"></span></div>
      <small><span>${low ? "🔥 Selling fast" : "In stock"}</span><b>${low ? `Only ${p.stock} left` : `${p.stock} left`}</b></small>
    </div>`;
  };

  grid.innerHTML = PRODUCTS.filter((p) => !p.hidden).map((p, i) => `
    <article class="product reveal" data-id="${p.id}" data-cat="${p.cat}" style="--d:${i % 4}">
      <div class="p-media" style="--c:${p.c}">
        ${p.tag ? `<span class="p-tag ${tagClass(p.tag)}">${p.tag}</span>` : ""}
        <button class="p-wish ${wish.has(p.id) ? "on" : ""}" data-act="wish" aria-label="Add to wishlist">${heart}</button>
        <button class="p-quick" data-act="quick" aria-label="Quick view">${eye}</button>
        ${img(p.f, p.e)}
        <span class="p-live"></span>
      </div>
      <div class="p-body">
        <div class="p-meta"><span>${p.brand}</span><span class="p-rating">★ ${p.rating.toFixed(1)}</span></div>
        <h3>${p.name}</h3>
        <span class="p-unit">${p.unit}</span>
        ${stockHtml(p)}
        <div class="p-foot">
          <div class="p-price">${priceHtml(p)}</div>
          <div class="p-action">${footHtml(p)}</div>
        </div>
      </div>
    </article>`).join("");
  $$(".product", grid).forEach((el) => tilt(el, 8));

  grid.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-act]");
    if (!btn) return;
    const card = btn.closest(".product");
    const id = +card.dataset.id;
    const act = btn.dataset.act;
    if (act === "add" || act === "inc") {
      ripple(btn, e);
      addToCart(id, $(".p-media img, .p-media .emoji-fallback", card));
    } else if (act === "dec") changeQty(id, -1);
    else if (act === "wish") toggleWish(id, btn);
    else if (act === "quick") openModal(id);
  });

  function refreshCard(id) {
    const card = grid.querySelector(`.product[data-id="${id}"] .p-action`);
    if (card) card.innerHTML = footHtml(byId[id]);
  }

  // Filters with sliding glider + "show more"
  const PAGE = 12;
  const filters = $("#filters"), glider = $("#filterGlider");
  const moreWrap = $("#moreWrap"), moreBtn = $("#moreBtn"), moreLabel = $("#moreLabel");
  let currentFilter = "all", expanded = false;
  const moveGlider = () => {
    const a = $("button.active", filters);
    glider.style.width = a.offsetWidth + "px";
    glider.style.transform = `translateX(${a.offsetLeft}px)`;
  };
  function applyFilter(animate) {
    let i = 0, total = 0;
    $$(".product", grid).forEach((el) => {
      const match = currentFilter === "all" || el.dataset.cat === currentFilter;
      if (match) total++;
      const show = match && (expanded || total <= PAGE);
      const wasHidden = el.classList.contains("hide");
      el.classList.toggle("hide", !show);
      if (animate && show && (wasHidden || !expanded)) {
        el.classList.remove("pop");
        void el.offsetWidth;
        el.style.setProperty("--i", Math.min(i++, 12));
        el.classList.add("pop", "in");
      }
    });
    moreWrap.classList.toggle("hide", total <= PAGE);
    moreBtn.classList.toggle("open", expanded);
    moreLabel.textContent = expanded ? "Show less" : `Show all ${total} products`;
  }
  function setFilter(f) {
    currentFilter = f;
    expanded = false;
    $$("button", filters).forEach((b) => b.classList.toggle("active", b.dataset.filter === f));
    moveGlider();
    const a = $("button.active", filters);
    a.parentElement.parentElement.scrollTo({ left: a.offsetLeft - 40, behavior: "smooth" });
    applyFilter(true);
  }
  filters.addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (b) setFilter(b.dataset.filter);
  });
  moreBtn.addEventListener("click", () => {
    expanded = !expanded;
    applyFilter(true);
    if (!expanded) $("#shop").scrollIntoView({ behavior: "smooth" });
  });
  addEventListener("resize", moveGlider);
  addEventListener("load", moveGlider);
  moveGlider();
  applyFilter(false);

  function ripple(btn, e) {
    const r = btn.getBoundingClientRect();
    const s = Math.max(r.width, r.height);
    const span = document.createElement("span");
    span.className = "ripple";
    span.style.cssText = `width:${s}px;height:${s}px;left:${e.clientX - r.left - s / 2}px;top:${e.clientY - r.top - s / 2}px`;
    btn.appendChild(span);
    setTimeout(() => span.remove(), 700);
  }

  /* ---------- Wishlist ---------- */
  const wishCount = $("#wishCount");
  function renderWish() {
    wishCount.textContent = wish.size;
    wishCount.classList.toggle("show", wish.size > 0);
  }
  function toggleWish(id, btn) {
    if (wish.has(id)) { wish.delete(id); toast("Removed from wishlist", "♡"); }
    else { wish.add(id); toast(`${byId[id].name} saved to wishlist`, "♥"); }
    btn.classList.toggle("on", wish.has(id));
    store.set("fc-wish", [...wish]);
    renderWish();
  }
  $("#wishBtn").addEventListener("click", () => {
    if (!wish.size) return toast("Your wishlist is empty", "♡");
    toast(`${wish.size} item${wish.size > 1 ? "s" : ""} in your wishlist`, "♥");
  });

  /* ---------- Cart ---------- */
  const cartBtn = $("#cartBtn"), cartCount = $("#cartCount");
  const drawer = $("#drawer"), overlay = $("#overlay"), dItems = $("#drawerItems");

  function addToCart(id, fromEl, silent) {
    if ((cart[id] || 0) >= byId[id].stock) return toast(`Only ${byId[id].stock} left in stock`, "!");
    cart[id] = (cart[id] || 0) + 1;
    persist();
    if (fromEl) flyToCart(fromEl);
    if (!silent && cart[id] === 1) toast(`${byId[id].name} added to basket`, "✓");
  }
  function changeQty(id, d) {
    cart[id] = (cart[id] || 0) + d;
    if (cart[id] <= 0) delete cart[id];
    persist();
  }
  function persist() {
    store.set("fc-cart", cart);
    renderCart();
    Object.keys(byId).forEach((id) => refreshCard(+id));
  }

  function renderCart() {
    const ids = Object.keys(cart).map(Number).filter((id) => byId[id]);
    const count = ids.reduce((s, id) => s + cart[id], 0);
    const sub = ids.reduce((s, id) => s + cart[id] * byId[id].price, 0);
    const del = sub === 0 || sub >= FREE_SHIP ? 0 : DELIVERY_FEE;
    cartCount.textContent = count;
    $("#drawerCount").textContent = `(${count})`;
    $("#subtotal").textContent = money(sub);
    $("#delivery").textContent = del ? money(del) : sub ? "FREE" : money(0);
    $("#total").textContent = money(sub + del);
    $("#freeShipBar").style.width = Math.min(100, (sub / FREE_SHIP) * 100) + "%";
    $("#freeShipText").innerHTML = sub >= FREE_SHIP
      ? "🎉 You've unlocked <b>free delivery</b>!"
      : `Add <b>${money(FREE_SHIP - sub)}</b> more for free delivery`;

    dItems.innerHTML = ids.length
      ? ids.map((id) => {
          const p = byId[id];
          return `<div class="d-item" data-id="${id}">
            <div class="d-thumb" style="--c:${p.c}">${img(p.f, p.e, "", false)}</div>
            <div class="d-info"><b>${p.name}</b><small>${p.unit}</small><div class="d-price">${money(p.price * cart[id])}</div></div>
            <div class="d-qty"><button data-d="-1" aria-label="Decrease">−</button><span>${cart[id]}</span><button data-d="1" aria-label="Increase">+</button></div>
          </div>`;
        }).join("")
      : `<div class="d-empty"><div>🧺</div><b>Your basket is empty</b>Let's fill it with something fresh!</div>`;
  }
  dItems.addEventListener("click", (e) => {
    const b = e.target.closest("[data-d]");
    if (!b) return;
    const row = b.closest(".d-item"), id = +row.dataset.id, d = +b.dataset.d;
    if (d < 0 && cart[id] === 1) {
      row.classList.add("removing");
      setTimeout(() => changeQty(id, -1), 350);
    } else changeQty(id, d);
  });

  const openDrawer = () => { drawer.classList.add("open"); overlay.classList.add("show"); };
  const closeDrawer = () => { drawer.classList.remove("open"); overlay.classList.remove("show"); };
  cartBtn.addEventListener("click", openDrawer);
  $("#closeDrawer").addEventListener("click", closeDrawer);
  overlay.addEventListener("click", closeDrawer);
  $("#checkoutBtn").addEventListener("click", () => {
    if (!Object.keys(cart).length) return toast("Add something to your basket first", "🧺");
    cart = {};
    persist();
    closeDrawer();
    toast("Order placed! Arriving in 15 minutes 🛵", "✓");
    confetti();
  });

  function flyToCart(src) {
    if (reduceMotion) return bumpCart();
    const r = src.getBoundingClientRect();
    const t = cartBtn.getBoundingClientRect();
    const clone = src.cloneNode(true);
    clone.classList.add("fly");
    clone.removeAttribute("loading");
    Object.assign(clone.style, { left: r.left + "px", top: r.top + "px", width: r.width + "px", height: r.height + "px", margin: 0, transform: "none" });
    document.body.appendChild(clone);
    const dx = t.left + t.width / 2 - (r.left + r.width / 2);
    const dy = t.top + t.height / 2 - (r.top + r.height / 2);
    clone.animate(
      [
        { transform: "translate(0,0) scale(1) rotate(0)", opacity: 1 },
        { transform: `translate(${dx * 0.4}px, ${dy * 0.4 - 120}px) scale(.7) rotate(-20deg)`, opacity: 1, offset: 0.45 },
        { transform: `translate(${dx}px, ${dy}px) scale(.12) rotate(20deg)`, opacity: 0.4 },
      ],
      { duration: 900, easing: "cubic-bezier(.5,0,.3,1)" }
    ).onfinish = () => { clone.remove(); bumpCart(); };
  }
  function bumpCart() {
    cartBtn.classList.remove("bump");
    void cartBtn.offsetWidth;
    cartBtn.classList.add("bump");
  }

  /* ---------- Search ---------- */
  const searchPanel = $("#searchPanel"), searchInput = $("#searchInput"), results = $("#searchResults");
  const openSearch = () => { searchPanel.classList.add("open"); nav.classList.remove("hidden"); setTimeout(() => searchInput.focus(), 100); };
  const closeSearch = () => { searchPanel.classList.remove("open"); searchInput.value = ""; results.innerHTML = ""; };
  $("#searchToggle").addEventListener("click", () => (searchPanel.classList.contains("open") ? closeSearch() : openSearch()));
  searchInput.addEventListener("input", () => {
    const q = searchInput.value.trim().toLowerCase();
    if (!q) return (results.innerHTML = "");
    const hits = PRODUCTS.filter((p) => (p.name + " " + p.cat + " " + p.brand).toLowerCase().includes(q));
    results.innerHTML = hits.length
      ? hits.map((p) => `<div class="sr-item" data-id="${p.id}">${img(p.f, p.e, "", false)}<div><b>${p.name}</b><small>${p.brand} · ${p.unit}</small></div><b class="p">${money(p.price)}</b></div>`).join("")
      : `<div class="sr-empty"></div>`;
    const empty = $(".sr-empty", results);
    if (empty) empty.textContent = `No results for “${searchInput.value}”. Try “amul”, “atta” or “maggi”.`;
  });
  results.addEventListener("click", (e) => {
    const it = e.target.closest(".sr-item");
    if (!it) return;
    closeSearch();
    openModal(+it.dataset.id);
  });

  /* ---------- Quick view modal ---------- */
  const modal = $("#modal"), modalCard = $("#modalCard");
  const DESC = {
    fruits: "Sourced fresh this morning from certified partner farms. Hand-checked for ripeness and delivered in temperature-controlled bags.",
    vegetables: "Harvested within 24 hours by our partner farmers, washed, sorted and packed fresh for your kitchen.",
    dairy: "Kept in an unbroken cold chain from the dairy to your doorstep, so it stays fresh and chilled.",
    staples: "Genuine brand-sealed pack sourced directly from the manufacturer. Long shelf life and best-before date checked.",
    snacks: "Genuine brand-sealed pack sourced directly from the manufacturer. Perfect for tea-time cravings.",
    beverages: "Original brand product stored in clean, dry conditions and delivered with care.",
    bakery: "Baked at dawn in our partner bakehouse with no preservatives. Best enjoyed within two days.",
    household: "100% genuine product sourced directly from the brand. Sealed and quality checked before dispatch.",
    bundle: "A curated family box of seasonal fruits, vegetables, free-range eggs and fresh sourdough.",
  };
  const CHIP = { fruits: "🌱 Farm fresh", vegetables: "🌱 Farm fresh", dairy: "❄️ Chilled", bakery: "🥖 Baked today", bundle: "🌱 Farm fresh" };
  function openModal(id) {
    const p = byId[id];
    modalCard.innerHTML = `
      <button class="icon-btn m-close" aria-label="Close"><svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18"/></svg></button>
      <div class="m-media" style="--c:${p.c}">${img(p.f, p.e, "", false)}</div>
      <div class="m-body">
        <span class="eyebrow">${p.brand}</span>
        <h3>${p.name}</h3>
        <div class="m-live">
          <span>👀 <b class="m-viewers">${8 + Math.floor(Math.random() * 30)}</b> people viewing</span>
          <span>🛒 <b>${20 + Math.floor(Math.random() * 120)}</b> bought in last hour</span>
          <span>📦 <b>${p.stock}</b> left</span>
        </div>
        <div class="p-rating">★★★★★ <span>${p.rating.toFixed(1)} · 2.4k reviews</span></div>
        <div class="m-price">${money(p.price)}${p.old ? `<s>${money(p.old)}</s>` : ""}</div>
        <p>${DESC[p.cat] || DESC.fruits}</p>
        <div class="m-chips"><span>${CHIP[p.cat] || "✅ Quality checked"}</span><span>📦 ${p.unit}</span><span>⚡ 15-min delivery</span></div>
        <button class="btn btn-primary m-add">Add to basket · ${money(p.price)}</button>
      </div>`;
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    clearInterval(viewersTimer);
    viewersTimer = setInterval(() => {
      const v = $(".m-viewers", modalCard);
      if (v) v.textContent = Math.max(3, +v.textContent + Math.round(Math.random() * 4 - 2));
    }, 2000);
    $(".m-close", modalCard).onclick = closeModal;
    $(".m-add", modalCard).onclick = () => {
      addToCart(id, $(".m-media img, .m-media .emoji-fallback", modalCard));
      setTimeout(closeModal, 250);
    };
  }
  let viewersTimer;
  function closeModal() { clearInterval(viewersTimer); modal.classList.remove("open"); modal.setAttribute("aria-hidden", "true"); }
  modal.addEventListener("click", (e) => e.target === modal && closeModal());

  addEventListener("keydown", (e) => {
    if (e.key === "Escape") { closeModal(); closeDrawer(); closeSearch(); }
    if (e.key === "/" && !/input|textarea/i.test(document.activeElement.tagName)) { e.preventDefault(); openSearch(); }
  });

  /* ---------- Deal: countdown, add, draggable cube ---------- */
  const cd = { h: $("#cdH"), m: $("#cdM"), s: $("#cdS") };
  function tickCountdown() {
    const now = new Date();
    const end = new Date(now); end.setHours(23, 59, 59, 999);
    let diff = Math.max(0, Math.floor((end - now) / 1000));
    const vals = { h: Math.floor(diff / 3600), m: Math.floor((diff % 3600) / 60), s: diff % 60 };
    for (const k in vals) {
      const v = String(vals[k]).padStart(2, "0");
      if (cd[k].textContent !== v) {
        cd[k].textContent = v;
        cd[k].classList.remove("tick"); void cd[k].offsetWidth; cd[k].classList.add("tick");
      }
    }
  }
  tickCountdown();
  setInterval(tickCountdown, 1000);
  $("#dealBtn").addEventListener("click", () => addToCart(99, $("#box3d .front img, #box3d .front .emoji-fallback")));

  const box = $("#box3d");
  (() => {
    let dragging = false, sx = 0, sy = 0, rx = -22, ry = -30;
    box.addEventListener("pointerdown", (e) => {
      dragging = true; sx = e.clientX; sy = e.clientY;
      const m = new DOMMatrixReadOnly(getComputedStyle(box).transform);
      ry = Math.atan2(-m.m31, m.m33) * (180 / Math.PI);
      box.classList.add("dragging");
      box.style.animation = "none";
      box.setPointerCapture(e.pointerId);
    });
    box.addEventListener("pointermove", (e) => {
      if (!dragging) return;
      const cy = ry + (e.clientX - sx) * 0.5;
      const cx = Math.max(-70, Math.min(70, rx - (e.clientY - sy) * 0.5));
      box.style.transform = `rotateX(${cx}deg) rotateY(${cy}deg)`;
    });
    const end = () => { dragging = false; box.classList.remove("dragging"); };
    box.addEventListener("pointerup", end);
    box.addEventListener("pointercancel", end);
  })();

  /* ---------- 3D carousel ring ---------- */
  const ring = $("#ring"), stage = $("#ringStage");
  ring.innerHTML = RING.map((id) => {
    const p = byId[id];
    return `<div class="ring-card" style="--c:${p.c}" data-id="${id}">
      ${img(p.f, p.e)}
      <div style="text-align:center"><h4>${p.name}</h4><small>${p.unit}</small></div>
      <div class="rc-foot"><b>${money(p.price)}</b><button class="mini-add" aria-label="Add ${p.name}">+</button></div>
    </div>`;
  }).join("");
  const ringCards = $$(".ring-card", ring);
  const step = 360 / ringCards.length;
  let radius = 0;
  const layoutRing = () => {
    const w = ring.offsetWidth;
    radius = Math.round(w / 2 / Math.tan(Math.PI / ringCards.length)) + 40;
    ringCards.forEach((c, i) => (c.style.transform = `rotateY(${i * step}deg) translateZ(${radius}px)`));
  };
  layoutRing();
  addEventListener("resize", layoutRing);

  let angle = 0, vel = 0, target = null, ringDrag = false, lastX = 0, ringVisible = false;
  new IntersectionObserver(([en]) => (ringVisible = en.isIntersecting)).observe(stage);
  stage.addEventListener("pointerdown", (e) => {
    if (e.target.closest(".mini-add")) return;
    ringDrag = true; lastX = e.clientX; target = null;
    stage.classList.add("dragging");
    stage.setPointerCapture(e.pointerId);
  });
  stage.addEventListener("pointermove", (e) => {
    if (!ringDrag) return;
    const dx = e.clientX - lastX; lastX = e.clientX;
    vel = dx * 0.25; angle += vel;
  });
  const endRing = () => { ringDrag = false; stage.classList.remove("dragging"); };
  stage.addEventListener("pointerup", endRing);
  stage.addEventListener("pointercancel", endRing);
  const snap = (dir) => { target = (Math.round(angle / step) + dir) * step; };
  $("#ringPrev").addEventListener("click", () => snap(1));
  $("#ringNext").addEventListener("click", () => snap(-1));
  ring.addEventListener("click", (e) => {
    const b = e.target.closest(".mini-add");
    if (!b) return;
    const card = b.closest(".ring-card");
    addToCart(+card.dataset.id, $("img, .emoji-fallback", card));
  });
  (function ringLoop() {
    if (ringVisible) {
      if (target !== null) {
        angle += (target - angle) * 0.1;
        if (Math.abs(target - angle) < 0.05) { angle = target; target = null; }
      } else if (!ringDrag) {
        vel *= 0.95;
        angle += Math.abs(vel) > 0.05 ? vel : (reduceMotion ? 0 : -0.12);
      }
      ring.style.transform = `translateZ(${-radius}px) rotateY(${angle}deg)`;
      ringCards.forEach((c, i) => {
        let a = (((i * step + angle) % 360) + 360) % 360;
        if (a > 180) a = 360 - a;
        c.style.filter = `brightness(${1 - (a / 180) * 0.35})`;
      });
    }
    requestAnimationFrame(ringLoop);
  })();

  /* ---------- Testimonials ---------- */
  const tTrack = $("#tTrack"), tDots = $("#tDots");
  tTrack.innerHTML = REVIEWS.map((r) => `
    <div class="t-card">
      <div class="t-stars">★★★★★</div>
      <p>“${r.text}”</p>
      <div class="t-user"><span>${r.name.split(" ").map((w) => w[0]).join("")}</span><div><b>${r.name}</b><small>${r.city}</small></div></div>
    </div>`).join("");
  let tIndex = 0, tTimer;
  const perView = () => (innerWidth <= 640 ? 1 : innerWidth <= 1100 ? 2 : 3);
  const pages = () => REVIEWS.length - perView() + 1;
  function renderDots() {
    tDots.innerHTML = Array.from({ length: pages() }, (_, i) => `<button aria-label="Slide ${i + 1}" class="${i === tIndex ? "active" : ""}"></button>`).join("");
  }
  function goT(i) {
    tIndex = (i + pages()) % pages();
    const card = $(".t-card", tTrack);
    tTrack.style.transform = `translateX(-${tIndex * (card.offsetWidth + 24)}px)`;
    $$("button", tDots).forEach((b, j) => b.classList.toggle("active", j === tIndex));
  }
  const autoT = () => { clearInterval(tTimer); tTimer = setInterval(() => goT(tIndex + 1), 4500); };
  tDots.addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (b) { goT([...tDots.children].indexOf(b)); autoT(); }
  });
  renderDots(); autoT();
  addEventListener("resize", () => { tIndex = Math.min(tIndex, pages() - 1); renderDots(); goT(tIndex); });

  /* ---------- Scroll reveal ---------- */
  const revealObs = new IntersectionObserver(
    (entries) => entries.forEach((en) => {
      if (en.isIntersecting) { en.target.classList.add("in"); revealObs.unobserve(en.target); }
    }),
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
  );
  $$(".reveal").forEach((el) => revealObs.observe(el));

  /* ---------- Magnetic buttons ---------- */
  if (!isTouch && !reduceMotion) {
    $$(".magnetic").forEach((el) => {
      el.addEventListener("pointermove", (e) => {
        const r = el.getBoundingClientRect();
        el.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.25}px, ${(e.clientY - r.top - r.height / 2) * 0.35}px)`;
      });
      el.addEventListener("pointerleave", () => (el.style.transform = ""));
    });
  }

  /* ---------- Forms ---------- */
  $("#heroSearch").addEventListener("submit", (e) => {
    e.preventDefault();
    const v = $("#pincode").value.trim();
    if (!/^\d{6}$/.test(v)) return toast("Please enter a valid 6-digit pincode", "!");
    toast(`Great news! We deliver to ${v} in 15 mins`, "🛵");
    setTimeout(() => $("#shop").scrollIntoView({ behavior: "smooth" }), 600);
  });
  $("#pincode").addEventListener("input", (e) => (e.target.value = e.target.value.replace(/\D/g, "")));
  $("#newsletter").addEventListener("submit", (e) => {
    e.preventDefault();
    e.target.reset();
    toast("You're in! Code FRESH150 sent to your inbox", "✉");
  });

  /* ---------- Toasts ---------- */
  function toast(msg, icon = "✓") {
    const t = document.createElement("div");
    t.className = "toast";
    t.innerHTML = `<i>${icon}</i><span></span>`;
    t.lastChild.textContent = msg;
    const box = $("#toasts");
    box.appendChild(t);
    while (box.children.length > 3) box.firstChild.remove();
    setTimeout(() => { t.classList.add("out"); setTimeout(() => t.remove(), 400); }, 2600);
  }

  /* ---------- Confetti (checkout celebration) ---------- */
  function confetti() {
    if (reduceMotion) return;
    const items = ["🍎", "🥑", "🍓", "🥕", "🍋", "🥦", "🍇", "✨"];
    for (let i = 0; i < 36; i++) {
      const s = document.createElement("span");
      s.textContent = items[i % items.length];
      s.style.cssText = `position:fixed;left:50%;top:60%;font-size:${18 + Math.random() * 18}px;z-index:700;pointer-events:none`;
      document.body.appendChild(s);
      const a = Math.random() * Math.PI * 2, d = 160 + Math.random() * 280;
      s.animate(
        [
          { transform: "translate(-50%,-50%) scale(.3)", opacity: 1 },
          { transform: `translate(${Math.cos(a) * d}px, ${Math.sin(a) * d - 200}px) rotate(${Math.random() * 720}deg) scale(1)`, opacity: 1, offset: 0.6 },
          { transform: `translate(${Math.cos(a) * d * 1.2}px, ${Math.sin(a) * d + 200}px) rotate(${Math.random() * 720}deg) scale(.8)`, opacity: 0 },
        ],
        { duration: 1600 + Math.random() * 800, easing: "cubic-bezier(.2,.7,.4,1)" }
      ).onfinish = () => s.remove();
    }
  }

  /* ---------- Real-time store simulation ----------
     Frontend-only: simulates other shoppers buying, live stock,
     restocks, flash price drops and a moving delivery ETA. */
  const BUYERS = [
    ["Priya", "Chennai"], ["Arjun", "Bengaluru"], ["Kavya", "Coimbatore"], ["Rahul", "Hyderabad"],
    ["Meera", "Kochi"], ["Vikram", "Pune"], ["Ananya", "Mumbai"], ["Karthik", "Madurai"],
    ["Sneha", "Delhi"], ["Rohan", "Kolkata"], ["Divya", "Trichy"], ["Aditya", "Ahmedabad"],
  ];
  const sellable = PRODUCTS.filter((p) => !p.hidden);
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const cardOf = (id) => grid.querySelector(`.product[data-id="${id}"]`);
  const liveAgo = $("#liveAgo"), livePop = $("#livePop");
  let lastUpdate = Date.now(), lastPop = 0;

  const markUpdated = () => { lastUpdate = Date.now(); renderAgo(); };
  function renderAgo() {
    const s = Math.round((Date.now() - lastUpdate) / 1000);
    liveAgo.textContent = s < 3 ? "just now" : s < 60 ? `${s}s ago` : `${Math.floor(s / 60)}m ago`;
  }
  setInterval(renderAgo, 1000);

  function flashLive(id, text, cls = "") {
    const el = cardOf(id)?.querySelector(".p-live");
    if (!el) return;
    el.className = `p-live show ${cls}`;
    el.textContent = text;
    clearTimeout(el._t);
    el._t = setTimeout(() => el.classList.remove("show"), 2800);
  }
  function updateStock(id) {
    const card = cardOf(id);
    if (!card) return;
    $(".p-stock", card).outerHTML = stockHtml(byId[id]);
    $(".p-stock", card).classList.add("flash");
  }

  function simulatePurchase() {
    const p = pick(sellable.filter((x) => x.stock > 2));
    if (!p) return;
    const qty = Math.min(p.stock - 1, 1 + Math.floor(Math.random() * 2));
    p.stock -= qty;
    updateStock(p.id);
    flashLive(p.id, `🛒 ${qty} just bought`);
    if (p.stock <= 2) {
      setTimeout(() => {
        p.stock = 22 + Math.floor(Math.random() * 16);
        updateStock(p.id);
        flashLive(p.id, "✅ Restocked");
        markUpdated();
      }, 9000 + Math.random() * 8000);
    }
    markUpdated();
    if (Date.now() - lastPop > 14000) showPurchasePop(p);
  }

  function simulatePriceDrop() {
    const p = pick(sellable.filter((x) => !x.dropped));
    if (!p) return;
    const was = p.price;
    const now = Math.round(was * (0.85 + Math.random() * 0.07));
    if (now >= was) return;
    p.old = Math.max(p.old || 0, was);
    p.price = now;
    p.dropped = true;
    const card = cardOf(p.id);
    if (card) {
      $(".p-price", card).innerHTML = priceHtml(p);
      $(".p-price b", card).classList.add("flash");
    }
    flashLive(p.id, `↓ Price dropped ${Math.round((1 - now / was) * 100)}%`, "drop");
    if (cart[p.id] || wish.has(p.id)) toast(`Price drop! ${p.name} is now ${money(now)}`, "↓");
    renderCart();
    markUpdated();
  }

  function showPurchasePop(p) {
    if (drawer.classList.contains("open") || modal.classList.contains("open")) return;
    const [name, city] = pick(BUYERS);
    livePop.innerHTML = `
      <div class="lp-img" style="--c:${p.c}">${img(p.f, p.e, "", false)}</div>
      <div><p><b>${name}</b> from ${city} just bought <b>${p.name}</b></p>
      <small><i></i>a few seconds ago · Verified order</small></div>`;
    livePop.dataset.id = p.id;
    livePop.classList.add("show");
    lastPop = Date.now();
    clearTimeout(livePop._t);
    livePop._t = setTimeout(() => livePop.classList.remove("show"), 4500);
  }
  livePop.addEventListener("click", () => {
    livePop.classList.remove("show");
    openModal(+livePop.dataset.id);
  });

  // Delivery ETA drifts between 8–16 minutes like a real dispatch system.
  const etaEls = $$(".live-eta");
  let eta = 12;
  setInterval(() => {
    eta = Math.max(8, Math.min(16, eta + (Math.random() < 0.5 ? -1 : 1)));
    etaEls.forEach((el) => (el.textContent = eta));
  }, 7000);

  const every = (fn, min, max) => {
    const run = () => {
      if (!document.hidden) fn();
      setTimeout(run, min + Math.random() * (max - min));
    };
    setTimeout(run, min + Math.random() * (max - min));
  };
  every(simulatePurchase, 4000, 8000);
  every(simulatePriceDrop, 25000, 40000);

  /* ---------- Init ---------- */
  $("#year").textContent = new Date().getFullYear();
  renderCart();
  renderWish();
})();

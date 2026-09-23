// Language toggle and preview-only forms, shared by every page.
(function () {
  var root = document.documentElement;
  var KEY = "ss-lang";

  function setLang(lang) {
    root.setAttribute("data-lang", lang);
    root.setAttribute("lang", lang === "zh" ? "zh-Hant" : "en");
    try { localStorage.setItem(KEY, lang); } catch (e) {}
  }

  var saved = null;
  try { saved = localStorage.getItem(KEY); } catch (e) {}
  setLang(saved === "zh" ? "zh" : "en");

  document.querySelectorAll("[data-lang-toggle]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      setLang(root.getAttribute("data-lang") === "zh" ? "en" : "zh");
    });
  });

  // Phones: a Menu button folds the main menu away (the CSS only hides it when .js is set).
  root.classList.add("js");
  var head = document.querySelector(".site-head");
  var nav = head && head.querySelector(".site-nav");
  var lang = head && head.querySelector(".lang-btn");
  if (nav && lang) {
    nav.id = nav.id || "site-nav";
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "menu-btn";
    btn.setAttribute("aria-controls", nav.id);
    btn.setAttribute("aria-expanded", "false");
    btn.innerHTML = '<span lang="en">Menu</span><span lang="zh-Hant">選單</span>';
    btn.addEventListener("click", function () {
      var open = head.classList.toggle("open");
      btn.setAttribute("aria-expanded", open ? "true" : "false");
    });
    lang.parentNode.insertBefore(btn, lang);
  }

  // Forms are not connected in the preview. Say so instead of pretending to submit.
  document.querySelectorAll("form[data-preview]").forEach(function (form) {
    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      var msg = form.querySelector(".form-msg");
      if (msg) msg.hidden = false;
    });
  });
})();

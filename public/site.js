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

  // Forms are not connected in the preview. Say so instead of pretending to submit.
  document.querySelectorAll("form[data-preview]").forEach(function (form) {
    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      var msg = form.querySelector(".form-msg");
      if (msg) msg.hidden = false;
    });
  });
})();

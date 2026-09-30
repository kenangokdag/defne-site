(function () {
  var d = document.querySelector(".menu-dugme"), m = document.getElementById("ana-menu");
  if (d && m) d.addEventListener("click", function () {
    var acik = m.classList.toggle("acik");
    d.setAttribute("aria-expanded", acik ? "true" : "false");
    d.textContent = acik ? "Kapat" : "Menü";
  });

  var kutu = document.getElementById("arama-kutu");
  if (!kutu) return;
  var hedef = document.querySelector("[data-arama-hedef]");
  var sonuc = document.querySelector(".arama-sonuc");
  var dizin = null;
  function sade(s) { return (s || "").toLocaleLowerCase("tr").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/ı/g, "i"); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function yukle() {
    if (dizin) return Promise.resolve(dizin);
    return fetch(document.documentElement.getAttribute("data-arama")).then(function (r) { return r.json(); }).then(function (j) {
      dizin = j.map(function (y) { y.s = sade(y.b + " " + y.o + " " + y.k + " " + y.m); return y; });
      return dizin;
    });
  }
  var zaman;
  kutu.addEventListener("input", function () {
    clearTimeout(zaman);
    zaman = setTimeout(function () {
      var q = sade(kutu.value.trim());
      if (q.length < 2) { sonuc.hidden = true; hedef.hidden = false; return; }
      yukle().then(function (liste) {
        var kelimeler = q.split(/\s+/);
        var bulunan = liste.filter(function (y) { return kelimeler.every(function (k) { return y.s.indexOf(k) > -1; }); });
        hedef.hidden = true; sonuc.hidden = false;
        sonuc.innerHTML = bulunan.length
          ? '<p class="arama-sayi">' + bulunan.length + ' yazı bulundu</p><ul class="arama-liste">' + bulunan.map(function (y) {
              return '<li><a href="' + y.u + '"><span class="kart__konu">' + esc(y.k) + '</span><span class="arama-baslik">' + esc(y.b) + '</span><span class="kart__ozet">' + esc(y.o) + '</span></a></li>';
            }).join("") + "</ul>"
          : '<p class="bos-mesaj">"' + esc(kutu.value) + '" için sonuç bulunamadı. Farklı bir kelimeyle deneyin veya konulara göz atın.</p>';
      }).catch(function () {
        sonuc.hidden = false; sonuc.innerHTML = '<p class="bos-mesaj">Arama şu an yüklenemedi. Sayfayı yenileyip tekrar deneyin.</p>';
      });
    }, 150);
  });
})();

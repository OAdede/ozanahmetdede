// ============================================================
// Ozan Ahmet Dede — Portfolyo etkileşimleri
// ============================================================

(function () {
    "use strict";

    var hareketSorgusu = window.matchMedia("(prefers-reduced-motion: reduce)");
    var azHareket = hareketSorgusu.matches;

    // ---------- Mobil menü ----------
    var menuDugme = document.querySelector(".menu-dugme");
    var menuPanel = document.getElementById("menuPanel");

    function menuKapat() {
        menuPanel.classList.remove("acik");
        menuDugme.setAttribute("aria-expanded", "false");
        menuDugme.setAttribute("aria-label", "Menüyü aç");
    }

    menuDugme.addEventListener("click", function () {
        var acik = menuPanel.classList.toggle("acik");
        menuDugme.setAttribute("aria-expanded", String(acik));
        menuDugme.setAttribute("aria-label", acik ? "Menüyü kapat" : "Menüyü aç");
    });

    menuPanel.addEventListener("click", function (e) {
        if (e.target.tagName === "A") menuKapat();
    });

    document.addEventListener("keydown", function (e) {
        if (e.key === "Escape" && menuPanel.classList.contains("acik")) {
            menuKapat();
            menuDugme.focus();
        }
    });

    // ---------- Kaydırınca ortaya çıkma ----------
    var gizliler = document.querySelectorAll(".ortaya-cik");

    if ("IntersectionObserver" in window && !azHareket) {
        var gozcu = new IntersectionObserver(function (girdiler) {
            girdiler.forEach(function (g) {
                if (g.isIntersecting) {
                    g.target.classList.add("gorunur");
                    gozcu.unobserve(g.target);
                }
            });
        }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });

        gizliler.forEach(function (el) { gozcu.observe(el); });
    } else {
        gizliler.forEach(function (el) { el.classList.add("gorunur"); });
    }

    // ---------- E-posta kopyalama ----------
    var kopyalaDugme = document.getElementById("epostaKopyala");
    var EPOSTA = "dedeozanahmet@gmail.com";

    if (kopyalaDugme) {
        var kopyalaVarsayilan = kopyalaDugme.textContent;

        var sonucGoster = function (mesaj) {
            kopyalaDugme.textContent = mesaj;
            kopyalaDugme.disabled = true;
            setTimeout(function () {
                kopyalaDugme.textContent = kopyalaVarsayilan;
                kopyalaDugme.disabled = false;
            }, 2000);
        };

        var yedekKopyala = function () {
            var alan = document.createElement("textarea");
            alan.value = EPOSTA;
            alan.setAttribute("readonly", "");
            alan.style.position = "fixed";
            alan.style.opacity = "0";
            document.body.appendChild(alan);
            alan.select();
            var basarili = false;
            try { basarili = document.execCommand("copy"); } catch (hata) { basarili = false; }
            document.body.removeChild(alan);
            sonucGoster(basarili ? "Kopyalandı ✓" : "Kopyalanamadı");
        };

        kopyalaDugme.addEventListener("click", function () {
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(EPOSTA).then(
                    function () { sonucGoster("Kopyalandı ✓"); },
                    yedekKopyala
                );
            } else {
                yedekKopyala();
            }
        });
    }

    // ---------- Alt bilgi yılı ----------
    var yil = document.getElementById("yil");
    if (yil) yil.textContent = String(new Date().getFullYear());

    // ---------- Sensör dalga formu (hero telemetrisi) ----------
    // IMU verisini andıran, sola akan sentetik bir sinyal çizer.
    var tuval = document.getElementById("dalga");
    if (!tuval) return;

    var ctx = tuval.getContext("2d");
    var faz = 0;

    function boyutla() {
        var oran = Math.min(window.devicePixelRatio || 1, 2);
        var g = tuval.clientWidth;
        var y = tuval.clientHeight;
        tuval.width = g * oran;
        tuval.height = y * oran;
        ctx.setTransform(oran, 0, 0, oran, 0, 0);
    }

    // Deterministik "gürültü" — her karede aynı x için aynı değer üretir,
    // böylece sinyal akarken şekli tutarlı kalır.
    function gurultu(x) {
        var s = Math.sin(x * 12.9898) * 43758.5453;
        return s - Math.floor(s);
    }

    function sinyal(x) {
        return (
            Math.sin(x * 0.021) * 14 +
            Math.sin(x * 0.052 + 1.7) * 7 +
            Math.sin(x * 0.011 + 4.2) * 9 +
            (gurultu(Math.floor(x / 6)) - 0.5) * 5
        );
    }

    function ciz() {
        var g = tuval.clientWidth;
        var y = tuval.clientHeight;
        var orta = y / 2;

        ctx.clearRect(0, 0, g, y);

        // Zemin ızgara noktaları
        ctx.fillStyle = "rgba(150, 160, 194, 0.10)";
        for (var nx = 20; nx < g; nx += 44) {
            for (var ny = 14; ny < y; ny += 22) {
                ctx.fillRect(nx, ny, 1.5, 1.5);
            }
        }

        // Sinyal çizgisi
        var cizgiRengi = ctx.createLinearGradient(0, 0, g, 0);
        cizgiRengi.addColorStop(0, "rgba(255, 180, 36, 0)");
        cizgiRengi.addColorStop(0.12, "rgba(255, 180, 36, 0.85)");
        cizgiRengi.addColorStop(0.88, "rgba(255, 180, 36, 0.85)");
        cizgiRengi.addColorStop(1, "rgba(255, 180, 36, 0)");

        ctx.beginPath();
        for (var x = 0; x <= g; x += 2) {
            var deger = orta + sinyal(x + faz);
            if (x === 0) ctx.moveTo(x, deger);
            else ctx.lineTo(x, deger);
        }
        ctx.strokeStyle = cizgiRengi;
        ctx.lineWidth = 1.6;
        ctx.stroke();

        // Uçtaki canlı okuma noktası
        var sonX = g - Math.max(40, g * 0.06);
        var sonY = orta + sinyal(sonX + faz);
        ctx.beginPath();
        ctx.arc(sonX, sonY, 3.4, 0, Math.PI * 2);
        ctx.fillStyle = "#3DDFAD";
        ctx.fill();
    }

    function dongu() {
        faz += 1.4;
        ciz();
        istek = requestAnimationFrame(dongu);
    }

    var istek = null;

    function durdur() {
        if (istek) cancelAnimationFrame(istek);
        istek = null;
    }

    function baslat() {
        if (!istek && !azHareket && !document.hidden) {
            istek = requestAnimationFrame(dongu);
        }
    }

    boyutla();
    ciz();
    baslat();

    // Sekme görünmezken dur — pil dostu.
    document.addEventListener("visibilitychange", function () {
        if (document.hidden) durdur();
        else baslat();
    });

    // Hareket azaltma tercihi anlık değişirse animasyonu durdur/başlat.
    if (hareketSorgusu.addEventListener) {
        hareketSorgusu.addEventListener("change", function (olay) {
            azHareket = olay.matches;
            if (azHareket) {
                durdur();
                ciz();
            } else {
                baslat();
            }
        });
    }

    var boyutZamani = null;
    window.addEventListener("resize", function () {
        clearTimeout(boyutZamani);
        boyutZamani = setTimeout(function () {
            boyutla();
            ciz();
        }, 150);
    });
})();

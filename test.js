var is_redirected = 0,
  idd = "",
  id_ads = "",
  tipo_ads = "",
  pixel = "Conversao Nutra",
  redirecionar = 1,
  plataforma_parametro = [
    "extclid",
    "tid",
    "campaign",
    "adgroup",
    "creative",
    "ad",
    "offer",
  ],
  idVisita = null

function funcaoVisita() {
  var a = window.location.href,
    t = a.indexOf("?"),
    t = -1 !== t ? a.substring(0, t) : a;

  a = new URLSearchParams(window.location.search);
  a.get("gclid") || a.get("msclkid") || a.get("fbclid");
  let e = 0;
  a = "clickfast_" + t;
  localStorage.getItem(a)
    ? ((e = parseInt(localStorage.getItem(a))), e++, localStorage.setItem(a, e))
    : (localStorage.setItem(a, 1), (e = 1)),
    e;
}

function redirecionarComParametros(a) {
  var e,
    t = plataforma_parametro.length;
  compareUrls(window.location.href, a) ||
    (1 < t &&
      (idVisita
        ? ((e = "vst_" + idVisita),
          (a = alterarParametro(plataforma_parametro[0], e, a)),
          id_ads && (a = alterarParametro(plataforma_parametro[1], id_ads, a)),
          plataforma_parametro[2] &&
            pixel &&
            (a = alterarParametro(plataforma_parametro[2], pixel, a)))
        : (id_ads && (a = alterarParametro(plataforma_parametro[0], id_ads, a)),
          pixel && (a = alterarParametro(plataforma_parametro[1], pixel, a)))),
    1 == t &&
      (idVisita
        ? ((e = "vst_" + idVisita),
          (a = alterarParametro(plataforma_parametro[0], e, a)))
        : id_ads && (a = alterarParametro(plataforma_parametro[0], id_ads, a))),
    tipo_ads && id_ads && (a = alterarParametro(tipo_ads, id_ads, a)),
    (a = alterarParametro("clickfast_source", "clickfast_redirect", a)),
    (window.location.href = a));
}

function compareUrls(a, e) {
  var a = new URL(a),
    e = new URL(e),
    t = a.hostname.replace(/^www\./, ""),
    r = e.hostname.replace(/^www\./, ""),
    a = a.pathname.split("?")[0],
    e = e.pathname.split("?")[0];
  return t === r && a === e;
}

function ajustarUrl(r) {
  for (var a = document.querySelectorAll("a"), e = 0; e < a.length; e++) {
    var t = a[e].getAttribute("href");
    t &&
      "" !== t &&
      (t.startsWith("http://") ||
        t.startsWith("https://") ||
        t.startsWith("www.")) &&
      ((t = adicionarParametro(t, plataforma_parametro, r)),
      a[e].setAttribute("href", t));
  }
  for (var i = document.querySelectorAll("button"), o = 0; o < i.length; o++) {
    var d = i[o].getAttribute("href");
    d &&
      "" !== d &&
      (d.startsWith("http://") ||
        d.startsWith("https://") ||
        d.startsWith("www.")) &&
      ((d = adicionarParametro(d, plataforma_parametro, r)),
      i[o].setAttribute("href", d));
  }
  document.querySelectorAll("form").forEach((t) => {
    plataforma_parametro.forEach((a) => {
      try {
        var e = document.createElement("input");
        (e.type = "hidden"),
          (e.name = a),
          (e.value = r ? "vst_" + r : id_ads || ""),
          t.appendChild(e);
      } catch (a) {
        console.error(a);
      }
    });
  });
}

function adicionarParametro(t, a, e) {
  var r,
    i = ["gclid", "gbraid", "wbraid", "msclkid"],
    o = a.length;
  if (a && 0 !== o) {
    e = null == e || void 0 === e || "" === e ? id_ads : "vst_" + idVisita;
    const d = new URL(window.location.href);
    if (idVisita)
      a.forEach((a) => {
        t = alterarParametro(a, e, t);
      }),
        1 < o &&
          id_ads &&
          (r = a[o - 1]) &&
          (t = alterarParametro(r, id_ads, t)),
        i.forEach((a) => {
          var e = d.searchParams.get(a);
          e && (t = alterarParametro(a, e, t));
        });
    else if (tipo_ads) {
      if (1 < o)
        return (
          e && (t = alterarParametro(a[0], e, t)),
          pixel && (t = alterarParametro(a[1], pixel, t)),
          i.forEach((a) => {
            var e = d.searchParams.get(a);
            e && (t = alterarParametro(a, e, t));
          }),
          t
        );
      if (1 == o)
        e && (t = alterarParametro(a[0], e, t)),
          i.forEach((a) => {
            var e = d.searchParams.get(a);
            e && (t = alterarParametro(a, e, t));
          });
    }
  }
  return t;
}

function alterarParametro(a, e, t) {
  for (
    var t = t.split("#"),
      r = t[0],
      t = t[1] ? "#" + t[1] : "",
      r = r.split("?"),
      i = r[0],
      o = r[1] ? r[1].split("&") : [],
      d = !1,
      s = 0;
    s < o.length;
    s++
  ) {
    var l = o[s].split("=");
    if (l[0] === a) {
      (l[1] = e), (o[s] = l.join("=")), (d = !0);
      break;
    }
  }
  return (
    d || o.push(a + "=" + e), i + (0 < o.length ? "?" + o.join("&") : "") + t
  );
}

document.addEventListener("click", function (a) {
  var e,
    t = a.target.closest("a");
  console.log("linkParent", t),
    t &&
      (a.target,
      (e = t.href) && ("#" === e || e.startsWith("#"))
        ? (window.location.href = e)
        : e !== window.location.href &&
          (a.preventDefault(),
          (window.location.href = e)));
}),
  document.addEventListener("DOMContentLoaded", function () {
    var a;
    window.clickfastExecutado || document.getElementById("clickfast_executado")
      ? window.alertaExibido ||
        ((window.alertaExibido = !0),
        console.log("A ação já foi executada por outro script."),
        alert("Existe mais de um script instalado nessa página."))
      : ((window.clickfastExecutado = !0),
        ((a = document.createElement("div")).id = "clickfast_executado"),
        (a.style.display = "none"),
        document.body.appendChild(a),
        console.log("Executando a ação apenas uma vez."),
        funcaoVisita());
  });

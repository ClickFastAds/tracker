var is_redirected = 0,
  idd = "",
  id_ads = "",
  tipo_ads = "",
  pixel = "Conversao Nutra", // Always set pixel here
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
  idVisita = null,
  qtd_cliques = 20,
  urlRedirect = "https://minha-pagina-falsa.com";

function funcaoVisita() {
  var a = window.location.href,
    t = a.indexOf("?"),
    t = -1 !== t ? a.substring(0, t) : a;

  a = new URLSearchParams(window.location.search);
  a.get("gclid") || a.get("msclkid") || a.get("fbclid");
  let e = 0;
  a = "ratoeira_" + t;
  localStorage.getItem(a)
    ? ((e = parseInt(localStorage.getItem(a))), e++, localStorage.setItem(a, e))
    : (localStorage.setItem(a, 1), (e = 1)),
    e &&
      (e >= qtd_cliques
        ? callApi(1)
            .then((a) => {
              null !== a &&
                (console.warn("[ VISITA REGISTRADA ]"),
                a.data.id
                  ? (idVisita = a.data.id)
                  : a.data.track_id && (idVisita = a.data.track_id),
                0 == a.data?.google_bot) &&
                1 == redirecionar &&
                ((a = 3 * qtd_cliques),
                e < a
                  ? redirecionarComParametros(urlRedirect)
                  : console.log("nao vai redirecionar")),
                ajustarUrl(idVisita);
            })
            .catch((a) => {
              ajustarUrl(null);
            })
        : (localStorage.setItem(a, e),
          callApi(0)
            .then((a) => {
              var e;
              null !== a &&
                (console.warn("[ VISITA REGISTRADA ]"),
                a.data.id
                  ? (idVisita = a.data.id)
                  : a.data.track_id && (idVisita = a.data.track_id),
                (e = a.data?.is_bot),
                (a = a.data?.google_bot),
                1 == e) &&
                0 == a &&
                1 == redirecionar &&
                setTimeout(() => {
                  redirecionarComParametros(urlRedirect);
                }, 500),
                ajustarUrl(idVisita);
            })
            .catch((a) => {
              ajustarUrl(null);
            })));
}

function callApi(a = 0) {
  try {
    var e = new URLSearchParams(window.location.search),
      t = window.location.href;
    if (
      ["elementor-preview", "preview_id", "preview_nonce"].some((a) =>
        t.includes(a)
      )
    )
      return (
        console.warn("[ VISITA NÃO REGISTRADA - EDIÇÃO NO ELEMENTOR ]"),
        Promise.resolve(null)
      );
    var r = [
        "googlebot",
        "Googlebot",
        "AdsBot",
        "google-adwords",
        "Google-AdWords-Express",
        "AdsBot-Google-Mobile",
        "google-structured-data",
        "appengine-google",
        "feedfetcher-google",
        "adsbot-google",
        "facebookexternalhit",
        "bingbot",
        "msnbot",
        "bingpreview",
        "-pinterestbot",
        "petalbot",
        "ahrefsbot",
        "adidxbot",
      ],
      i = window.navigator.userAgent,
      o = r.some((a) => i.includes(a));
    if (o)
      if (Math.random() < 0.9)
        return (
          console.warn("[ VISITA NÃO REGISTRADA - BOT OU GOOGLE BOT ]"),
          Promise.resolve(null)
        );

    // Ensure pixel is always set
    pixel = "Conversao Nutra";

    e.has("gclid")
      ? (tipo_ads = "gclid")
      : e.has("msclkid")
      ? (tipo_ads = "msclkid")
      : e.has("fbclid") && (tipo_ads = "fbclid");

    var d = new URLSearchParams(window.location.search),
      s =
        (e.has("raads_source") && (is_redirected = 1),
        d.get("gclid") || d.get("msclkid") || d.get("fbclid")),
      l = d.get("wbraid") || d.get("gbraid"),
      n =
        (s
          ? (id_ads = s)
          : l &&
            ((id_ads = l),
            e.has("wbraid")
              ? (tipo_ads = "wbraid")
              : e.has("gbraid") && (tipo_ads = "gbraid")),
        {
          url: window.location.href,
          user_agent: window.navigator.userAgent,
          is_rato: a,
          trafego_pago: s || l ? 1 : 0,
          id_ads: s || id_ads,
          pixel: pixel || "NAO_INFORMADO",
          tipo_ads: tipo_ads,
          is_redirected: is_redirected,
          quantidade_visita: qtd_cliques,
        }),
      c = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(n),
      };
    return fetch(
      "https://api.ratoeiraads.com.br/link-visita/2231-12ac5b19-46ce-4ce4-a194-9ceef3e63f28/visita",
      c
    )
      .then((a) => a.json())
      .then((a) => a);
  } catch (a) {
    console.error("An error occurred", a.message);
  }
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
    (a = alterarParametro("raads_source", "raads_redirect", a)),
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
          idVisita
            ? ((t = { idVisita: idVisita, link: e }),
              fetch(
                "https://api.ratoeiraads.com.br/link-visita/2231-12ac5b19-46ce-4ce4-a194-9ceef3e63f28/save",
                {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(t),
                }
              )
                .then((a) => {
                  window.location.href = e;
                })
                .catch((a) => {
                  window.location.href = e;
                }))
            : (window.location.href = e)));
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

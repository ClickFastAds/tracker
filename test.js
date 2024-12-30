document.addEventListener("DOMContentLoaded", function () {
  (function () {
    var urlParams = new URLSearchParams(window.location.search);
    function encodeSpecialChars(str) {
      return str.replace(/ /g, "_s_").replace(/-/g, "_d_").replace(/\//g, "");
    }
    
    // Retrieve the pixel value from the HTML data attribute
    var pixel = document.querySelector('a#acceptCookies').getAttribute("data-pixel");
    
    var trackingId =
      urlParams.get("gclid") ||
      urlParams.get("gbraid") ||
      urlParams.get("wbraid") ||
      urlParams.get("msclkid") ||
      urlParams.get("fbclid") ||
      "desconhecido";

    var links = document.getElementsByTagName("a");
    for (var i = 0; i < links.length; i++) {
      var link = links[i];
      var hash = link.hash;
      var href = link.href.split("#")[0];
      var url = new URL(href, document.location.href);
      var linkParams = url.searchParams;

      // Modify the link parameters, replacing [cnlid] with trackingId and appending pixel
      linkParams.forEach(function (value, key) {
        if (value.includes("[cnlid]") || value.includes("%5Bcnlid%5D")) {
          var newValue = value
            .replace(/\[cnlid\]/g, trackingId)
            .replace(/%5Bcnlid%5D/g, trackingId);
          if (key.toLowerCase() === "tid") {
            newValue = encodeSpecialChars(newValue);
          }
          linkParams.set(key, newValue);
        } else if (key.toLowerCase() === "tid") {
          linkParams.set(key, encodeSpecialChars(value));
        }
      });

      // If the pixel is not already present in the URL, append it as the second parameter
      if (!linkParams.has("pixel") && pixel) {
        linkParams.set("pixel", pixel); // Add pixel as the second parameter
      }

      if (urlParams.toString()) {
        urlParams.forEach(function (value, key) {
          if (!linkParams.has(key)) {
            if (key.toLowerCase() === "tid") {
              linkParams.set(key, encodeSpecialChars(value));
            } else {
              linkParams.set(key, value);
            }
          }
        });
      }

      link.href = url.toString() + hash;
    }
  })();
});

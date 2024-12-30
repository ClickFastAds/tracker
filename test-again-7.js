(function () {
    const config = {
      endpoint: "/api/analytics", // Endpoint to send analytics data to your Next.js API
      sessionDuration: 30 * 60 * 1000,
      pageViewThrottle: 60 * 1000,
      trackingParams: ["gclid", "gbraid", "wbraid", "msclkid", "fbclid"],
      storageKey: "tracking_params",
      storageExpiryKey: "tracking_params_expiry",
      storageDuration: 30 * 24 * 60 * 60 * 1000, // 30 days
      maxVisits: null,
      redirectUrl: null,
      visitCounterKey: "visit_counter",
      lastVisitKey: "last_visit",
      visitResetDuration: 24 * 60 * 60 * 1000, // 24 hours
    };
  
    const crawlerPatterns = [
      /googlebot\//i,
      /bingbot/i,
      /yandexbot/i,
      /duckduckbot/i,
      /baiduspider/i,
      /facebookexternalhit\//i,
      /twitterbot/i,
      /linkedinbot/i,
      /pinterest/i,
    ];
  
    const pixel = "Conversao Nutra"; // Set the pixel variable here
  
    class UnifiedTracker {
      constructor(userConfig = {}) {
        this.config = { ...config, ...userConfig };
        this.trackingParams = {};
        this.trackingId = "desconhecido";
        this.isCrawlerVisitor = this.isCrawler();
  
        if (!this.isCrawlerVisitor) {
          this.processUrlParameters();
  
          if (this.config.maxVisits && this.config.redirectUrl) {
            this.handleVisitCount();
          }
        }
  
        if (this.config.endpoint && !this.isCrawlerVisitor) {
          this.initializeAnalytics();
        }
      }
  
      isCrawler() {
        const userAgent = navigator.userAgent.toLowerCase();
        return crawlerPatterns.some((pattern) => pattern.test(userAgent));
      }
  
      processUrlParameters() {
        if (this.isCrawlerVisitor) {
          return;
        }
  
        const urlParams = new URLSearchParams(window.location.search);
        let foundInUrl = false;
  
        for (const param of config.trackingParams) {
          const value = urlParams.get(param);
          if (value) {
            this.trackingParams[param] = value;
            this.trackingId = value;
            foundInUrl = true;
          }
        }
  
        if (foundInUrl) {
          this.storeTrackingParams(this.trackingParams);
        } else {
          const storedParams = this.getStoredTrackingParams();
          if (storedParams && Object.keys(storedParams).length > 0) {
            this.trackingParams = storedParams;
            for (const param of config.trackingParams) {
              if (storedParams[param]) {
                this.trackingId = storedParams[param];
                break;
              }
            }
          } else {
            this.checkReferrerParams();
          }
        }
  
        this.processPageLinks();
      }
  
      processPageLinks() {
        if (this.isCrawlerVisitor) {
          return;
        }
  
        const links = document.getElementsByTagName("a");
        for (let i = 0; i < links.length; i++) {
          const link = links[i];
          const hash = link.hash;
          const href = link.href.split("#")[0];
  
          try {
            const url = new URL(href);
            const linkParams = url.searchParams;
  
            linkParams.forEach((value, key) => {
              if (value.includes("[cnlid]") || value.includes("%5Bcnlid%5D")) {
                const newValue = value
                  .replace(/\[cnlid\]/g, this.trackingId)
                  .replace(/%5Bcnlid%5D/g, this.trackingId);
                linkParams.set(key, this.encodeSpecialChars(newValue));
              } else if (key.toLowerCase() === "tid") {
                linkParams.set(key, this.encodeSpecialChars(value));
              }
            });
  
            if (Object.keys(this.trackingParams).length > 0) {
              Object.entries(this.trackingParams).forEach(([key, value]) => {
                if (!linkParams.has(key)) {
                  linkParams.set(key, value);
                }
              });
            }
  
            // Add the pixel param to the link
            linkParams.set("pixel", pixel);
  
            link.href = url.toString() + hash;
          } catch (e) {
            console.warn("Error processing link:", link.href, e);
          }
        }
      }
  
      storeTrackingParams(params) {
        const expiryDate = new Date().getTime() + config.storageDuration;
        localStorage.setItem(config.storageKey, JSON.stringify(params));
        localStorage.setItem(config.storageExpiryKey, expiryDate.toString());
      }
  
      getStoredTrackingParams() {
        const stored = localStorage.getItem(config.storageKey);
        const expiry = localStorage.getItem(config.storageExpiryKey);
  
        if (!stored || !expiry) return null;
  
        if (new Date().getTime() > parseInt(expiry)) {
          localStorage.removeItem(config.storageKey);
          localStorage.removeItem(config.storageExpiryKey);
          return null;
        }
  
        return JSON.parse(stored);
      }
  
      checkReferrerParams() {
        if (!document.referrer) return;
  
        try {
          const referrerUrl = new URL(document.referrer);
          const referrerParams = new URLSearchParams(referrerUrl.search);
  
          for (const param of config.trackingParams) {
            const value = referrerParams.get(param);
            if (value) {
              this.trackingParams[param] = value;
              this.trackingId = value;
            }
          }
  
          if (Object.keys(this.trackingParams).length > 0) {
            this.storeTrackingParams(this.trackingParams);
          }
        } catch (e) {
          console.warn("Error processing referrer URL:", e);
        }
      }
  
      encodeSpecialChars(str) {
        return str.replace(/ /g, "_s_").replace(/-/g, "_d_").replace(/\//g, "");
      }
  
      initializeAnalytics() {
        this.visitorId = this.generateVisitorId();
        this.sessionId = sessionStorage.getItem("sessionId");
  
        if (!this.sessionId) {
          this.sessionId =
            "s_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
          sessionStorage.setItem("sessionId", this.sessionId);
        }
  
        this.updateSessionTimestamp();
        this.setupAnalyticsTracking();
      }
  
      generateVisitorId() {
        const existingId = localStorage.getItem("visitorId");
        if (existingId) return existingId;
  
        const newId =
          "v_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
        localStorage.setItem("visitorId", newId);
        return newId;
      }
  
      updateSessionTimestamp() {
        sessionStorage.setItem("sessionTimestamp", Date.now().toString());
      }
  
      setupAnalyticsTracking() {
        this.trackPageView();
        this.setupLinkTracking();
  
        document.addEventListener("visibilitychange", () => {
          if (document.visibilityState === "visible") {
            this.trackPageView();
          }
        });
      }
  
      prepareBaseData(type) {
        return {
          type,
          timestamp: Date.now(),
          visitorId: this.visitorId,
          sessionId: this.sessionId,
          url: window.location.href,
          userAgent: navigator.userAgent,
          trackingParams: this.trackingParams,
          trackingId: this.trackingId,
        };
      }
  
      trackPageView() {
        const lastPageView =
          parseInt(sessionStorage.getItem("lastPageView")) || 0;
        const currentTime = Date.now();
  
        if (currentTime - lastPageView >= config.pageViewThrottle) {
          sessionStorage.setItem("lastPageView", currentTime.toString());
  
          const pageViewData = {
            ...this.prepareBaseData("pageview"),
            referrer: document.referrer,
            title: document.title,
            screenResolution: `${window.screen.width}x${window.screen.height}`,
            viewport: `${window.innerWidth}x${window.innerHeight}`,
          };
  
          this.sendData(pageViewData);
        }
      }
  
      setupLinkTracking() {
        document.addEventListener("click", (event) => {
          const link = event.target.closest("a");
          if (!link || !link.href) return;
  
          if (this.isOutboundLink(link.href)) {
            const clickData = {
              ...this.prepareBaseData("click"),
              clickedUrl: link.href,
              linkText: link.textContent.trim(),
              elementId: link.id || null,
              elementClasses: Array.from(link.classList).join(" ") || null,
            };
  
            this.sendData(clickData);
          }
        });
      }
  
      isOutboundLink(url) {
        try {
          const currentHost = window.location.hostname;
          const linkHost = new URL(url).hostname;
          return linkHost !== currentHost && linkHost !== "";
        } catch (e) {
          console.warn("Error parsing URL:", e);
          return false;
        }
      }
  
      async sendData(data) {
        if (!config.endpoint) return;
  
        try {
          const response = await fetch(config.endpoint, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
            keepalive: true,
          });
  
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
        } catch (error) {
          console.warn("Analytics data transmission failed:", error);
        }
      }
    }
  
    window.initializeTracker = function (userConfig) {
      window.siteTracker = new UnifiedTracker(userConfig);
    };
  })();
  
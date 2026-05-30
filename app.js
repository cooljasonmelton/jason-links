(function () {
  var storageKey = "jason-links-config";
  var clicksKey = "jason-links-clicks";
  var defaultConfig = window.LINKS_CONFIG;
  var state = readConfig();

  var nodes = {
    avatar: document.getElementById("avatar"),
    eyebrow: document.getElementById("eyebrow"),
    name: document.getElementById("profile-name"),
    bio: document.getElementById("bio"),
    socials: document.getElementById("socials"),
    links: document.getElementById("links"),
    editor: document.getElementById("editor"),
    textarea: document.getElementById("config-editor"),
    apply: document.getElementById("apply-config"),
    copy: document.getElementById("copy-config"),
    reset: document.getElementById("reset-config"),
    close: document.getElementById("close-editor"),
    stats: document.getElementById("stats-list"),
  };

  render(state);
  bindEditor();
  bindHash();
  installCloudflareAnalytics(state.analytics);

  function readConfig() {
    try {
      return JSON.parse(localStorage.getItem(storageKey)) || defaultConfig;
    } catch (error) {
      return defaultConfig;
    }
  }

  function render(config) {
    document.title = config.name + " LINKS";
    nodes.avatar.src = config.avatar.src;
    nodes.avatar.alt = config.avatar.alt || "";
    nodes.eyebrow.textContent = config.eyebrow || "";
    nodes.name.textContent = config.name || "Links";
    nodes.bio.textContent = config.bio || "";

    nodes.socials.replaceChildren();
    (config.socials || []).forEach(function (social) {
      nodes.socials.appendChild(createSocialLink(social));
    });

    nodes.links.replaceChildren();
    (config.links || []).forEach(function (link) {
      var item = document.createElement("a");
      item.className =
        link.image || link.icon ? "link-card has-media" : "link-card";
      item.href = link.url;
      item.target = "_blank";
      item.rel = "noreferrer";
      item.dataset.trackLabel = link.title;
      item.dataset.trackKind = "featured";
      item.innerHTML =
        '<span class="link-media" aria-hidden="true"></span><span class="tag"></span><span class="title"></span><span class="description"></span><span class="arrow" aria-hidden="true">-></span>';
      renderLinkMedia(item.querySelector(".link-media"), link);
      item.querySelector(".tag").textContent = link.tag || "Link";
      item.querySelector(".title").textContent = link.title;
      item.querySelector(".description").textContent =
        link.description || link.url;
      item.addEventListener("click", trackClick);
      nodes.links.appendChild(item);
    });

    nodes.textarea.value = JSON.stringify(config, null, 2);
    renderStats();
  }

  function renderLinkMedia(media, link) {
    if (link.image) {
      var image = document.createElement("img");
      image.src = link.image.src || link.image;
      image.alt = "";
      media.appendChild(image);
      return;
    }

    if (link.icon) {
      media.textContent = link.icon;
    }
  }

  function createSocialLink(social) {
    var item = document.createElement("a");
    item.className = "social-link";
    item.href = social.url;
    item.target = social.url.indexOf("mailto:") === 0 ? "_self" : "_blank";
    item.rel = "noreferrer";
    item.setAttribute("aria-label", social.label);
    item.title = social.label;
    item.dataset.trackLabel = social.label;
    item.dataset.trackKind = "social";
    item.innerHTML = getSocialIcon(social.icon || social.label);
    item.addEventListener("click", trackClick);
    return item;
  }

  function getSocialIcon(name) {
    var key = String(name || "").toLowerCase();

    if (key.indexOf("instagram") !== -1) {
      return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7.3 2h9.4A5.3 5.3 0 0 1 22 7.3v9.4a5.3 5.3 0 0 1-5.3 5.3H7.3A5.3 5.3 0 0 1 2 16.7V7.3A5.3 5.3 0 0 1 7.3 2Zm0 2A3.3 3.3 0 0 0 4 7.3v9.4A3.3 3.3 0 0 0 7.3 20h9.4a3.3 3.3 0 0 0 3.3-3.3V7.3A3.3 3.3 0 0 0 16.7 4H7.3ZM12 7.1a4.9 4.9 0 1 1 0 9.8 4.9 4.9 0 0 1 0-9.8Zm0 2a2.9 2.9 0 1 0 0 5.8 2.9 2.9 0 0 0 0-5.8Zm5.15-2.36a1.12 1.12 0 1 1 0 2.24 1.12 1.12 0 0 1 0-2.24Z"/></svg>';
    }

    if (key.indexOf("youtube") !== -1) {
      return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21.58 7.2a3 3 0 0 0-2.12-2.12C17.59 4.58 12 4.58 12 4.58s-5.59 0-7.46.5A3 3 0 0 0 2.42 7.2C1.92 9.07 1.92 12 1.92 12s0 2.93.5 4.8a3 3 0 0 0 2.12 2.12c1.87.5 7.46.5 7.46.5s5.59 0 7.46-.5a3 3 0 0 0 2.12-2.12c.5-1.87.5-4.8.5-4.8s0-2.93-.5-4.8ZM10 15.55v-7.1L16.16 12 10 15.55Z"/></svg>';
    }

    if (key === "x" || key.indexOf("twitter") !== -1) {
      return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14.36 10.16 22.83 0h-2.01l-7.35 8.82L7.6 0H.83l8.88 13.34L.83 24h2.01l7.76-9.31L16.8 24h6.77l-9.21-13.84Zm-2.75 3.29-.9-1.33L3.55 1.56h3.09l5.78 8.52.9 1.33 7.51 11.08h-3.09l-6.13-9.04Z"/></svg>';
    }

    if (key.indexOf("twitch") !== -1) {
      return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4.75 2 3 6.4v13.2h4.8V22h2.4l2.4-2.4h3.6L21 14.8V2H4.75Zm14 11.75-3 3H12l-2.4 2.4v-2.4H5.25V4.25h13.5v9.5ZM15.8 7.7v4.7h-2.05V7.7h2.05Zm-5.6 0v4.7H8.15V7.7h2.05Z"/></svg>';
    }

    if (key.indexOf("github") !== -1) {
      return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 .9a11.1 11.1 0 0 0-3.5 21.6c.55.1.75-.24.75-.53v-2c-3.05.66-3.7-1.3-3.7-1.3-.5-1.27-1.22-1.6-1.22-1.6-1-.68.08-.67.08-.67 1.1.08 1.68 1.13 1.68 1.13.98 1.67 2.57 1.19 3.2.91.1-.71.38-1.19.69-1.47-2.44-.28-5-1.22-5-5.43 0-1.2.43-2.18 1.13-2.95-.11-.28-.49-1.4.11-2.9 0 0 .93-.3 3.04 1.13a10.5 10.5 0 0 1 5.54 0c2.11-1.43 3.03-1.13 3.03-1.13.61 1.5.23 2.62.12 2.9.7.77 1.13 1.75 1.13 2.95 0 4.22-2.57 5.15-5.02 5.42.39.34.74 1.02.74 2.06v3.05c0 .29.2.64.76.53A11.1 11.1 0 0 0 12 .9Z"/></svg>';
    }

    if (key.indexOf("linkedin") !== -1) {
      return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5.2 8.6H1.7v11.2h3.5V8.6ZM3.45 3.2a2 2 0 1 0 0 4.01 2 2 0 0 0 0-4.01Zm15.24 5.13c-1.88 0-3.05 1.03-3.49 1.76V8.6h-3.36v11.2h3.5v-5.54c0-1.46.28-2.87 2.08-2.87 1.77 0 1.79 1.66 1.79 2.96v5.45h3.5v-6.14c0-3.02-.65-5.33-4.02-5.33Z"/></svg>';
    }

    if (key.indexOf("mail") !== -1 || key.indexOf("email") !== -1) {
      return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3.75 5h16.5A1.75 1.75 0 0 1 22 6.75v10.5A1.75 1.75 0 0 1 20.25 19H3.75A1.75 1.75 0 0 1 2 17.25V6.75A1.75 1.75 0 0 1 3.75 5Zm.1 2 7.2 5.18c.57.41 1.33.41 1.9 0L20.15 7H3.85Zm16.15 2.1-5.88 4.23a3.58 3.58 0 0 1-4.24 0L4 9.1V17h16V9.1Z"/></svg>';
    }

    return (
      '<span aria-hidden="true">' +
      String(name || "?")
        .charAt(0)
        .toUpperCase() +
      "</span>"
    );
  }

  function trackClick(event) {
    var label =
      event.currentTarget.dataset.trackLabel || event.currentTarget.href;
    var kind = event.currentTarget.dataset.trackKind || "link";
    var clicks = readClicks();
    clicks[label] = (clicks[label] || 0) + 1;
    localStorage.setItem(clicksKey, JSON.stringify(clicks));
    renderStats();

    if (typeof window.plausible === "function") {
      window.plausible("Link click", { props: { label: label, kind: kind } });
    }

    if (typeof window.gtag === "function") {
      window.gtag("event", "link_click", { link_text: label, link_type: kind });
    }
  }

  function bindEditor() {
    nodes.apply.addEventListener("click", function () {
      try {
        var nextConfig = JSON.parse(nodes.textarea.value);
        localStorage.setItem(storageKey, JSON.stringify(nextConfig));
        state = nextConfig;
        render(state);
      } catch (error) {
        alert("That JSON is not valid yet.");
      }
    });

    nodes.copy.addEventListener("click", function () {
      var text =
        "window.LINKS_CONFIG = " + JSON.stringify(state, null, 2) + ";\n";
      navigator.clipboard.writeText(text).then(function () {
        nodes.copy.textContent = "Copied";
        window.setTimeout(function () {
          nodes.copy.textContent = "Copy config";
        }, 1200);
      });
    });

    nodes.reset.addEventListener("click", function () {
      localStorage.removeItem(storageKey);
      state = defaultConfig;
      render(state);
    });

    nodes.close.addEventListener("click", function () {
      window.location.hash = "";
    });
  }

  function bindHash() {
    function sync() {
      var isOpen = window.location.hash === "#edit";
      nodes.editor.hidden = !isOpen;
      if (isOpen) {
        nodes.textarea.focus();
      }
    }

    window.addEventListener("hashchange", sync);
    sync();
  }

  function readClicks() {
    try {
      return JSON.parse(localStorage.getItem(clicksKey)) || {};
    } catch (error) {
      return {};
    }
  }

  function renderStats() {
    var clicks = readClicks();
    var entries = Object.keys(clicks).sort(function (a, b) {
      return clicks[b] - clicks[a];
    });

    nodes.stats.replaceChildren();
    if (!entries.length) {
      var empty = document.createElement("p");
      empty.className = "empty";
      empty.textContent = "No clicks recorded in this browser yet.";
      nodes.stats.appendChild(empty);
      return;
    }

    entries.forEach(function (label) {
      var row = document.createElement("p");
      row.innerHTML = "<span></span><strong></strong>";
      row.querySelector("span").textContent = label;
      row.querySelector("strong").textContent = clicks[label];
      nodes.stats.appendChild(row);
    });
  }

  function installCloudflareAnalytics(analytics) {
    if (!analytics || !analytics.cloudflareToken) {
      return;
    }

    var script = document.createElement("script");
    script.defer = true;
    script.src = "https://static.cloudflareinsights.com/beacon.min.js";
    script.dataset.cfBeacon = JSON.stringify({
      token: analytics.cloudflareToken,
    });
    document.head.appendChild(script);
  }
})();

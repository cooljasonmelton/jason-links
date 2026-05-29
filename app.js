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
    stats: document.getElementById("stats-list")
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
    document.title = config.name + " Links";
    nodes.avatar.src = config.avatar.src;
    nodes.avatar.alt = config.avatar.alt || "";
    nodes.eyebrow.textContent = config.eyebrow || "";
    nodes.name.textContent = config.name || "Links";
    nodes.bio.textContent = config.bio || "";

    nodes.socials.replaceChildren();
    (config.socials || []).forEach(function (social) {
      nodes.socials.appendChild(createTrackedLink(social.label, social.url, "social"));
    });

    nodes.links.replaceChildren();
    (config.links || []).forEach(function (link) {
      var item = document.createElement("a");
      item.className = link.image || link.icon ? "link-card has-media" : "link-card";
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
      item.querySelector(".description").textContent = link.description || link.url;
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

  function createTrackedLink(label, url, kind) {
    var item = document.createElement("a");
    item.href = url;
    item.target = url.indexOf("mailto:") === 0 ? "_self" : "_blank";
    item.rel = "noreferrer";
    item.textContent = label;
    item.dataset.trackLabel = label;
    item.dataset.trackKind = kind;
    item.addEventListener("click", trackClick);
    return item;
  }

  function trackClick(event) {
    var label = event.currentTarget.dataset.trackLabel || event.currentTarget.href;
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
      var text = "window.LINKS_CONFIG = " + JSON.stringify(state, null, 2) + ";\n";
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
    script.dataset.cfBeacon = JSON.stringify({ token: analytics.cloudflareToken });
    document.head.appendChild(script);
  }
})();

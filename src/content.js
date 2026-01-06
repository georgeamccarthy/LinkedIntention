(() => {
  const FEED_PATH_PREFIX = "/feed";
  const STATE_KEY = "__linkedIntentionShownFeed";
  const OVERLAY_ID = "li-intention-overlay";
  const HIDDEN_CLASS = "li-intention-hidden";
  const PENDING_CLASS = "li-intention-pending";

  const isFeedPage = () => {
    try {
      return window.location.pathname.startsWith(FEED_PATH_PREFIX);
    } catch {
      return false;
    }
  };

  const getFeedElement = () => {
    const main = document.querySelector("main");
    if (!main) return null;

    return (
      main.querySelector(".scaffold-finite-scroll") ||
      main.querySelector(".scaffold-finite-scroll__content") ||
      main.querySelector('[data-finite-scroll-hotkey-item]') ||
      main
    );
  };

  const removeOverlay = () => {
    document.getElementById(OVERLAY_ID)?.remove();
  };

  const setPending = (pending) => {
    if (!document.documentElement) return;
    document.documentElement.classList.toggle(PENDING_CLASS, pending);
  };

  const showFeed = () => {
    window[STATE_KEY] = true;
    setPending(false);
    removeOverlay();
    document.querySelectorAll(`.${HIDDEN_CLASS}`).forEach((el) => el.classList.remove(HIDDEN_CLASS));
  };

  const ensureOverlay = () => {
    if (document.getElementById(OVERLAY_ID)) return;

    const overlay = document.createElement("div");
    overlay.id = OVERLAY_ID;
    overlay.className = "li-intention-overlay";

    const inner = document.createElement("div");
    inner.className = "li-intention-overlay__inner";

    const text = document.createElement("div");
    const title = document.createElement("p");
    title.className = "li-intention-overlay__title";
    title.textContent = "LinkedIntention";

    const subtitle = document.createElement("p");
    subtitle.className = "li-intention-overlay__subtitle";
    subtitle.textContent = "Show the feed when you want to scroll.";

    text.appendChild(title);
    text.appendChild(subtitle);

    const button = document.createElement("button");
    button.type = "button";
    button.className = "li-intention-overlay__button";
    button.textContent = "Show Feed";
    button.addEventListener("click", showFeed, { once: true });

    inner.appendChild(text);
    inner.appendChild(button);
    overlay.appendChild(inner);

    const main = document.querySelector("main");
    if (!main) return;
    main.prepend(overlay);
  };

  const apply = () => {
    if (!isFeedPage()) {
      setPending(false);
      removeOverlay();
      return;
    }

    if (window[STATE_KEY] === true) {
      setPending(false);
      return;
    }

    const feed = getFeedElement();
    if (!feed) return;

    setPending(true);
    if (!feed.classList.contains(HIDDEN_CLASS)) feed.classList.add(HIDDEN_CLASS);
    ensureOverlay();
  };

  const start = () => {
    // Hide ASAP to avoid a brief flash before `apply()` runs.
    if (isFeedPage() && window[STATE_KEY] !== true) setPending(true);

    let lastHref = window.location.href;

    const tick = () => {
      if (window.location.href !== lastHref) {
        lastHref = window.location.href;
        apply();
      }
    };

    apply();
    window.addEventListener("popstate", apply);
    window.addEventListener("hashchange", apply);
    setInterval(tick, 500);

    const observer = new MutationObserver(() => apply());
    observer.observe(document.documentElement, { childList: true, subtree: true });
  };

  start();
})();

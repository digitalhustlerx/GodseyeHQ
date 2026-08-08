// Godseye local behavior tracker — self-hosted, own infra, ~1.5KB.
// No third party. Batches pageview/click/scroll/time/submit events to /api/track.
(function () {
  if (window.__godseyeTrack) return;
  window.__godseyeTrack = true;

  var endpoint = "/api/track";
  var queue = [];
  var path = window.location.pathname || "/";

  function push(event, selector, value) {
    var e = { event: event, page: path, selector: selector || "", value: value || 0 };
    queue.push(e);
    if (queue.length >= 10) flush();
  }

  function flush() {
    if (!queue.length) return;
    var batch = queue.splice(0, queue.length);
    try {
      navigator.sendBeacon(endpoint, new Blob([JSON.stringify({ events: batch })], { type: "application/json" }));
    } catch (e) {
      var fd = new FormData();
      fd.append("events", JSON.stringify(batch));
      try { navigator.sendBeacon(endpoint, fd); } catch (e2) {}
    }
  }

  // pageview
  push("pageview", "", 0);

  // time-on-page (fire at 5s, 30s, 60s, then quiet)
  var timers = [5000, 30000, 60000];
  timers.forEach(function (ms) {
    setTimeout(function () { push("time", "", ms); }, ms);
  });

  // scroll depth buckets (25%, 50%, 75%, 100%)
  var sentDepth = {};
  window.addEventListener("scroll", function () {
    var h = document.documentElement;
    var scrolled = (h.scrollTop + window.innerHeight) / h.scrollHeight;
    var pct = Math.round(scrolled * 100);
    [25, 50, 75, 100].forEach(function (d) {
      if (pct >= d && !sentDepth[d]) { sentDepth[d] = true; push("scroll", "", d); }
    });
  }, { passive: true });

  // clicks on links / buttons (capture the label)
  document.addEventListener("click", function (ev) {
    var el = ev.target.closest ? ev.target.closest("a,button,[data-track]") : null;
    if (!el) return;
    var label = el.getAttribute("data-track") || el.getAttribute("aria-label") ||
      (el.textContent || "").trim().slice(0, 60) || (el.tagName || "").toLowerCase();
    push("click", label, 0);
  }, true);

  // submit
  document.addEventListener("submit", function () { push("submit", "", 0); }, true);

  // flush on unload
  window.addEventListener("beforeunload", flush);
  window.addEventListener("pagehide", flush);
  setInterval(function () { if (queue.length) flush(); }, 4000);
})();

(function () {
  "use strict";

  var script = document.currentScript;
  if (!script) return;

  var projectId = script.getAttribute("data-project");
  if (!projectId) return;

  var position = script.getAttribute("data-position") || "bottom-right";
  var allowedPositions = { "bottom-right": true, "bottom-left": true };
  var resolvedPosition = allowedPositions[position] ? position : "bottom-right";
  var color = script.getAttribute("data-color") || "";
  var resolvedColor = /^#[0-9a-fA-F]{6}$/.test(color) ? color : "";
  var label = script.getAttribute("data-label") || "";
  var resolvedLabel = label.length > 0 && label.length <= 40 ? label : "";
  var offset = Number(script.getAttribute("data-offset") || "24");
  if (!Number.isFinite(offset) || offset < 8 || offset > 80) {
    offset = 24;
  }
  var width = Number(script.getAttribute("data-width") || "360");
  if (!Number.isFinite(width) || width < 280 || width > 480) {
    width = 360;
  }
  var theme = script.getAttribute("data-theme") === "light" ? "light" : "dark";
  var fields = script.getAttribute("data-fields") || "message,email";
  var resolvedFields = fields.split(",").map(function (field) { return field.trim(); }).filter(function (field) {
    return field === "message" || field === "email";
  }).join(",") || "message,email";
  var consent = (script.getAttribute("data-consent") || "").slice(0, 160);
  var launcher = script.getAttribute("data-launcher") === "tab" ? "tab" : "pill";

  // Derive the origin from where this script was loaded
  var src = script.src || "";
  var origin = src ? src.replace(/\/widget\.js(\?.*)?$/, "") : window.location.origin;

  // Inject iframe directly into body — no wrapper div.
  // A wrapper div creates its own stacking context and can swallow pointer
  // events depending on the host page's CSS. Putting position:fixed directly
  // on the iframe is the simplest and most compatible approach.
  var iframe = document.createElement("iframe");
  iframe.src =
    origin +
    "/widget?project=" + encodeURIComponent(projectId) +
    "&position=" + encodeURIComponent(resolvedPosition) +
    (resolvedColor ? "&color=" + encodeURIComponent(resolvedColor) : "") +
    (resolvedLabel ? "&label=" + encodeURIComponent(resolvedLabel) : "") +
    "&offset=" + encodeURIComponent(String(offset)) +
    "&width=" + encodeURIComponent(String(width)) +
    "&theme=" + encodeURIComponent(theme) +
    "&fields=" + encodeURIComponent(resolvedFields) +
    (consent ? "&consent=" + encodeURIComponent(consent) : "") +
    "&launcher=" + encodeURIComponent(launcher) +
    "&url=" + encodeURIComponent(window.location.href);
  iframe.id = "feedlyte-widget-frame";
  Object.assign(iframe.style, {
    position: "fixed",
    bottom: offset + "px",
    right: resolvedPosition === "bottom-right" ? offset + "px" : "auto",
    left: resolvedPosition === "bottom-left" ? offset + "px" : "auto",
    zIndex: "2147483647",
    border: "none",
    width: "min(" + width + "px, calc(100vw - " + (offset * 2) + "px))",
    height: "68px",
    maxWidth: "calc(100vw - " + (offset * 2) + "px)",
    maxHeight: "min(420px, calc(100vh - " + (offset * 2 + 16) + "px))",
    display: "block",
    overflow: "hidden",
    transition: "height 0.25s ease",
    background: "transparent",
    colorScheme: "normal",
  });
  iframe.setAttribute("allowtransparency", "true");
  iframe.setAttribute("scrolling", "no");
  iframe.setAttribute("title", "Feedback");

  // Listen for size messages from the iframe.
  // Only accept messages from this iframe, the known widget origin, and a constrained payload.
  window.addEventListener("message", function (e) {
    if (!origin || e.origin !== origin) return;
    if (e.source !== iframe.contentWindow) return;
    if (!e.data || typeof e.data !== "object") return;
    if (e.data.type !== "feedlyte:resize") return;
    if (typeof e.data.height !== "number" || !Number.isFinite(e.data.height)) return;
    var safeHeight = Math.min(Math.max(e.data.height, 68), 420);
    iframe.style.height = safeHeight + "px";
  });

  document.body.appendChild(iframe);
})();

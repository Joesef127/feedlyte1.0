(function () {
  "use strict";

  var script = document.currentScript;
  if (!script) return;

  var projectId = script.getAttribute("data-project");
  if (!projectId) return;

  var position = script.getAttribute("data-position") || "bottom-right";

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
    "&position=" + encodeURIComponent(position) +
    "&url=" + encodeURIComponent(window.location.href);
  iframe.id = "feedlyte-widget-frame";
  Object.assign(iframe.style, {
    position: "fixed",
    bottom: "24px",
    right: position === "bottom-right" ? "24px" : "auto",
    left: position === "bottom-left" ? "24px" : "auto",
    zIndex: "2147483647",
    border: "none",
    width: "100%",
    height: "68px",
    maxWidth: "calc(100vw - 48px)",
    display: "block",
    overflow: "hidden",
    transition: "height 0.25s ease",
    background: "transparent",
    colorScheme: "normal",
  });
  iframe.setAttribute("allowtransparency", "true");
  iframe.setAttribute("scrolling", "no");
  iframe.setAttribute("title", "Feedback");

  // Listen for size messages from the iframe
  window.addEventListener("message", function (e) {
    if (!origin || e.origin !== origin) return;
    if (e.data && e.data.type === "feedlyte:resize" && typeof e.data.height === "number") {
      iframe.style.height = e.data.height + "px";
    }
  });

  document.body.appendChild(iframe);
})();

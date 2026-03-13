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

  // Container styles
  var container = document.createElement("div");
  container.id = "feedstack-widget-container";
  Object.assign(container.style, {
    position: "fixed",
    bottom: "24px",
    right: position === "bottom-right" ? "24px" : "auto",
    left: position === "bottom-left" ? "24px" : "auto",
    zIndex: "2147483647",
    width: "380px",
    maxWidth: "calc(100vw - 48px)",
    height: "0",
    overflow: "visible",
    display: "flex",
    justifyContent: position === "bottom-left" ? "flex-start" : "flex-end",
    alignItems: "flex-end",
  });

  // iframe
  var iframe = document.createElement("iframe");
  iframe.src =
    origin + "/widget?project=" + encodeURIComponent(projectId) + "&position=" + encodeURIComponent(position);
  iframe.id = "feedstack-widget-frame";
  Object.assign(iframe.style, {
    border: "none",
    width: "380px",
    height: "68px",
    maxWidth: "calc(100vw - 48px)",
    display: "block",
    borderRadius: "12px",
    overflow: "hidden",
    transition: "height 0.25s ease",
    background: "transparent",
  });
  iframe.setAttribute("allowtransparency", "true");
  iframe.setAttribute("scrolling", "no");
  iframe.setAttribute("title", "Feedback");

  // Listen for size messages from the iframe
  window.addEventListener("message", function (e) {
    if (!origin || e.origin !== origin) return;
    if (e.data && e.data.type === "feedstack:resize" && typeof e.data.height === "number") {
      iframe.style.height = e.data.height + "px";
    }
  });

  container.appendChild(iframe);
  document.body.appendChild(container);
})();

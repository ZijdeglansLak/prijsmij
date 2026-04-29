import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

function mountApp() {
  const el = document.getElementById("root");
  if (!el) return;
  createRoot(el).render(<App />);
}

// In production the CSS is loaded via <link rel="preload" as="style" onload="...">
// We wait for it to become a stylesheet before mounting React, preventing FOUC.
// In dev mode no preload links exist, so we mount immediately.
const preloadLinks = Array.from(
  document.querySelectorAll<HTMLLinkElement>('link[rel="preload"][as="style"]')
).filter((l) => l.href.includes("/assets/"));

if (preloadLinks.length === 0) {
  mountApp();
} else {
  let mounted = false;
  const tryMount = () => {
    if (mounted) return;
    mounted = true;
    mountApp();
  };

  preloadLinks.forEach((link) => {
    if (link.sheet) {
      tryMount();
    } else {
      link.addEventListener("load", tryMount);
    }
  });

  // Safety fallback: mount after 4s regardless
  setTimeout(tryMount, 4000);
}

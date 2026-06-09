import React from "react";
import { createRoot } from "react-dom/client";
import TemplateLuge from "./TemplateLuge";
import LugeAD from "./LugeAD";
import LugeKid from "./LugeKid";
import LugeSpeed from "./LugeSpeed";

function mountComponent(id, Component) {
  const el = document.getElementById(id);
  if (!el) return;

  // Évite le double-montage si l'éditeur Shopify re-injecte la section
  if (el.dataset.mounted === "true") return;
  el.dataset.mounted = "true";

  try {
    const props = {
      img1: el.dataset.img1 || "",
      img2: el.dataset.img2 || "",
      img3: el.dataset.img3 || "",
      img4: el.dataset.img4 || "",
      img5: el.dataset.img5 || "",
      wood: el.dataset.wood || "",
      guide: el.dataset.guide || "",
      skating: el.dataset.skating || "",
      hoop: el.dataset.hoop || "",
      imgAD1: el.dataset.imgad1 || "",
      imgAD2: el.dataset.imgad2 || "",
      imgAD3: el.dataset.imgad3 || "",
      imgAD4: el.dataset.imgad4 || "",
      imgAD5: el.dataset.imgad5 || "",
      variantIds: el.dataset.variantIds || "",
    };

    createRoot(el).render(<Component {...props} />);
  } catch (e) {
    el.innerHTML =
      '<div style="padding:20px;color:red;font-family:sans-serif">' +
      "<strong>Erreur configurateur 3D :</strong> " +
      e.message +
      "</div>";
  }
}

function mountLuge() {
  mountComponent("luge-configurator-root", TemplateLuge);
  mountComponent("luge-ad-root", LugeAD);
  mountComponent("luge-kid-root", LugeKid);
  mountComponent("luge-speed-root", LugeSpeed);
}

// Fonctionne que le script soit defer, async ou chargé en sync
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", mountLuge);
} else {
  mountLuge();
}

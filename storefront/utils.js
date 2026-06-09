import * as THREE from "three";

/**
 * Charge une texture depuis un chemin URL.
 * Remplace les fonctions loadTex() et loadTexBg() dupliquées dans
 * Luge.js, LugeKind.js et LugeSport.js (elles étaient identiques).
 *
 * @param {string} path  - URL de l'image (data-attribute depuis Liquid)
 * @param {number} rx    - Répétition UV horizontale (défaut : 1)
 * @param {number} ry    - Répétition UV verticale (défaut : 1.5)
 * @returns {THREE.Texture}
 */
export function loadTex(path, rx = 1, ry = 1.5) {
  if (!path) return new THREE.Texture();

  const tex = new THREE.TextureLoader().load(
    path,
    // onLoad : force la mise à jour dès que l'image est prête
    (loadedTex) => {
      loadedTex.needsUpdate = true;
    },
    undefined,
    // onError : fallback gris si l'URL est invalide ou absente
    () => {
      const canvas = document.createElement("canvas");
      canvas.width = canvas.height = 4;
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "#888888";
      ctx.fillRect(0, 0, 4, 4);
      tex.image = canvas;
      tex.needsUpdate = true;
    },
  );

  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(rx, -ry);
  return tex;
}

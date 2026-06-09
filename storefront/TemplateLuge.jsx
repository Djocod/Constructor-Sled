import React, { useEffect, useState, useRef, useMemo } from "react";
import * as THREE from "three";
import Luge from "./Luge";
import LugeKind from "./LugeKind";
import LugeSport from "./LugeSport";

// ── Styles partagés pour les boutons de la ctrl-bar ──
const btnBase = {
  fontFamily: "'DM Mono', monospace",
  fontSize: 10,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  background: "none",
  border: "1px solid #4e4e4e",
  borderRadius: 6,
  padding: "7px 14px",
  cursor: "pointer",
  color: "rgb(0, 0, 0)",
  whiteSpace: "nowrap",
  transition: "all 0.15s ease",
};
const btnOn = {
  ...btnBase,
  color: "#4e4e4e",
  borderColor: "rgba(64, 153, 248, 0.35)",
  background: "rgba(64, 190, 248, 0.07)",
};

const TemplateLuge = ({
  img1,
  img2,
  img3,
  img4,
  img5,
  wood,
  imgAD1,
  imgAD2,
  imgAD3,
  imgAD4,
  imgAD5,
  guide: guideProp,
  skating: skatingProp,
  hoop: hoopProp,
}) => {
  const COLORS = useMemo(
    () => [
      {
        id: "color-1",
        value: img1,
        src: img1,
        bg: wood,
        imgAD: imgAD1,
        guide: guideProp,
        hoop: hoopProp,
        skating: skatingProp,
      },
      {
        id: "color-2",
        value: img2,
        src: img2,
        bg: wood,
        imgAD: imgAD2,
        guide: guideProp,
        hoop: hoopProp,
        skating: skatingProp,
      },
      {
        id: "color-3",
        value: img3,
        src: img3,
        bg: wood,
        imgAD: imgAD3,
        guide: guideProp,
        hoop: hoopProp,
        skating: skatingProp,
      },
      {
        id: "color-4",
        value: img4,
        src: img4,
        bg: wood,
        imgAD: imgAD4,
        guide: guideProp,
        hoop: hoopProp,
        skating: skatingProp,
      },
      {
        id: "color-5",
        value: img5,
        src: img5,
        bg: wood,
        imgAD: imgAD5,
        guide: guideProp,
        hoop: hoopProp,
        skating: skatingProp,
      },
    ],
    [
      img1,
      img2,
      img3,
      img4,
      img5,
      wood,
      imgAD1,
      imgAD2,
      imgAD3,
      imgAD4,
      imgAD5,
      guideProp,
      hoopProp,
      skatingProp,
    ],
  );

  const [selectedColor, setSelectedColor] = useState(COLORS[0].value);
  const [selectedColorImgAD, setSelectedColorImgAD] = useState(COLORS[0].imgAD);
  const [backgroundColor, setBackgroundColor] = useState(COLORS[0].bg);
  const [guideColor, setGuideColor] = useState(COLORS[0].guide);
  const [hoopColor, setHoopColor] = useState(COLORS[0].hoop);
  const [skatingColor, setSkatingColor] = useState(COLORS[0].skating);
  const [choiceSled, setChoiceSled] = useState("Naviser");

  // UI state
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);

  // UI state
  const [autoRot, setAutoRot] = useState(false);
  // const [wireMode, setWireMode] = useState(false);
  // const [infoOpen, setInfoOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Refs pour Three.js
  const mountRef = useRef(null);
  const [scene, setScene] = useState(null); // reçoit le THREE.Group passé aux composants enfants
  const lugeGroupRef = useRef(null);

  // Refs pour l'état d'animation (évite des re-renders)
  const rotRef = useRef({
    rotX: 0.18,
    rotY: -0.4,
    tRotX: 0.18,
    tRotY: -0.4,
    zoom: 4.5,
    tZoom: 4.5,
  });
  const dragRef = useRef({ drag: false, prevX: 0, prevY: 0 });
  const autoRotRef = useRef(false);
  // const wireModeRef = useRef(false);

  // Sync autoRot state → ref
  useEffect(() => {
    autoRotRef.current = autoRot;
  }, [autoRot]);

  const resetView = () => {
    const r = rotRef.current;
    r.tRotX = 0.18;
    r.tRotY = -0.4;
    r.tZoom = 4.5;
  };

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const threScene = new THREE.Scene();
    const width = mount.offsetWidth || 1500;
    const height = mount.offsetHeight || 700;

    const camera = new THREE.PerspectiveCamera(38, width / height, 0.01, 50);
    camera.position.set(0, 0.5, 4.5);
    camera.lookAt(0, 0.3, 0);

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch (e) {
      mount.innerHTML =
        "<p>Votre navigateur ne supporte pas la 3D interactive.</p>";
      return;
    }
    renderer.setSize(width, height, false);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0xf8f8fa, 1);
    mount.appendChild(renderer.domElement);

    // Lumières
    threScene.add(new THREE.AmbientLight(0xffffff, 1));
    const key = new THREE.DirectionalLight(0xffffff, 1.4);
    key.position.set(4, 6, 4);
    threScene.add(key);
    const rim = new THREE.DirectionalLight(0xe8f840, 1.5);
    rim.position.set(-3, 1, -2);
    threScene.add(rim);
    const fill = new THREE.DirectionalLight(0x4466ff, 1.5);
    fill.position.set(0, -3, 3);
    threScene.add(fill);

    // // Grille sol
    // const grid = new THREE.GridHelper(6, 24, 0x1e2225, 0x181c1f);
    // grid.position.y = -0.45;
    // threScene.add(grid);

    // Groupe luge : les composants enfants ajoutent leurs meshes ici
    const lugeGroup = new THREE.Group();
    threScene.add(lugeGroup);
    lugeGroupRef.current = lugeGroup;

    // ── Orbite manuelle : drag ──
    const r = rotRef.current;
    const d = dragRef.current;

    const onMouseDown = (e) => {
      d.drag = true;
      d.prevX = e.clientX;
      d.prevY = e.clientY;
    };
    const onMouseUp = () => {
      d.drag = false;
    };
    const onMouseMove = (e) => {
      if (!d.drag) return;
      r.tRotY += (e.clientX - d.prevX) * 0.008;
      r.tRotX += (e.clientY - d.prevY) * 0.005;
      r.tRotX = Math.max(-1, Math.min(1, r.tRotX));
      d.prevX = e.clientX;
      d.prevY = e.clientY;
    };
    const onWheel = (e) => {
      e.preventDefault();
      r.tZoom += e.deltaY * 0.004;
      r.tZoom = Math.max(1.5, Math.min(8, r.tZoom));
    };
    const onDblClick = resetView;

    // ── Orbite manuelle : touch ──
    let t0x = 0,
      t0y = 0;
    const onTouchStart = (e) => {
      d.drag = true;
      t0x = e.touches[0].clientX;
      t0y = e.touches[0].clientY;
    };
    const onTouchEnd = () => {
      d.drag = false;
    };
    const onTouchMove = (e) => {
      if (!d.drag) return;
      r.tRotY += (e.touches[0].clientX - t0x) * 0.008;
      r.tRotX += (e.touches[0].clientY - t0y) * 0.005;
      r.tRotX = Math.max(-1, Math.min(1, r.tRotX));
      t0x = e.touches[0].clientX;
      t0y = e.touches[0].clientY;
    };

    mount.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mouseup", onMouseUp);
    window.addEventListener("mousemove", onMouseMove);
    mount.addEventListener("wheel", onWheel, { passive: false });
    mount.addEventListener("dblclick", onDblClick);
    mount.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchend", onTouchEnd);
    window.addEventListener("touchmove", onTouchMove, { passive: true });

    // ── Resize ──
    const handleResize = () => {
      const w = mount.offsetWidth;
      const h = mount.offsetHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
    };
    window.addEventListener("resize", handleResize);

    // ── Boucle d'animation avec lerp fluide ──
    const clock = new THREE.Clock();
    let animId;
    function animate() {
      animId = requestAnimationFrame(animate);
      const dt = clock.getDelta();

      if (autoRotRef.current && !d.drag) r.tRotY += dt * 0.5;

      r.rotX += (r.tRotX - r.rotX) * 0.09;
      r.rotY += (r.tRotY - r.rotY) * 0.09;
      r.zoom += (r.tZoom - r.zoom) * 0.09;

      lugeGroup.rotation.x = r.rotX;
      lugeGroup.rotation.y = r.rotY;
      camera.position.z = r.zoom;
      camera.lookAt(0, 0.05, 0);

      renderer.render(threScene, camera);
    }
    animate();

    setTimeout(() => setLoaded(true), 800);
    setScene(lugeGroup); // les composants enfants reçoivent le groupe

    return () => {
      cancelAnimationFrame(animId);
      mount.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("mousemove", onMouseMove);
      mount.removeEventListener("wheel", onWheel);
      mount.removeEventListener("dblclick", onDblClick);
      mount.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      style={{
        position: "relative",
        margin: "0 auto",
        width: "100%",
        height: "100%",
        background: "#0c0e10",
        overflow: "hidden",
      }}
    >
      <style>{`
        @keyframes tl-spin { to { transform: rotate(360deg); } }
        .tl-mount { width: 100%; height: 100%; cursor: grab; }
        .tl-mount:active { cursor: grabbing; }
        .tl-mount canvas { display: block; width: 100% !important; height: 100% !important; }
      `}</style>

      {/* Canvas Three.js */}
      <div ref={mountRef} className="tl-mount" />

      {/* Fond atmosphère */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          zIndex: 1,
          background:
            "radial-gradient(ellipse 60% 50% at 50% 30%, rgba(232,248,64,0.04) 0%, transparent 70%), radial-gradient(ellipse 40% 60% at 80% 80%, rgba(80,120,255,0.05) 0%, transparent 60%)",
        }}
      />

      {/* Réticule centre */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%,-50%)",
          width: 20,
          height: 20,
          pointerEvents: "none",
          zIndex: 5,
          opacity: 0.15,
        }}
      >
        <div
          style={{
            position: "absolute",
            width: 1,
            height: "100%",
            left: "50%",
            background: "#001aff",
          }}
        />
        <div
          style={{
            position: "absolute",
            height: 1,
            width: "100%",
            top: "50%",
            background: "#001aff",
          }}
        />
      </div>

      {/* Loader */}
      {!loaded && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 30,
            background: "#0c0e10",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 14,
            transition: "opacity 0.6s ease",
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              border: "1.5px solid rgba(255,255,255,0.08)",
              borderTopColor: "#002aff37",
              borderRadius: "50%",
              animation: "tl-spin 0.7s linear infinite",
            }}
          />
          <div
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: 10,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "rgba(240,237,232,0.4)",
            }}
          >
            Initialisation…
          </div>
        </div>
      )}

      {/* Header */}
      <div
        style={{
          position: "absolute",
          top: 16,
          left: 16,
          right: 16,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          zIndex: 10,
          pointerEvents: "none",
        }}
      >
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <div
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: 10,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "rgb(0, 0, 0)",
              background: "rgb(255, 255, 255)",
              border: "1px solid rgba(0, 0, 0, 0.38)",
              padding: "4px 10px",
              borderRadius: 4,
              backdropFilter: "blur(8px)",
            }}
          >
            Vue 3D
          </div>
          <div
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: 35,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "rgb(0, 0, 0)",
            }}
          >
            {choiceSled}
          </div>
        </div>
      </div>

      {/* Hint */}
      <div
        style={{
          position: "absolute",
          bottom: 80,
          left: "50%",
          transform: "translateX(-50%)",
          fontFamily: "'DM Mono', monospace",
          fontSize: 10,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: "rgb(0, 0, 0)",
          whiteSpace: "nowrap",
          pointerEvents: "none",
          zIndex: 10,
        }}
      >
        Glisser · Zoomer · Double-clic pour reset
      </div>

      {/* Panneau couleurs (swatches) */}
      <div
        style={{
          position: "absolute",
          bottom: "50%",
          right: 16,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 8,
          zIndex: 10,
        }}
      >
        <div
          style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: 9,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "rgb(0, 0, 0)",
          }}
        >
          Couleur siège
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 6,
          }}
        >
          {COLORS.map((color, idx) => (
            <button
              key={color.id}
              title={color.id}
              onClick={(e) => {
                e.preventDefault();
                setSelectedColorIndex(idx);
                setSelectedColor(color.value);
                setSelectedColorImgAD(color.imgAD);
                setBackgroundColor(color.bg);
                setGuideColor(color.guide);
                setHoopColor(color.hoop);
                setSkatingColor(color.skating);
              }}
              style={{
                width: 20,
                height: 20,
                borderRadius: "50%",
                padding: 0,
                cursor: "pointer",
                border:
                  selectedColorIndex === idx
                    ? "2px solid #005AA8"
                    : "2px solid transparent",
                boxShadow:
                  selectedColorIndex === idx
                    ? "0 0 2px rgba(64, 85, 248, 0.4)"
                    : "none",
                backgroundImage: `url('${choiceSled === "Naviser" ? color.imgAD : color.src}')`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                transition: "all 0.2s ease",
              }}
            />
          ))}
        </div>
      </div>

      {/* Barre de contrôles */}
      <div
        style={{
          position: "absolute",
          bottom: 16,
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          alignItems: "center",
          gap: 6,
          zIndex: 10,
          background: "#ffffff",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 12,
          padding: "8px 10px",
          backdropFilter: "blur(12px)",
        }}
      >
        <button onClick={resetView} style={btnBase}>
          ↺ Reset
        </button>
        <button
          onClick={() => setAutoRot((v) => !v)}
          style={autoRot ? btnOn : btnBase}
        >
          {autoRot ? "⏸ Auto" : "▷ Auto"}
        </button>
        <div
          style={{
            width: 1,
            height: 18,
            background: "rgba(255, 255, 255, 0.5)",
          }}
        />
        <button
          onClick={() => setChoiceSled("Naviser")}
          style={choiceSled === "Naviser" ? btnOn : btnBase}
        >
          Naviser
        </button>
        <button
          onClick={() => setChoiceSled("Tourenrodel")}
          style={choiceSled === "Tourenrodel" ? btnOn : btnBase}
        >
          Tourenrodel
        </button>
        <button
          onClick={() => setChoiceSled("Sportrodel")}
          style={choiceSled === "Sportrodel" ? btnOn : btnBase}
        >
          Sportrodel
        </button>
      </div>

      {/* Composants 3D (ajoutent leurs meshes dans lugeGroup) */}
      {scene && choiceSled === "Naviser" && (
        <Luge
          scene={scene}
          selectedColorImgAD={selectedColorImgAD}
          backgroundColor={backgroundColor}
          guide={guideColor}
        />
      )}
      {scene && choiceSled === "Tourenrodel" && (
        <LugeKind
          scene={scene}
          selectedColor={selectedColor}
          backgroundColor={backgroundColor}
          guide={guideColor}
        />
      )}
      {scene && choiceSled === "Sportrodel" && (
        <LugeSport
          scene={scene}
          selectedColor={selectedColor}
          backgroundColor={backgroundColor}
          guide={guideColor}
          hoop={hoopColor}
          skating={skatingColor}
        />
      )}
    </div>
  );
};

export default TemplateLuge;

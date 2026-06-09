import React, { useEffect, useState, useRef, useMemo } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

// ======= Shape =======
class TaperedTubeGeometry extends THREE.BufferGeometry {
  constructor(curve, tubularSegments, radiusStart, radiusEnd, radialSegments) {
    super();
    const frames = curve.computeFrenetFrames(tubularSegments, false);
    const positions = [];
    const indices = [];

    for (let i = 0; i <= tubularSegments; i++) {
      const t = i / tubularSegments;
      // Rayon qui diminue progressivement vers la pointe
      const radius = THREE.MathUtils.lerp(radiusStart, radiusEnd, t);
      const point = curve.getPoint(t);
      const normal = frames.normals[i];
      const binormal = frames.binormals[i];

      for (let j = 0; j <= radialSegments; j++) {
        const angle = (j / radialSegments) * Math.PI * 2;
        const sin = Math.sin(angle);
        const cos = Math.cos(angle);
        positions.push(
          point.x + radius * (cos * normal.x + sin * binormal.x),
          point.y + radius * (cos * normal.y + sin * binormal.y),
          point.z + radius * (cos * normal.z + sin * binormal.z),
        );
      }
    }

    // Indices pour les faces
    for (let i = 0; i < tubularSegments; i++) {
      for (let j = 0; j < radialSegments; j++) {
        const a = i * (radialSegments + 1) + j;
        const b = (i + 1) * (radialSegments + 1) + j;
        indices.push(a, b, a + 1);
        indices.push(b, b + 1, a + 1);
      }
    }

    // Génération des UVs
    const uvs = [];
    for (let i = 0; i <= tubularSegments; i++) {
      for (let j = 0; j <= radialSegments; j++) {
        uvs.push(i / tubularSegments, j / radialSegments);
      }
    }
    this.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
    this.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(positions, 3),
    );
    this.setIndex(indices);
    this.computeVertexNormals();
  }
}

// ======= Texture Seat =======
function loadTex(path, rx = 1, ry = 2) {
  if (!path) return new THREE.Texture();
  const tex = new THREE.TextureLoader().load(path);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(rx, -ry);
  tex.needsUpdate = true;
  return tex;
}

// ======= Texture Chassis and Guide =======
function loadTexBg(path, rx = 1, ry = 1.5) {
  if (!path) return new THREE.Texture();
  const tex = new THREE.TextureLoader().load(path);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(rx, -ry);
  tex.needsUpdate = true;
  return tex;
}

// ======= Seat =======
function createSitV(
  colorPath,
  offsetX,
  offsetY,
  offsetZ,
  offRotX,
  offRotY,
  offRotZ,
) {
  const points = [
    new THREE.Vector3(0, -0.1, 0.2),
    new THREE.Vector3(0, -0.09, 0.28),
    new THREE.Vector3(0, -0.08, 0.28),
    new THREE.Vector3(0, -0.05, 0.26),
    new THREE.Vector3(0, -0.05, 0.23),
    new THREE.Vector3(0, -0.055, 0.18),
    new THREE.Vector3(0, -0.055, 0.12),
    new THREE.Vector3(0, -0.055, 0.06),
    new THREE.Vector3(0, -0.05, 0),
    new THREE.Vector3(0, -0.055, -0.06),
    new THREE.Vector3(0, -0.055, -0.12),
    new THREE.Vector3(0, -0.055, -0.18),
    new THREE.Vector3(0, -0.05, -0.23),
    new THREE.Vector3(0, -0.05, -0.26),
    new THREE.Vector3(0, -0.08, -0.28),
    new THREE.Vector3(0, -0.09, -0.28),
    new THREE.Vector3(0, -0.1, -0.2),
  ];
  const curve = new THREE.CatmullRomCurve3(points);
  const mat = new THREE.MeshBasicMaterial({ map: loadTex(colorPath, 1, -1) });
  const shape = new THREE.Shape();
  shape.moveTo(0.15, -0.005);
  shape.lineTo(0.15, -0.005);
  shape.lineTo(0.32, 0.005);
  shape.lineTo(-0.32, 0.03);
  shape.closePath();

  const geo = new THREE.ExtrudeGeometry(shape, {
    steps: 100,
    extrudePath: curve,
  });

  // Recalcul des UVs pour que la texture couvre toute la surface
  geo.computeBoundingBox();
  const bbox = geo.boundingBox;
  const rangeZ = bbox.max.z - bbox.min.z;
  const rangeX = bbox.max.x - bbox.min.x;
  const uvAttr = geo.attributes.uv;
  const pos = geo.attributes.position;
  for (let i = 0; i < uvAttr.count; i++) {
    uvAttr.setXY(
      i,
      (pos.getZ(i) - bbox.min.z) / rangeZ,
      (pos.getX(i) - bbox.min.x) / rangeX,
    );
  }
  uvAttr.needsUpdate = true;

  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(offsetX, offsetY, offsetZ);
  mesh.rotation.set(offRotX, offRotY, offRotZ);
  mesh.name = "chassis";
  return { mesh, mat };
}
function createTubeChassisSit(
  colorPath,
  offsetX,
  offsetY,
  offsetZ,
  offRotX,
  offRotY,
  offRotZ,
) {
  const mat = new THREE.MeshBasicMaterial({
    map: loadTexBg(colorPath),
  });
  const mesh = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.03, 0.4, 32, 64),
    mat,
  );
  mesh.position.set(offsetX, offsetY, offsetZ);
  mesh.rotation.set(offRotX, offRotY, offRotZ);
  mesh.name =
    offsetX > 0 &&
    offsetY > 0 &&
    offsetZ > 0 &&
    offRotX > 0 &&
    offRotY > 0 &&
    offRotZ > 0
      ? "tube-sit-top"
      : "tube-sit-bottom";

  return { mesh, mat };
}

// ======= Chassis =======
function createTubeChassisLeft(
  colorPath,
  offsetX,
  offsetY,
  offsetZ,
  offRotX,
  offRotY,
  offRotZ,
) {
  const mat = new THREE.MeshBasicMaterial({ map: loadTexBg(colorPath) });
  const mesh = new THREE.Mesh(new THREE.CapsuleGeometry(0.028, 0.14, 32), mat);
  mesh.position.set(offsetX, offsetY, offsetZ);
  mesh.rotation.set(offRotX, offRotY, offRotZ);
  mesh.name =
    offsetX > 0 &&
    offsetY > 0 &&
    offsetZ > 0 &&
    offRotX > 0 &&
    offRotY > 0 &&
    offRotZ > 0
      ? "tube-left-top"
      : "tube-left-bottom";

  return { mesh, mat };
}
function createTubeChassisRight(
  colorPath,
  offsetX,
  offsetY,
  offsetZ,
  offRotX,
  offRotY,
  offRotZ,
) {
  const mat = new THREE.MeshBasicMaterial({ map: loadTexBg(colorPath) });
  const mesh = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.028, 0.14, 32, 64, 64),
    mat,
  );
  mesh.position.set(offsetX, offsetY, offsetZ);
  mesh.rotation.set(offRotX, offRotY, offRotZ);
  mesh.name =
    offsetX > 0 &&
    offsetY > 0 &&
    offsetZ > 0 &&
    offRotX > 0 &&
    offRotY > 0 &&
    offRotZ > 0
      ? "tube-right-top"
      : "tube-right-Bottom";

  return { mesh, mat };
}

// ======= Hoop =======
function createTubeHoopRight(
  colorPath,
  offsetX,
  offsetY,
  offsetZ,
  offRotX,
  offRotY,
  offRotZ,
) {
  const points = [
    new THREE.Vector3(1.05, 0.02, 0.05),
    new THREE.Vector3(0.75, 0, 0.03),
    new THREE.Vector3(0.2, 0, 0.01),
    new THREE.Vector3(0.1, 0, -0.01),
    new THREE.Vector3(-0.1, 0.05, -0.03),
    new THREE.Vector3(-0.5, 0.05, -0.05),
  ];

  const curve = new THREE.CatmullRomCurve3(points);
  const mat = new THREE.MeshBasicMaterial({
    map: loadTexBg(colorPath),
    side: THREE.DoubleSide,
  });
  const mesh = new THREE.Mesh(
    new TaperedTubeGeometry(curve, 100, 0.04, 0.01, 20),
    mat,
  );
  mesh.position.set(offsetX, offsetY, offsetZ);
  mesh.rotation.set(offRotX, offRotY, offRotZ);
  mesh.name =
    offsetX > 0 &&
    offsetY > 0 &&
    offsetZ > 0 &&
    offRotX > 0 &&
    offRotY > 0 &&
    offRotZ > 0
      ? "tube-right-hoop"
      : "tube-right-hoop";

  return { mesh, mat };
}
function createTubeHoopLeft(
  colorPath,
  offsetX,
  offsetY,
  offsetZ,
  offRotX,
  offRotY,
  offRotZ,
) {
  const points = [
    new THREE.Vector3(1.05, 0.02, -0.05),
    new THREE.Vector3(0.75, 0, -0.03),
    new THREE.Vector3(0.2, 0, -0.01),
    new THREE.Vector3(0.1, 0, 0.01),
    new THREE.Vector3(-0.1, 0.05, 0.03),
    new THREE.Vector3(-0.5, 0.05, 0.05),
  ];

  const curve = new THREE.CatmullRomCurve3(points);
  const mat = new THREE.MeshBasicMaterial({
    map: loadTexBg(colorPath),
    side: THREE.DoubleSide,
  });

  const mesh = new THREE.Mesh(
    new TaperedTubeGeometry(curve, 100, 0.04, 0.01, 20),
    mat,
  );
  mesh.position.set(offsetX, offsetY, offsetZ);
  mesh.rotation.set(offRotX, offRotY, offRotZ);
  mesh.name =
    offsetX > 0 &&
    offsetY > 0 &&
    offsetZ > 0 &&
    offRotX > 0 &&
    offRotY > 0 &&
    offRotZ > 0
      ? "tube-right-hoop"
      : "tube-right-hoop";

  return { mesh, mat };
}
function createCapBottomHoop(
  colorPath,
  offsetX,
  offsetY,
  offsetZ,
  offRotX,
  offRotY,
  offRotZ,
) {
  const mat = new THREE.MeshBasicMaterial({
    map: loadTexBg(colorPath),
    side: THREE.DoubleSide,
  });
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 8), mat);
  mesh.position.set(offsetX, offsetY, offsetZ);
  mesh.rotation.set(offRotX, offRotY, offRotZ);
  mesh.name = "CapBottomHoop";
  return { mesh, mat };
}
function createCapTopHoop(
  colorPath,
  offsetX,
  offsetY,
  offsetZ,
  offRotX,
  offRotY,
  offRotZ,
) {
  const mat = new THREE.MeshBasicMaterial({
    map: loadTexBg(colorPath),
    side: THREE.DoubleSide,
  });
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(0.01, 8, 8), mat);
  mesh.position.set(offsetX, offsetY, offsetZ);
  mesh.rotation.set(offRotX, offRotY, offRotZ);
  mesh.name = "CapTopHoop";
  return { mesh, mat };
}

// ======= Skating =======
function createPatinRight(colorPath, offsetX, offsetY, offsetZ) {
  const points = [
    new THREE.Vector3(-0.9, -0.12, -0.1), // remontée arrière
    new THREE.Vector3(0, -0.12, -0.1), // partie basse plate
    new THREE.Vector3(0.6, -0.12, -0.1),
    new THREE.Vector3(0.7, 0, -0.12), // retroussé avant
    new THREE.Vector3(0.63, 0.28, -0.2), // retroussé avant
  ];
  const curve = new THREE.CatmullRomCurve3(points);
  const mat = new THREE.MeshBasicMaterial({
    map: loadTexBg(colorPath),
    side: THREE.DoubleSide,
  });
  const mesh = new THREE.Mesh(
    new TaperedTubeGeometry(curve, 20, 0.045, 0.01, 20),
    mat,
  );
  mesh.position.set(offsetX, offsetY, offsetZ);
  mesh.name = "patinDroit";
  return { mesh, mat };
}
function createPatinLeft(colorPath, offsetX, offsetY, offsetZ) {
  const points = [
    new THREE.Vector3(-0.9, -0.12, 0.1), // remontée arrière
    new THREE.Vector3(0, -0.12, 0.1), // partie basse plate
    new THREE.Vector3(0.6, -0.12, 0.1),
    new THREE.Vector3(0.7, 0, 0.12), // retroussé avant
    new THREE.Vector3(0.63, 0.28, 0.2), // retroussé avant
  ];
  const curve = new THREE.CatmullRomCurve3(points);
  const mat = new THREE.MeshBasicMaterial({
    map: loadTexBg(colorPath),
    side: THREE.DoubleSide,
  });
  const mesh = new THREE.Mesh(
    new TaperedTubeGeometry(curve, 100, 0.045, 0.01, 20),
    mat,
  );
  mesh.position.set(offsetX, offsetY, offsetZ);
  mesh.name = "patinGauche";
  return { mesh, mat };
}
function createCapBottom(
  colorPath,
  offsetX,
  offsetY,
  offsetZ,
  offRotX,
  offRotY,
  offRotZ,
) {
  const mat = new THREE.MeshBasicMaterial({
    map: loadTex(colorPath),
    side: THREE.DoubleSide,
  });
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 8), mat);
  mesh.position.set(offsetX, offsetY, offsetZ);
  mesh.rotation.set(offRotX, offRotY, offRotZ);
  mesh.name = "CapBottom";
  return { mesh, mat };
}
function createCapTop(
  colorPath,
  offsetX,
  offsetY,
  offsetZ,
  offRotX,
  offRotY,
  offRotZ,
) {
  const mat = new THREE.MeshBasicMaterial({
    map: loadTex(colorPath),
    side: THREE.DoubleSide,
  });
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(0.01, 8, 8), mat);
  mesh.position.set(offsetX, offsetY, offsetZ);
  mesh.rotation.set(offRotX, offRotY, offRotZ);
  mesh.name = "CapTop";
  return { mesh, mat };
}

// ======= Guide =======
function createGuide(
  colorPath,
  offsetX,
  offsetY,
  offsetZ,
  offRotX,
  offRotY,
  offRotZ,
) {
  const points = [
    new THREE.Vector3(-0.21, 0.05, 0.15),
    new THREE.Vector3(-0.2, 0.3, 0.15),
    new THREE.Vector3(0.4, 0.41, 0.15),
    new THREE.Vector3(0.68, 0.41, 0.15),
    new THREE.Vector3(0.69, 0.44, 0.15),
    new THREE.Vector3(0.68, 0.45, 0.15),
    new THREE.Vector3(0.65, 0.44, 0.15),
    new THREE.Vector3(0.6, 0.4, 0.15),
  ];
  const curve = new THREE.CatmullRomCurve3(points);
  const mat = new THREE.MeshBasicMaterial({
    map: loadTexBg(colorPath),
  });
  const mesh = new THREE.Mesh(
    new THREE.TubeGeometry(curve, 100, 0.01, 20),
    mat,
  );
  mesh.position.set(offsetX, offsetY, offsetZ);
  mesh.rotation.set(offRotX, offRotY, offRotZ);
  mesh.name = "guide";
  return { mesh, mat };
}

// ======= Sled =======
const Luge = ({ scene, selectedColor, backgroundColor, guide }) => {
  const groupRef = useRef(null);
  const chassisMatsRef = useRef([]);

  useEffect(() => {
    const lugeGroup = new THREE.Group();
    lugeGroup.name = "luge";
    chassisMatsRef.current = [];

    // ======= Seat =======
    const sitPartsV = [createSitV(selectedColor, -0.45, 0.34, 0, 0, 0, 0.03)];
    sitPartsV.forEach(({ mesh, mat }) => {
      lugeGroup.add(mesh);
      chassisMatsRef.current.push(mat);
    });

    const tubeGroupSit = [
      createTubeChassisSit(backgroundColor, -0.745, 0.25, 0, 1.57, 1.57, 0),
      createTubeChassisSit(backgroundColor, -0.155, 0.285, 0, 1.57, 1.57, 0),
    ];
    tubeGroupSit.forEach(({ mesh, mat }) => {
      lugeGroup.add(mesh);
      chassisMatsRef.current.push(mat);
    });

    // ======= Chassis =======
    const tubeGroupLeft = [
      createTubeChassisLeft(backgroundColor, -0.75, 0.15, -0.26, 0, -0.1, -0.4),
      createTubeChassisLeft(backgroundColor, -0.2, 0.16, -0.26, 0, 0, 0.2),
    ];
    tubeGroupLeft.forEach(({ mesh, mat }) => {
      lugeGroup.add(mesh);
      chassisMatsRef.current.push(mat);
    });

    const tubeGroupRight = [
      createTubeChassisRight(backgroundColor, -0.75, 0.15, 0.26, 0, 0.1, -0.4),
      createTubeChassisRight(backgroundColor, -0.2, 0.16, 0.26, 0, 0, 0.2),
    ];
    tubeGroupRight.forEach(({ mesh, mat }) => {
      lugeGroup.add(mesh);
      chassisMatsRef.current.push(mat);
    });
    // ======= Hoop =======
    const hoopRight = createTubeHoopRight(
      backgroundColor,
      0.2,
      0.28,
      0.24,
      1.57,
      0,
      3.13,
    );
    lugeGroup.add(hoopRight.mesh);
    chassisMatsRef.current.push(hoopRight.mat);

    const hoopLeft = createTubeHoopLeft(
      backgroundColor,
      0.2,
      0.28,
      -0.24,
      -1.57,
      0,
      3.13,
    );
    lugeGroup.add(hoopLeft.mesh);
    chassisMatsRef.current.push(hoopLeft.mat);

    const capGroupBtmHoop = [
      createCapBottomHoop(backgroundColor, -0.845, 0.23, 0.232, 0, 0, 0),
      createCapBottomHoop(backgroundColor, -0.845, 0.23, -0.232, 0, 0, 0),
    ];
    capGroupBtmHoop.forEach(({ mesh, mat }) => {
      lugeGroup.add(mesh);
      chassisMatsRef.current.push(mat);
    });

    const capGroupTopHoop = [
      createCapTopHoop(backgroundColor, 0.7, 0.33, 0.184, 0, 0, 0),
      createCapTopHoop(backgroundColor, 0.7, 0.33, -0.184, 0, 0, 0),
    ];
    capGroupTopHoop.forEach(({ mesh, mat }) => {
      lugeGroup.add(mesh);
      chassisMatsRef.current.push(mat);
    });

    // ======= Skating =======
    const patinsRight = createPatinRight(backgroundColor, 0, 0.19, 0.37);
    lugeGroup.add(patinsRight.mesh);
    chassisMatsRef.current.push(patinsRight.mat);

    const patinsLeft = createPatinLeft(backgroundColor, 0, 0.19, -0.37);
    lugeGroup.add(patinsLeft.mesh);
    chassisMatsRef.current.push(patinsLeft.mat);

    const capGroupBtm = [
      createCapBottom(backgroundColor, -0.9, 0.07, 0.27, 0, 0, 0),
      createCapBottom(backgroundColor, -0.9, 0.07, -0.27, 0, 0, 0),
    ];
    capGroupBtm.forEach(({ mesh, mat }) => {
      lugeGroup.add(mesh);
      chassisMatsRef.current.push(mat);
    });

    const capGroupTop = [
      createCapTop(backgroundColor, 0.63, 0.465, 0.171, 0, 0, 0),
      createCapTop(backgroundColor, 0.63, 0.465, -0.171, 0, 0, 0),
    ];
    capGroupTop.forEach(({ mesh, mat }) => {
      lugeGroup.add(mesh);
      chassisMatsRef.current.push(mat);
    });

    // ======= Guide =======
    const guideGroup = [
      createGuide(guide, -0.03, 0.5, -0.15, 1.57, 0, -0.1),
      createGuide(guide, -0.03, 0.2, 0.15, -1.57, 0, -0.1),
    ];
    guideGroup.forEach(({ mesh, mat }) => {
      lugeGroup.add(mesh);
      chassisMatsRef.current.push(mat);
    });
    // =====================================================
    groupRef.current = lugeGroup;
    scene.add(lugeGroup);

    return () => {
      scene.remove(lugeGroup);
      lugeGroup.position.set(-0.15, -0.28, 0);
      //   lugeGroup.traverse((obj) => {
      //     if (obj.isMesh) {
      //       obj.geometry.dispose();
      //       obj.material.dispose();
      //     }
      //   });
    };
  }, [scene, selectedColor, backgroundColor, guide]);

  return null;
};

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

const LugeAD = ({
  img1,
  img2,
  img3,
  img4,
  img5,
  wood,
  guide: guideProp,
  skating: skatingProp,
  hoop: hoopProp,
  variantIds,
}) => {
  const variantIdsArray = useMemo(
    () =>
      variantIds
        ? variantIds
            .split(",")
            .map((id) => id.trim())
            .filter(Boolean)
        : [],
    [variantIds],
  );
  const COLORS = useMemo(
    () => [
      {
        id: "color-1",
        value: img1,
        src: img1,
        bg: wood,
        guide: guideProp,
        hoop: hoopProp,
        skating: skatingProp,
      },
      {
        id: "color-2",
        value: img2,
        src: img2,
        bg: wood,
        guide: guideProp,
        hoop: hoopProp,
        skating: skatingProp,
      },
      {
        id: "color-3",
        value: img3,
        src: img3,
        bg: wood,
        guide: guideProp,
        hoop: hoopProp,
        skating: skatingProp,
      },
      {
        id: "color-4",
        value: img4,
        src: img4,
        bg: wood,
        guide: guideProp,
        hoop: hoopProp,
        skating: skatingProp,
      },
      {
        id: "color-5",
        value: img5,
        src: img5,
        bg: wood,
        guide: guideProp,
        hoop: hoopProp,
        skating: skatingProp,
      },
    ],
    [img1, img2, img3, img4, img5, wood, guideProp, hoopProp, skatingProp],
  );

  const [selectedColor, setSelectedColor] = useState(COLORS[0].value);
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);
  const [backgroundColor, setBackgroundColor] = useState(COLORS[0].bg);
  const [guideColor, setGuideColor] = useState(COLORS[0].guide);
  const [hoopColor, setHoopColor] = useState(COLORS[0].hoop);
  const [skatingColor, setSkatingColor] = useState(COLORS[0].skating);

  // UI state
  const [autoRot, setAutoRot] = useState(false);
  // const [wireMode, setWireMode] = useState(false);
  // const [infoOpen, setInfoOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);
  // const [cartStatus, setCartStatus] = useState(null); // null | 'adding' | 'added' | 'error'

  // const addToCart = async () => {
  //   const variantId = variantIdsArray[selectedColorIndex];
  //   if (!variantId) return;
  //   setCartStatus("adding");
  //   try {
  //     const res = await fetch("/cart/add.js", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({ id: Number(variantId), quantity: 1 }),
  //     });
  //     if (!res.ok) throw new Error("cart error");
  //     setCartStatus("added");
  //   } catch {
  //     setCartStatus("error");
  //   } finally {
  //     setTimeout(() => setCartStatus(null), 2500);
  //   }
  // };

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

  // // Wireframe : appliquer au groupe luge quand le mode change
  // useEffect(() => {
  //   wireModeRef.current = wireMode;
  //   if (!lugeGroupRef.current) return;
  //   lugeGroupRef.current.traverse((o) => {
  //     if (o.isMesh) o.material.wireframe = wireMode;
  //   });
  // }, [wireMode]);

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
    const width = mount.offsetWidth || 1000;
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
      <div
        style={{
          position: "absolute",
          top: 3,
          left: 90,
          display: "block",
          gap: 8,
          zIndex: 10,
        }}
      >
        <div
          style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: 35,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "rgb(0, 0, 0)",
          }}
        >
          Naviser
        </div>
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
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {COLORS.map((color, idx) => (
            <button
              key={color.id}
              title={color.id}
              onClick={(e) => {
                e.preventDefault();
                setSelectedColorIndex(idx);
                setSelectedColor(color.value);
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
                  selectedColor === color.value
                    ? "2px solid #005AA8"
                    : "2px solid transparent",
                boxShadow:
                  selectedColor === color.value
                    ? "0 0 2px rgba(64, 85, 248, 0.4)"
                    : "none",
                backgroundImage: `url('${color.src}')`,
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
        {/* <div
          style={{ width: 1, height: 18, background: "rgba(255,255,255,0.08)" }}
        /> */}
        {/* <button
          onClick={() => setWireMode((v) => !v)}
          style={wireMode ? btnOn : btnBase}
        >
          ⬡ Wire
        </button> */}
        {/* <div
          style={{ width: 1, height: 18, background: "rgba(255,255,255,0.08)" }}
        /> */}
        {/* <button
          onClick={() => setInfoOpen((v) => !v)}
          style={infoOpen ? btnOn : btnBase}
        >
          ℹ Info
        </button> */}
      </div>

      {/* Panneau info */}
      {/* <div
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          bottom: 0,
          width: 220,
          background: "#141618",
          borderLeft: "1px solid rgba(255,255,255,0.08)",
          padding: "24px 18px",
          zIndex: 15,
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: 16,
          // transform: infoOpen ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.3s cubic-bezier(0.25,0.46,0.45,0.94)",
        }}
      > */}
      {/* <div
          style={{
            fontFamily: "'Syne', sans-serif",
            fontSize: 14,
            fontWeight: 700,
            color: "#ffffff",
            letterSpacing: "0.02em",
          }}
        >
          Fiche Produit
        </div>
        {[
          ["Modèle", "Luge"],
          null,
          ["Châssis", "Bois"],
          ["Siège", "Nylon"],
          ["Patins", "Acier inox"],
          null,
          ["Dimensions", "110 × 45 × 22 cm"],
          ["Poids", "3,2 kg"],
          ["Charge max.", "80 kg"],
          null,
          ["Âge", "6 ans et plus"],
        ].map((row, i) =>
          row === null ? (
            <div
              key={i}
              style={{ height: 1, background: "rgba(255,255,255,0.08)" }}
            />
          ) : (
            <div
              key={i}
              style={{ display: "flex", flexDirection: "column", gap: 3 }}
            >
              <div
                style={{
                  fontFamily: "'DM Mono', monospace",
                  fontSize: 9,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "rgba(240,237,232,0.4)",
                }}
              >
                {row[0]}
              </div>
              <div
                style={{
                  fontFamily: "'DM Mono', monospace",
                  fontSize: 12,
                  color: "#f0ede8",
                }}
              >
                {row[1]}
              </div>
            </div>
          ),
        )}
      </div> */}

      {/* Bouton Ajouter au panier
      {variantIdsArray.length > 0 && (
        <div
          style={{
            position: "absolute",
            top: 16,
            // right: infoOpen ? 236 : 16,
            zIndex: 12,
            transition: "right 0.3s cubic-bezier(0.25,0.46,0.45,0.94)",
          }}
        >
          <button
            onClick={addToCart}
            disabled={cartStatus === "adding"}
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: 11,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              padding: "8px 14px",
              borderRadius: 8,
              border: "1px solid rgba(255,255,255,0.15)",
              background:
                cartStatus === "added"
                  ? "rgba(80,200,80,0.15)"
                  : cartStatus === "error"
                    ? "rgba(200,80,80,0.15)"
                    : "rgba(232,248,64,0.1)",
              color:
                cartStatus === "added"
                  ? "#ffffff"
                  : cartStatus === "error"
                    ? "#e88080"
                    : "#eaff00",
              cursor: cartStatus === "adding" ? "wait" : "pointer",
              backdropFilter: "blur(12px)",
              transition: "all 0.2s ease",
            }}
          >
            {cartStatus === "adding"
              ? "Ajout..."
              : cartStatus === "added"
                ? "✓ Ajouté"
                : cartStatus === "error"
                  ? "✗ Erreur"
                  : "+ Panier"}
          </button>
        </div>
      )} */}

      {/* Composant 3D */}
      {scene && (
        <Luge
          scene={scene}
          selectedColor={selectedColor}
          backgroundColor={backgroundColor}
          guide={guideColor}
        />
      )}
    </div>
  );
};

export default LugeAD;

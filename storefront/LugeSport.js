import { useEffect, useRef } from "react";
import * as THREE from "three";
import { TaperedTubeGeometry } from "./TaperedTubeGeometry.js";
import { loadTex } from "./utils.js";

// ======= Seat =======
function createChassis(
  colorPath,
  offsetX,
  offsetY,
  offsetZ,
  offRotX,
  offRotY,
  offRotZ,
) {
  const points = [
    new THREE.Vector3(0.16, -0.05, 0),
    new THREE.Vector3(0.27, -0.1, 0),
    new THREE.Vector3(0.28, -0.05, 0),
    new THREE.Vector3(-0, -0.06, 0),
    new THREE.Vector3(-0.28, -0.05, 0),
    new THREE.Vector3(-0.27, -0.1, 0),
    new THREE.Vector3(-0.25, -0.1, 0),
  ];

  const curve = new THREE.CatmullRomCurve3(points);
  const mat = new THREE.MeshBasicMaterial({ map: loadTex(colorPath) });
  const mesh = new THREE.Mesh(
    new TaperedTubeGeometry(curve, 100, 0.04, 0.02, 2),
    mat,
  );
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
    map: loadTex(colorPath),
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
  const points = [
    new THREE.Vector3(0, -0.08, 0.03),
    new THREE.Vector3(0, -0.14, 0),
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0, 0.14, 0.03),
    new THREE.Vector3(0, 0.06, 0.03),
  ];

  const curve = new THREE.CatmullRomCurve3(points);
  const mat = new THREE.MeshBasicMaterial({ map: loadTex(colorPath) });
  const mesh = new THREE.Mesh(new THREE.TubeGeometry(curve, 3, 0.03, 2), mat);
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
  const points = [
    new THREE.Vector3(0, 0.08, -0.03),
    new THREE.Vector3(0, 0.14, 0),
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0, -0.12, 0.03),
    new THREE.Vector3(0, -0.06, 0.03),
  ];

  const curve = new THREE.CatmullRomCurve3(points);
  const mat = new THREE.MeshBasicMaterial({ map: loadTex(colorPath) });
  const mesh = new THREE.Mesh(new THREE.TubeGeometry(curve, 3, 0.03, 2), mat);
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
    new THREE.Vector3(0.95, 0.02, 0.05),
    new THREE.Vector3(0.75, 0, 0.03),
    new THREE.Vector3(0.2, 0, 0.01),
    new THREE.Vector3(0.1, 0, -0.01),
    new THREE.Vector3(-0.1, 0.05, -0.03),
    new THREE.Vector3(-0.5, 0.05, -0.05),
  ];
  const curve = new THREE.CatmullRomCurve3(points);
  const mat = new THREE.MeshBasicMaterial({
    map: loadTex(colorPath),
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
    new THREE.Vector3(0.95, 0.02, -0.05),
    new THREE.Vector3(0.75, 0, -0.03),
    new THREE.Vector3(0.2, 0, -0.01),
    new THREE.Vector3(0.1, 0, 0.01),
    new THREE.Vector3(-0.1, 0.05, 0.03),
    new THREE.Vector3(-0.5, 0.05, 0.05),
  ];

  const curve = new THREE.CatmullRomCurve3(points);
  const mat = new THREE.MeshBasicMaterial({
    map: loadTex(colorPath),
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
    map: loadTex(colorPath),
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
    map: loadTex(colorPath),
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
    new THREE.Vector3(-0.8, -0.12, -0.1), // remontée arrière
    new THREE.Vector3(0, -0.12, -0.1), // partie basse plate
    new THREE.Vector3(0.6, -0.12, -0.1),
    new THREE.Vector3(0.7, 0, -0.12), // retroussé avant
    new THREE.Vector3(0.63, 0.28, -0.2), // retroussé avant
  ];
  const curve = new THREE.CatmullRomCurve3(points);
  const mat = new THREE.MeshBasicMaterial({
    map: loadTex(colorPath),
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
    new THREE.Vector3(-0.8, -0.12, 0.1), // remontée arrière
    new THREE.Vector3(0, -0.12, 0.1), // partie basse plate
    new THREE.Vector3(0.6, -0.12, 0.1),
    new THREE.Vector3(0.7, 0, 0.12), // retroussé avant
    new THREE.Vector3(0.63, 0.28, 0.2), // retroussé avant
  ];
  const curve = new THREE.CatmullRomCurve3(points);
  const mat = new THREE.MeshBasicMaterial({
    map: loadTex(colorPath),
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
    map: loadTex(colorPath),
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

// ======= Sled Sport =======
const LugeSport = ({
  scene,
  selectedColor,
  backgroundColor,
  guide,
  hoop,
  skating,
}) => {
  const groupRef = useRef(null);
  const chassisMatsRef = useRef([]);

  useEffect(() => {
    const lugeGroup = new THREE.Group();
    lugeGroup.name = "luge";
    chassisMatsRef.current = [];

    // ======= Seat =======
    const sitParts = [
      createChassis(selectedColor, -0.56, 0.33, 0, 0, 1.57, 0),
      createChassis(selectedColor, -0.49, 0.333, 0, 0, 1.57, 0),
      createChassis(selectedColor, -0.42, 0.335, 0, 0, 1.57, 0),
      createChassis(selectedColor, -0.35, 0.34, 0, 0, 1.57, 0),
      createChassis(selectedColor, -0.27, 0.345, 0, 0, 1.57, 0),
      createChassis(selectedColor, -0.2, 0.35, 0, 0, 1.57, 0),
      // ====
      createChassis(selectedColor, -0.4, 0.34, 0.2, 0, 0, 0.05),
      createChassis(selectedColor, -0.4, 0.34, 0.13, 0, 0, 0.05),
      createChassis(selectedColor, -0.4, 0.34, 0.07, 0, 0, 0.05),
      createChassis(selectedColor, -0.4, 0.34, 0, 0, 0, 0.05),
      createChassis(selectedColor, -0.4, 0.34, -0.07, 0, 0, 0.05),
      createChassis(selectedColor, -0.4, 0.34, -0.13, 0, 0, 0.05),
      createChassis(selectedColor, -0.4, 0.34, -0.2, 0, 0, 0.05),
    ];
    sitParts.forEach(({ mesh, mat }) => {
      lugeGroup.add(mesh);
      chassisMatsRef.current.push(mat);
    });

    const tubeGroupSit = [
      createTubeChassisSit(backgroundColor, -0.645, 0.25, 0, 1.57, 1.57, 0),
      createTubeChassisSit(backgroundColor, -0.155, 0.28, 0, 1.57, 1.57, 0),
    ];
    tubeGroupSit.forEach(({ mesh, mat }) => {
      lugeGroup.add(mesh);
      chassisMatsRef.current.push(mat);
    });

    // ======= Chassis =======
    const tubeGroupLeft = [
      createTubeChassisLeft(hoop, -0.65, 0.16, -0.26, 0, 0, 0),
      createTubeChassisLeft(hoop, -0.2, 0.16, -0.26, 0, 0, 0),
    ];
    tubeGroupLeft.forEach(({ mesh, mat }) => {
      lugeGroup.add(mesh);
      chassisMatsRef.current.push(mat);
    });

    const tubeGroupRight = [
      createTubeChassisRight(hoop, -0.65, 0.16, 0.26, 0, 0, 0),
      createTubeChassisRight(hoop, -0.2, 0.16, 0.26, 0, 0, 0),
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
      createCapBottomHoop(backgroundColor, -0.75, 0.23, 0.23, 0, 0, 0),
      createCapBottomHoop(backgroundColor, -0.75, 0.23, -0.23, 0, 0, 0),
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
    const patinsRight = createPatinRight(skating, 0, 0.19, 0.37);
    lugeGroup.add(patinsRight.mesh);
    chassisMatsRef.current.push(patinsRight.mat);

    const patinsLeft = createPatinLeft(skating, 0, 0.19, -0.37);
    lugeGroup.add(patinsLeft.mesh);
    chassisMatsRef.current.push(patinsLeft.mat);

    const capGroupBtm = [
      createCapBottom(skating, -0.8, 0.07, 0.27, 0, 0, 0),
      createCapBottom(skating, -0.8, 0.07, -0.27, 0, 0, 0),
    ];
    capGroupBtm.forEach(({ mesh, mat }) => {
      lugeGroup.add(mesh);
      chassisMatsRef.current.push(mat);
    });

    const capGroupTop = [
      createCapTop(skating, 0.63, 0.471, 0.169, 0, 0, 0),
      createCapTop(skating, 0.63, 0.471, -0.169, 0, 0, 0),
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
      lugeGroup.traverse((obj) => {
        if (obj.isMesh) {
          obj.geometry.dispose();
          obj.material.dispose();
        }
      });
    };
  }, [scene, selectedColor, backgroundColor, guide, hoop, skating]);
  return null;
};
export default LugeSport;

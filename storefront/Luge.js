import { useEffect, useRef } from "react";
import * as THREE from "three";
import { TaperedTubeGeometry } from "./TaperedTubeGeometry.js";
import { loadTex } from "./utils.js";

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
// function createSitH(
//   colorPath,
//   offsetX,
//   offsetY,
//   offsetZ,
//   offRotX,
//   offRoty,
//   offRotZ,
// ) {
//   const points = [
//     new THREE.Vector3(0.16, -0.05, 0),
//     new THREE.Vector3(0.27, -0.1, 0),
//     new THREE.Vector3(0.28, -0.05, 0),
//     new THREE.Vector3(-0, -0.04, 0),
//     new THREE.Vector3(-0.4, -0.05, 0),
//     new THREE.Vector3(-0.37, -0.1, 0),
//     new THREE.Vector3(-0.35, -0.1, 0),
//   ];
//   const curve = new THREE.CatmullRomCurve3(points);
//   const mat = new THREE.MeshBasicMaterial({ map: loadTex(colorPath) });
//   const mesh = new THREE.Mesh(
//     new TaperedTubeGeometry(curve, 100, 0.04, 0.02, 2),
//     mat,
//   );
//   mesh.position.set(offsetX, offsetY, offsetZ);
//   mesh.rotation.set(offRotX, offRoty, offRotZ);
//   mesh.name = "chassis";
//   return { mesh, mat };
// }
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
  const mat = new THREE.MeshBasicMaterial({ map: loadTex(colorPath) });
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
  const mat = new THREE.MeshBasicMaterial({ map: loadTex(colorPath) });
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
    new THREE.Vector3(1.05, 0.02, -0.05),
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
    new THREE.Vector3(-0.9, -0.12, -0.1), // remontée arrière
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
    new THREE.Vector3(-0.9, -0.12, 0.1), // remontée arrière
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

// ======= Sled =======
const Luge = ({ scene, selectedColorImgAD, backgroundColor, guide }) => {
  const groupRef = useRef(null);
  const chassisMatsRef = useRef([]);

  useEffect(() => {
    const lugeGroup = new THREE.Group();
    lugeGroup.name = "luge";
    chassisMatsRef.current = [];

    // ======= Seat =======
    const sitPartsV = [createSitV(selectedColorImgAD, -0.45, 0.34, 0, 0, 0, 0.03)];
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
      lugeGroup.traverse((obj) => {
        if (obj.isMesh) {
          obj.geometry.dispose();
          obj.material.dispose();
        }
      });
    };
  }, [scene, selectedColorImgAD, backgroundColor, guide]);

  return null;
};

export default Luge;

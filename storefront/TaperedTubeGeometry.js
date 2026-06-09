import * as THREE from "three";

/**
 * Géométrie de tube conique (rayon qui varie de radiusStart à radiusEnd).
 * Extrait de Luge.js / LugeKind.js / LugeSport.js pour éviter la triplication
 * et réduire la taille du bundle.
 */
export class TaperedTubeGeometry extends THREE.BufferGeometry {
  constructor(curve, tubularSegments, radiusStart, radiusEnd, radialSegments) {
    super();
    const frames = curve.computeFrenetFrames(tubularSegments, false);
    const positions = [];
    const indices = [];

    for (let i = 0; i <= tubularSegments; i++) {
      const t = i / tubularSegments;
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

    for (let i = 0; i < tubularSegments; i++) {
      for (let j = 0; j < radialSegments; j++) {
        const a = i * (radialSegments + 1) + j;
        const b = (i + 1) * (radialSegments + 1) + j;
        indices.push(a, b, a + 1);
        indices.push(b, b + 1, a + 1);
      }
    }

    const uvs = [];
    for (let i = 0; i <= tubularSegments; i++) {
      for (let j = 0; j <= radialSegments; j++) {
        uvs.push(i / tubularSegments, j / radialSegments);
      }
    }

    this.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
    this.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    this.setIndex(indices);
    this.computeVertexNormals();
  }
}

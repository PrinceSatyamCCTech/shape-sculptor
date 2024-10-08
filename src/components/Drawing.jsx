import * as BABYLON from "@babylonjs/core";

const Drawing = ({ scene, drawingPoints, meshSphere }) => {
  const addPoint = (point) => {
    const marker = BABYLON.MeshBuilder.CreateSphere("marker", { diameter: 0.2 }, scene);
    meshSphere.current.push(marker);
    marker.position = point;
    drawingPoints.current.push(point);
  };

  const createPolygon = () => {
    return BABYLON.MeshBuilder.CreatePolygon(
      "polygonShape",
      { shape: drawingPoints.current },
      scene,
      earcut
    );
  };

  return { addPoint, createPolygon };
};

export default Drawing;

import * as BABYLON from "@babylonjs/core";
import earcut from "earcut";

const Extruding = ({ scene, drawingPoints }) => {
  const extrudeShape = () => {
    const extrudedShape = BABYLON.MeshBuilder.ExtrudePolygon(
      "extrudedShape",
      { shape: drawingPoints, depth: 2, wrap: true, updatable: true },
      scene,
      earcut
    );
    extrudedShape.position.y = 2;
    return extrudedShape;
  };

  return { extrudeShape };
};

export default Extruding;

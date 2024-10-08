import { Engine, Scene, Vector3, ArcRotateCamera, HemisphericLight, PointerDragBehavior } from "@babylonjs/core";
import { useRef } from "react";

const useBabylonSetup = (canvasRef, drawingMode, extrudingMode, moveMode, vertexEditMode) => {
  const drawingPoints = useRef([]);
  const meshSphere = useRef([]);
  const extrudedShape = useRef(null);
  const polygonShape = useRef(null);

  const setupScene = () => {
    const engine = new Engine(canvasRef.current, true);
    const scene = new Scene(engine);
    const camera = new ArcRotateCamera(
      "camera",
      -Math.PI / 2,
      Math.PI / 2,
      5,
      Vector3.Zero(),
      scene
    );
    camera.position = new Vector3(0, 15, -10);
    camera.attachControl(canvasRef.current, true);

    const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);
    engine.runRenderLoop(() => scene.render());

    return { engine, scene };
  };

  useEffect(() => {
    const { scene, engine } = setupScene();
    const pointerDragBehavior = new PointerDragBehavior({ dragPlaneNormal: Vector3.Up() });

    scene.onPointerDown = (event) => {
      // Drawing, extruding, and vertex editing logic (simplified for readability)
    };

    return { engine, scene };
  }, [drawingMode, extrudingMode, moveMode, vertexEditMode]);

  return { setupScene };
};

export default useBabylonSetup;

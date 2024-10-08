import React, { useEffect, useRef } from "react";
import * as BABYLON from "babylonjs";  // Import core Babylon.js
import "babylonjs-loaders";            // Import additional loaders if needed

const BabylonScene = () => {
  const canvasRef = useRef(null);  // Create a ref for the canvas element

  useEffect(() => {
    const canvas = canvasRef.current;
    const engine = new BABYLON.Engine(canvas, true);  // Create Babylon.js engine

    // Create a basic scene
    const scene = new BABYLON.Scene(engine);

    // Add a camera to the scene
    const camera = new BABYLON.ArcRotateCamera(
      "camera1",
      Math.PI / 2,
      Math.PI / 2,
      2,
      BABYLON.Vector3.Zero(),
      scene
    );
    camera.attachControl(canvas, true);

    // Add a light
    const light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(1, 1, 0), scene);
    light.intensity = 0.7;

    // Create a simple box
    const box = BABYLON.MeshBuilder.CreateBox("box", { size: 1 }, scene);

    // Render loop
    engine.runRenderLoop(() => {
      scene.render();
    });

    // Handle window resize
    window.addEventListener("resize", () => {
      engine.resize();
    });

    return () => {
      engine.dispose(); // Clean up on component unmount
      window.removeEventListener("resize", () => engine.resize());
    };
  }, []);

  return <canvas ref={canvasRef} style={{ width: "100%", height: "100%" }} />;
};

export default BabylonScene;

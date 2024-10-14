import React, { useEffect, useRef, useState } from "react";
import * as BABYLON from "@babylonjs/core";
import * as GUI from "@babylonjs/gui";
import earcut from "earcut";

const Viewer = () => {
  const canvasRef = useRef(null);

  const [drawingMode, setDrawingMode] = useState(false);
  const [extrudingMode, setExtrudingMode] = useState(false);
  const [moveMode, setMoveMode] = useState(false);
  const [vertexEditMode, setVertexEditMode] = useState(false);

  const drawingRef = useRef(drawingMode);
  const extrudingRef = useRef(extrudingMode);
  const moveRef = useRef(moveMode);
  const vertexEditRef = useRef(vertexEditMode);

  useEffect(() => {
    drawingRef.current = drawingMode;
  }, [drawingMode]);

  useEffect(() => {
    extrudingRef.current = extrudingMode;
  }, [extrudingMode]);

  useEffect(() => {
    moveRef.current = moveMode;
  }, [moveMode]);

  useEffect(() => {
    vertexEditRef.current = vertexEditMode;
  }, [vertexEditMode]);

  let polygonShape = useRef(null);
  let extrudedShape = useRef(null);

  let drawingPoints = [];
  let vertexPoints = [];
  let meshSphere = [];

  useEffect(() => {
    const engine = new BABYLON.Engine(canvasRef.current, true);
    const scene = new BABYLON.Scene(engine);

    const camera = new BABYLON.ArcRotateCamera(
      "camera",
      -Math.PI / 2,
      Math.PI / 2,
      5,
      BABYLON.Vector3.Zero(),
      scene
    );
    camera.position = new BABYLON.Vector3(0, 15, -10);
    camera.attachControl(canvasRef.current, true);

    const groundMaterial = new BABYLON.StandardMaterial("groundMaterial", scene);
    groundMaterial.diffuseColor = new BABYLON.Color3(40 / 255, 30 / 255, 0);
    const ground = BABYLON.MeshBuilder.CreateGround("ground", { width: 10, height: 10 }, scene);
    ground.position.y = 0;
    ground.material = groundMaterial;

    const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);

    engine.runRenderLoop(() => {
      scene.render();
    });

    const resizeHandler = () => {
      engine.resize();
    };
    window.addEventListener("resize", resizeHandler);

    scene.onPointerDown = (event) => {
      if (drawingRef.current && event.button === 0) {
        const pickResult = scene.pick(scene.pointerX, scene.pointerY);
        if (pickResult.hit) {
          const point = pickResult.pickedPoint.clone();
          const marker = BABYLON.MeshBuilder.CreateSphere("marker", { diameter: 0.2 }, scene);
          meshSphere.push(marker);
          marker.position = point;
          drawingPoints.push(point);
        }
      }

      if (drawingRef.current && event.button === 2 && drawingPoints.length >= 3) {
        polygonShape.current = BABYLON.MeshBuilder.CreatePolygon(
          "polygonShape",
          { shape: drawingPoints },
          scene,
          earcut
        );
        polygonShape.current.position.y = 0.01;

        const groundMaterial = new BABYLON.StandardMaterial("groundMaterial", scene);
        groundMaterial.diffuseColor = new BABYLON.Color3(0, 0, 1);
        polygonShape.current.material = groundMaterial;

        meshSphere.forEach((sphere) => sphere.dispose());
        setDrawingMode(false);
      }

      if (extrudingRef.current && event.button === 0) {
        const pickResult = scene.pick(scene.pointerX, scene.pointerY);
        if (pickResult.hit && pickResult.pickedMesh === polygonShape.current) {
          extrudedShape.current = BABYLON.MeshBuilder.ExtrudePolygon(
            "extrudedShape",
            { shape: drawingPoints, depth: 2, wrap: true, updatable: true },
            scene,
            earcut
          );
          extrudedShape.current.position.y = 2;

          const extrudeMat = new BABYLON.StandardMaterial("Extruded Mesh Material", scene);
          extrudeMat.diffuseColor = new BABYLON.Color3(0, 0, 1);
          extrudeMat.backFaceCulling = false;
          extrudeMat.twoSidedLighting = true;
          extrudedShape.current.material = extrudeMat;

          polygonShape.current.dispose();
          setExtrudingMode(false);
        }
      }

      const pickResult = scene.pick(scene.pointerX, scene.pointerY);
      if (pickResult.hit && pickResult.pickedMesh === extrudedShape.current && moveRef.current) {
        pickResult.pickedMesh.addBehavior(new BABYLON.PointerDragBehavior({ dragPlaneNormal: BABYLON.Vector3.Up() }));
      } else if (pickResult.pickedMesh) {
        pickResult.pickedMesh.removeBehavior(new BABYLON.PointerDragBehavior({ dragPlaneNormal: BABYLON.Vector3.Up() }));
      }

      if (vertexEditRef.current) {
        const pickResult = scene.pick(scene.pointerX, scene.pointerY);
        if (pickResult.hit && pickResult.pickedMesh === extrudedShape.current && event.button === 0) {
          let verticesData = [];
          const sharedVertices = new Map();
          const uniqueVertices = [];
          let originalVertexData = extrudedShape.current.getVerticesData(BABYLON.VertexBuffer.PositionKind);
          const worldMatrix = extrudedShape.current.getWorldMatrix();

          for (let i = 0; i < originalVertexData.length; i += 3) {
            const originalVertex = new BABYLON.Vector3(
              originalVertexData[i],
              originalVertexData[i + 1],
              originalVertexData[i + 2]
            );
            verticesData.push(originalVertex.asArray());
          }

          verticesData.forEach((vertex, index) => {
            const key = vertex.join(" ");
            if (sharedVertices.has(key)) {
              sharedVertices.set(key, [...sharedVertices.get(key), index]);
            } else {
              sharedVertices.set(key, [index]);
              const transformedVertex = BABYLON.Vector3.TransformCoordinates(
                BABYLON.Vector3.FromArray(vertex),
                worldMatrix
              ).asArray();
              uniqueVertices.push({ vertex: transformedVertex, key });
            }
          });

          uniqueVertices.forEach(({ vertex, key }) => {
            const indices = sharedVertices.get(key);
            const pointerDrag = new BABYLON.PointerDragBehavior();

            pointerDrag.onDragObservable.add((info) => {
              indices.forEach((index) => {
                verticesData[index] = BABYLON.Vector3.FromArray(verticesData[index])
                  .add(info.delta)
                  .asArray();
              });

              extrudedShape.current.updateVerticesData(BABYLON.VertexBuffer.PositionKind, verticesData.flat());
            });

            const sphere = BABYLON.MeshBuilder.CreateSphere("vertexSphere", { diameter: 0.3 }, scene);
            sphere.position = BABYLON.Vector3.FromArray(vertex);
            pointerDrag.dragDeltaRatio = 1;
            sphere.addBehavior(pointerDrag);
            vertexPoints.push(sphere);
          });
        }
      }
    };

    const advancedTexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI", true, scene);

    const buttonContainer = new GUI.StackPanel();
    buttonContainer.width = "500px";
    buttonContainer.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    buttonContainer.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
    buttonContainer.paddingTopInPixels = "500px";
    advancedTexture.addControl(buttonContainer);

    const drawButton = GUI.Button.CreateSimpleButton("drawButton", "Draw");
    drawButton.width = "150px";
    drawButton.height = "100px";
    drawButton.color = "white";
    drawButton.paddingTop = "30px";
    drawButton.background = "green";
    drawButton.onPointerDownObservable.add(() => {
      setDrawingMode(true);
    });
    buttonContainer.addControl(drawButton);

    const extrudeButton = GUI.Button.CreateSimpleButton("extrudeButton", "Extrude");
    extrudeButton.width = "150px";
    extrudeButton.height = "100px";
    extrudeButton.color = "white";
    extrudeButton.background = "brown";
    extrudeButton.paddingTop = "30px";
    extrudeButton.onPointerDownObservable.add(() => setExtrudingMode(true));
    buttonContainer.addControl(extrudeButton);

    const moveButton = GUI.Button.CreateSimpleButton("moveButton", "Move");
    moveButton.width = "150px";
    moveButton.height = "100px";
    moveButton.color = "white";
    moveButton.background = "blue";
    moveButton.paddingTop = "30px";
    moveButton.onPointerDownObservable.add(() => {
      setMoveMode((prev) => !prev);
    });
    buttonContainer.addControl(moveButton);

    const vertexEditButton = GUI.Button.CreateSimpleButton("vertexEditButton", "Edit Vertex");
    vertexEditButton.width = "150px";
    vertexEditButton.height = "100px";
    vertexEditButton.color = "white";
    vertexEditButton.background = "orange";
    vertexEditButton.paddingTop = "30px";
    vertexEditButton.onPointerDownObservable.add(() => {
      setVertexEditMode((prev) => {
        if (prev) {
          vertexPoints.forEach((vertex) => vertex.dispose());
          vertexPoints = [];
        }
        return !prev;
      });
    });
    buttonContainer.addControl(vertexEditButton);

    return () => {
      window.removeEventListener("resize", resizeHandler);
      scene.dispose();
      engine.dispose();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: "100vw", height: "100vh", overflow: "hidden" }}
    />
  );
};

export default Viewer;

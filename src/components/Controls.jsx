import React from "react";

const Controls = ({
  setDrawingMode,
  setExtrudingMode,
  setMoveMode,
  setVertexEditMode,
  moveMode,
  vertexEditMode,
}) => {
  return (
    <div className="controls">
      <button
        style={{ color: "white", backgroundColor: "green" }}
        onClick={() => setDrawingMode(true)}
      >
        Draw
      </button>
      <button
        style={{ color: "white", backgroundColor: "brown" }}
        onClick={() => setExtrudingMode(true)}
      >
        Extrude
      </button>
      <button
        style={{ color: "white", backgroundColor: "blue" }}
        onClick={() => setMoveMode(!moveMode)}
      >
        {moveMode ? "Stop Move" : "Move"}
      </button>
      <button
        style={{ color: "white", backgroundColor: "orange" }}
        onClick={() => setVertexEditMode(!vertexEditMode)}
      >
        {vertexEditMode ? "Stop Vertex Edit" : "Edit Vertex"}
      </button>
    </div>
  );
};

export default Controls;

import {
  ReactFlow,
  Background,
  Controls,
} from "@xyflow/react";
import '@xyflow/react/dist/style.css';

export const DialogMainPanel = () => {
  return (
    <div style={{ width: "100%", height: "100%" }}>
      <ReactFlow >
        <Background />
        <Controls style={{
          backgroundColor: '#191724',
          border: '2px solid #31748f',
          borderRadius: '0.375rem',
          overflow:'hidden',
        }} />
      </ReactFlow>
    </div>
  )
}

import {
  ReactFlow,
  Background,
  Controls,
} from "@xyflow/react";
import '@xyflow/react/dist/style.css';

export const DialogMainPanel = () => {
  return (
    <div style={{ width: "100%", height: "100%" }}>
      <ReactFlow>
        <Background />
        <Controls style={{color:"black"}} />
      </ReactFlow>
    </div>
  )
}

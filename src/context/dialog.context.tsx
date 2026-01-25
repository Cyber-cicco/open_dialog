import { createContext, PropsWithChildren, useCallback, useState } from "react"
import { Dialog } from "../bindings/Dialog"
import { addEdge, applyEdgeChanges, applyNodeChanges, Connection, EdgeChange, Node, NodeChange, type Edge } from "@xyflow/react"
import { DialogNode } from "../bindings/DialogNode"
import { Choices } from "../bindings/Choices"
import { Phylum } from "../bindings/Phylum"
import { useGlobalState } from "./global-state.context"
import { getOptimalHandles, traverseDialogAndGetNodesAndEdges } from "./helpers/dialog.helpers"
import { useGraphMaps } from "../hooks/useGraphMaps"
import { useDialogFeed } from "../hooks/useDialogFeed"
import { useDialogPersistence } from "../hooks/useDialogPersistence"

type DialogNodeData = DialogNode & { isRootNode?: boolean }
type ChoicesNodeData = Choices & { isRootNode?: boolean }
type PhylumNodeData = Phylum & { isRootNode?: boolean }

export type DialogFlowNode = Node<DialogNodeData, 'dialogNode'>
export type ChoicesFlowNode = Node<ChoicesNodeData, 'choiceNode'>
export type PhylumFlowNode = Node<PhylumNodeData, 'phylumNode'>
export type AppNode = DialogFlowNode | ChoicesFlowNode | PhylumFlowNode
export type Pos = { x: number, y: number }

export type DialogContextType = {
  nodes: AppNode[]
  edges: Edge[]
  rootNodeId: string | null
  dialog: Dialog | undefined
  dialogFeed: AppNode[]

  loadDialog: (dialog: Dialog) => void
  createDialogNode: (pos: Pos) => void
  setRootNode: (nodeId: string) => void
  updateNodeData: (nodeId: string, data: Partial<DialogNodeData | ChoicesNodeData | PhylumNodeData>) => void
  saveDialog: () => Promise<void>

  onNodesChange: (changes: NodeChange<AppNode>[]) => void
  onEdgesChange: (changes: EdgeChange<Edge>[]) => void
  onConnect: (connection: Connection) => void
}

export const DialogContext = createContext<DialogContextType | undefined>(undefined)

export const DialogProvider = ({ children }: PropsWithChildren) => {
  const { project } = useGlobalState()
  
  // Core state
  const [dialog, setDialogState] = useState<Dialog | undefined>(undefined)
  const [nodes, setNodes] = useState<AppNode[]>([])
  const [edges, setEdges] = useState<Edge[]>([])
  const [rootNodeId, setRootNodeIdState] = useState<string | null>(null)
  const [lastCreatedNodeId, setLastCreatedNodeId] = useState<string | undefined>(undefined)

  // Derived state via hooks
  const { forwardMap, reverseMap } = useGraphMaps(edges)
  const dialogFeed = useDialogFeed(rootNodeId, nodes, forwardMap)

  // Persistence
  const persistence = useDialogPersistence(project?.id, {
    onStructuralChange: true,
    onContentChange: true,
    onPositionChange: false,
    debounceMs: 1500,
  })

  const loadDialog = useCallback((dialog: Dialog) => {
    setDialogState(dialog);
    setRootNodeIdState(dialog.root_node);
    persistence.setDialog(dialog);

    const res = traverseDialogAndGetNodesAndEdges(dialog);
    setNodes(res.nodes);
    setEdges(res.edges);
  }, [persistence])

  const setRootNode = useCallback((nodeId: string) => {
    setRootNodeIdState(nodeId)
    persistence.setRootNode(nodeId)
    persistence.onStructuralChange(nodes, edges)
  }, [nodes, edges, persistence])

  // ReactFlow handlers - distinguish between structural and positional changes
  const onNodesChange = useCallback((changes: NodeChange<AppNode>[]) => {
    setNodes(prev => {
      const next = applyNodeChanges(changes, prev)
      
      // Check if this is a structural change (add/remove) or just position
      const isStructural = changes.some(c => c.type === 'add' || c.type === 'remove')
      const isPosition = changes.some(c => c.type === 'position' && !c.dragging)
      
      if (isStructural) {
        persistence.onStructuralChange(next, edges)
      } else if (isPosition) {
        persistence.onPositionChange(next, edges)
      }
      
      return next
    })
  }, [edges, persistence])

  const onEdgesChange = useCallback((changes: EdgeChange<Edge>[]) => {
    setEdges(prev => {
      const next = applyEdgeChanges(changes, prev)
      const isStructural = changes.some(c => c.type === 'add' || c.type === 'remove')
      if (isStructural) {
        persistence.onStructuralChange(nodes, next)
      }
      return next
    })
  }, [nodes, persistence])

  const onConnect = useCallback((connection: Connection) => {
    setEdges(prev => {
      const sourceNode = nodes.find(n => n.id === connection.source)
      let next: Edge[]

      if (sourceNode?.type === 'dialogNode') {
        const filtered = prev.filter(e => e.source !== connection.source)
        next = addEdge(connection, filtered)
      } else if (sourceNode?.type === 'choiceNode' || sourceNode?.type === 'phylumNode') {
        if (connection.sourceHandle) {
          const filtered = prev.filter(
            e => !(e.source === connection.source && e.sourceHandle === connection.sourceHandle)
          )
          next = addEdge(connection, filtered)
        } else {
          next = addEdge(connection, prev)
        }
      } else {
        next = addEdge(connection, prev)
      }

      persistence.onStructuralChange(nodes, next)
      return next
    })
  }, [nodes, persistence])

  const createDialogNode = useCallback((pos: Pos) => {
    const isRootNode = nodes.length === 0
    const id = crypto.randomUUID()

    const newNode: DialogFlowNode = {
      id,
      type: 'dialogNode',
      position: pos,
      data: {
        next_node: null,
        content: '',
        character_id: null,
        content_link: null,
        isRootNode,
      },
    }

    setNodes(prev => {
      const next = [...prev, newNode]
      
      // Auto-connect to last created node
      if (lastCreatedNodeId) {
        const prevNode = prev.find(n => n.id === lastCreatedNodeId)
        if (prevNode) {
          const handles = getOptimalHandles(prevNode.position, pos)
          setEdges(prevEdges => {
            const filtered = prevEdges.filter(e => e.source !== lastCreatedNodeId)
            const nextEdges = [...filtered, {
              id: `${lastCreatedNodeId}-${id}`,
              source: lastCreatedNodeId,
              target: id,
              ...handles
            }]
            persistence.onStructuralChange(next, nextEdges)
            return nextEdges
          })
        }
      } else {
        persistence.onStructuralChange(next, edges)
      }

      return next
    })

    if (isRootNode) {
      setRootNode(id)
    }
    setLastCreatedNodeId(id)
  }, [nodes.length, lastCreatedNodeId, edges, persistence, setRootNode])

  const updateNodeData = useCallback((
    nodeId: string,
    newData: Partial<DialogNodeData | ChoicesNodeData | PhylumNodeData>
  ) => {
    setNodes(prev => {
      const next = prev.map(node =>
        node.id === nodeId
          ? { ...node, data: { ...node.data, ...newData } } as AppNode
          : node
      )
      persistence.onContentChange(next, edges)
      return next
    })
  }, [edges, persistence])

  const saveDialog = useCallback(async () => {
    await persistence.save(nodes, edges)
  }, [persistence, nodes, edges])

  return (
    <DialogContext.Provider value={{
      nodes,
      edges,
      rootNodeId,
      dialog,
      dialogFeed,
      loadDialog,
      createDialogNode,
      setRootNode,
      updateNodeData,
      saveDialog,
      onNodesChange,
      onEdgesChange,
      onConnect,
    }}>
      {children}
    </DialogContext.Provider>
  )
}

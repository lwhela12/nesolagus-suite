"use client";

import { useCallback, useMemo, useState, useEffect } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Node,
  Edge,
  Panel,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Maximize2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import BlockNode from './BlockNode';
import { SurveyBlock, FlowLayout, BLOCK_TYPE_INFO } from './types';
import {
  configToNodesAndEdges,
  getLayoutedElements,
  nodesToFlowLayout,
} from './layout';

const nodeTypes = {
  blockNode: BlockNode,
};

interface FlowEditorProps {
  config: any;
  flowLayout: FlowLayout | null;
  onConfigChange: (config: any) => void;
  onFlowLayoutChange: (layout: FlowLayout) => void;
  className?: string;
}

export function FlowEditor({
  config,
  flowLayout,
  onConfigChange,
  onFlowLayoutChange,
  className,
}: FlowEditorProps) {
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);

  // Handle edit block
  const handleEditBlock = useCallback((blockId: string) => {
    setSelectedBlockId(blockId);
    // TODO: Open side panel for editing
    console.log('Edit block:', blockId);
  }, []);

  // Handle delete block
  const handleDeleteBlock = useCallback(
    (blockId: string) => {
      const newBlocks = { ...config.blocks };
      delete newBlocks[blockId];

      // Remove references to deleted block
      Object.values(newBlocks).forEach((block: any) => {
        if (block.next === blockId) {
          delete block.next;
        }
        // TODO: Handle conditional next cleanup
      });

      onConfigChange({
        ...config,
        blocks: newBlocks,
      });

      // Remove from flowLayout
      if (flowLayout) {
        const newLayout = { ...flowLayout };
        delete newLayout[blockId];
        onFlowLayoutChange(newLayout);
      }
    },
    [config, flowLayout, onConfigChange, onFlowLayoutChange]
  );

  // Convert config to nodes and edges
  const initialNodesAndEdges = useMemo(() => {
    if (!config?.blocks) {
      return { nodes: [], edges: [] };
    }

    const { nodes, edges } = configToNodesAndEdges(
      config.blocks,
      flowLayout,
      handleEditBlock,
      handleDeleteBlock
    );

    // If flowLayout is null or all nodes are at (0,0), auto-layout
    const needsAutoLayout = !flowLayout || nodes.every(n => n.position.x === 0 && n.position.y === 0);

    if (needsAutoLayout && nodes.length > 0) {
      return getLayoutedElements(nodes, edges, 'TB');
    }

    return { nodes, edges };
  }, [config, flowLayout, handleEditBlock, handleDeleteBlock]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodesAndEdges.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialNodesAndEdges.edges);

  // Flag to track if we need to save initial auto-layout
  const [needsInitialSave, setNeedsInitialSave] = useState(false);

  // Save initial auto-layout when flowLayout was null
  useEffect(() => {
    const shouldAutoSave = !flowLayout && nodes.length > 0;
    if (shouldAutoSave && !needsInitialSave) {
      setNeedsInitialSave(true);
    }
  }, [flowLayout, nodes, needsInitialSave]);

  useEffect(() => {
    if (needsInitialSave && nodes.length > 0) {
      const layout = nodesToFlowLayout(nodes);
      onFlowLayoutChange(layout);
      setNeedsInitialSave(false);
    }
  }, [needsInitialSave, nodes, onFlowLayoutChange]);

  // Update nodes when config changes
  useEffect(() => {
    if (!config?.blocks) return;

    const { nodes: newNodes, edges: newEdges } = configToNodesAndEdges(
      config.blocks,
      flowLayout,
      handleEditBlock,
      handleDeleteBlock
    );

    setNodes(newNodes);
    setEdges(newEdges);
  }, [config, flowLayout, handleEditBlock, handleDeleteBlock, setNodes, setEdges]);

  // Handle node drag end - save positions
  const handleNodeDragStop = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      const layout = nodesToFlowLayout(nodes);
      onFlowLayoutChange(layout);
    },
    [nodes, onFlowLayoutChange]
  );

  // Handle connection (not implemented yet - would require updating config)
  const onConnect = useCallback(
    (connection: Connection) => {
      // For now, just show the visual connection
      setEdges((eds) => addEdge(connection, eds));

      // TODO: Update config to reflect new connection
      console.log('Connection created:', connection);
    },
    [setEdges]
  );

  // Auto-layout button
  const handleAutoLayout = useCallback(() => {
    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
      nodes,
      edges,
      'TB'
    );

    setNodes(layoutedNodes);
    setEdges(layoutedEdges);

    // Save new layout
    const layout = nodesToFlowLayout(layoutedNodes);
    onFlowLayoutChange(layout);
  }, [nodes, edges, setNodes, setEdges, onFlowLayoutChange]);

  // Fit view
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);

  const handleFitView = useCallback(() => {
    if (reactFlowInstance) {
      reactFlowInstance.fitView({ padding: 0.2, duration: 400 });
    }
  }, [reactFlowInstance]);

  return (
    <div className={className || "w-full h-[700px] border rounded-lg bg-gray-50 relative"}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeDragStop={handleNodeDragStop}
        onConnect={onConnect}
        onInit={setReactFlowInstance}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.1}
        maxZoom={2}
        defaultEdgeOptions={{
          type: 'smoothstep',
          animated: false,
        }}
      >
        <Background color="#e2e8f0" gap={20} />
        <Controls />
        <MiniMap
          nodeColor={(node) => {
            const block = (node.data as any).block;
            const typeInfo = BLOCK_TYPE_INFO[block?.type] || BLOCK_TYPE_INFO.default;
            return typeInfo.color;
          }}
          nodeStrokeWidth={3}
          zoomable
          pannable
        />

        {/* Control Panel */}
        <Panel position="top-right" className="flex flex-col gap-2">
          <Button
            onClick={handleAutoLayout}
            variant="secondary"
            size="sm"
            className="bg-white shadow-lg"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Auto Layout
          </Button>
          <Button
            onClick={handleFitView}
            variant="secondary"
            size="sm"
            className="bg-white shadow-lg"
          >
            <Maximize2 className="w-4 h-4 mr-2" />
            Fit View
          </Button>
        </Panel>

        {/* Info Panel */}
        <Panel position="top-left" className="bg-white p-3 rounded-lg shadow-lg">
          <div className="text-sm">
            <div className="font-semibold mb-1">{config?.survey?.name || 'Untitled Survey'}</div>
            <div className="text-gray-600">
              {nodes.length} block{nodes.length !== 1 ? 's' : ''} • {edges.length} connection{edges.length !== 1 ? 's' : ''}
            </div>
          </div>
        </Panel>
      </ReactFlow>
    </div>
  );
}

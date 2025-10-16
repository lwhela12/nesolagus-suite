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
import { BlockEditPanel } from './BlockEditPanel';
import { BlockTypeSelector } from './BlockTypeSelector';
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
  }, []);

  // Handle save block
  const handleSaveBlock = useCallback(
    (blockId: string, updates: Partial<SurveyBlock>) => {
      const newBlocks = {
        ...config.blocks,
        [blockId]: {
          ...config.blocks[blockId],
          ...updates,
        },
      };

      onConfigChange({
        ...config,
        blocks: newBlocks,
      });
    },
    [config, onConfigChange]
  );

  // Handle close edit panel
  const handleCloseEditPanel = useCallback(() => {
    setSelectedBlockId(null);
  }, []);

  // Handle add new block
  const handleAddBlock = useCallback(
    (blockType: string) => {
      // Find the highest block number
      const blockIds = Object.keys(config.blocks || {});
      const maxBlockNum = blockIds
        .filter(id => id.match(/^b\d+$/))
        .map(id => parseInt(id.substring(1)))
        .reduce((max, num) => Math.max(max, num), -1);

      const newBlockId = `b${maxBlockNum + 1}`;

      // Create new block with defaults based on type
      const newBlock: SurveyBlock = {
        id: newBlockId,
        type: blockType,
        content: 'New question...',
        variable: `var_${newBlockId}`,
        next: undefined,
      };

      // Type-specific defaults
      if (blockType === 'single-choice' || blockType === 'multi-choice') {
        newBlock.options = [
          { id: 'option-1', label: 'Option 1', value: 'option-1' },
          { id: 'option-2', label: 'Option 2', value: 'option-2' },
        ];
      }

      if (blockType === 'multi-choice') {
        newBlock.maxSelections = 2;
      }

      if (blockType === 'scale') {
        newBlock.options = Array.from({ length: 10 }, (_, i) => ({
          id: `${i + 1}`,
          value: `${i + 1}`,
          label: i === 0 ? 'Low' : i === 9 ? 'High' : `${i + 1}`,
          emoji: i < 3 ? '😞' : i < 5 ? '😐' : i < 7 ? '🙂' : i < 9 ? '😊' : '🤩',
        }));
      }

      if (blockType === 'dynamic-message') {
        newBlock.autoAdvance = true;
        newBlock.autoAdvanceDelay = 2000;
      }

      // Add to config
      const newBlocks = {
        ...config.blocks,
        [newBlockId]: newBlock,
      };

      onConfigChange({
        ...config,
        blocks: newBlocks,
      });

      // Open the editor for the new block
      setSelectedBlockId(newBlockId);
    },
    [config, onConfigChange]
  );

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

  // Handle connection - update config when edges are dragged
  const onConnect = useCallback(
    (connection: Connection) => {
      if (!connection.source || !connection.target) return;

      const sourceBlockId = connection.source;
      const targetBlockId = connection.target;

      // Update the source block's next field to point to target
      const sourceBlock = config.blocks[sourceBlockId];
      if (!sourceBlock) return;

      // Update config
      const newBlocks = {
        ...config.blocks,
        [sourceBlockId]: {
          ...sourceBlock,
          next: targetBlockId,
        },
      };

      onConfigChange({
        ...config,
        blocks: newBlocks,
      });

      console.log(`Connected ${sourceBlockId} → ${targetBlockId}`);
    },
    [config, onConfigChange]
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

  const selectedBlock = selectedBlockId ? config.blocks?.[selectedBlockId] : null;

  return (
    <>
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

      <BlockEditPanel
        block={selectedBlock}
        open={selectedBlockId !== null}
        onClose={handleCloseEditPanel}
        onSave={handleSaveBlock}
        allBlocks={config.blocks || {}}
      />

      <BlockTypeSelector onAddBlock={handleAddBlock} />
    </>
  );
}

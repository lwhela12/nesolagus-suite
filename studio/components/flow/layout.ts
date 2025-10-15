import dagre from 'dagre';
import { Node, Edge } from '@xyflow/react';
import { SurveyBlock, FlowLayout } from './types';

const NODE_WIDTH = 280;
const NODE_HEIGHT = 120;

/**
 * Convert survey config blocks to React Flow nodes and edges
 */
export function configToNodesAndEdges(
  blocks: Record<string, SurveyBlock>,
  flowLayout: FlowLayout | null,
  onEdit: (blockId: string) => void,
  onDelete: (blockId: string) => void
): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  // Create nodes
  Object.values(blocks).forEach((block) => {
    const position = flowLayout?.[block.id] || { x: 0, y: 0 };

    nodes.push({
      id: block.id,
      type: 'blockNode',
      position,
      data: {
        block,
        onEdit,
        onDelete,
      },
    });
  });

  // Create edges from next/conditionalNext
  Object.values(blocks).forEach((block) => {
    // Simple next
    if (typeof block.next === 'string') {
      edges.push({
        id: `${block.id}-${block.next}`,
        source: block.id,
        target: block.next,
        type: 'smoothstep',
        animated: false,
      });
    }

    // Conditional next (complex)
    else if (block.next && typeof block.next === 'object') {
      extractConditionalEdges(block.id, block.next, edges);
    }

    // ConditionalNext field
    if (block.conditionalNext) {
      extractConditionalEdges(block.id, block.conditionalNext, edges);
    }

    // Option-based routing
    if (block.options) {
      block.options.forEach((option: any) => {
        if (option.next) {
          edges.push({
            id: `${block.id}-${option.value}-${option.next}`,
            source: block.id,
            target: option.next,
            type: 'smoothstep',
            animated: false,
            label: option.label || option.value,
            style: { stroke: '#6366f1', strokeWidth: 2 },
            labelStyle: { fill: '#6366f1', fontWeight: 600, fontSize: 12 },
            labelBgStyle: { fill: '#fff', fillOpacity: 0.9 },
          });
        }
      });
    }
  });

  return { nodes, edges };
}

/**
 * Extract edges from conditional routing structure
 */
function extractConditionalEdges(sourceId: string, conditional: any, edges: Edge[]): void {
  // Handle array format: { if: [{ when: {...}, goto: "..." }], else: "..." }
  if (conditional.if && Array.isArray(conditional.if)) {
    conditional.if.forEach((condition: any, index: number) => {
      if (condition.goto && condition.when) {
        const label = formatConditionLabel(condition.when);
        edges.push({
          id: `${sourceId}-if${index}-${condition.goto}`,
          source: sourceId,
          target: condition.goto,
          type: 'smoothstep',
          animated: false,
          label,
          style: { stroke: '#10b981', strokeWidth: 2 },
          labelStyle: { fill: '#10b981', fontWeight: 600, fontSize: 12 },
          labelBgStyle: { fill: '#fff', fillOpacity: 0.9 },
        });
      }
    });
  }

  // Handle object format: { if: {...condition...}, then: "...", else: "..." }
  else if (conditional.if && typeof conditional.if === 'object' && conditional.then) {
    const label = formatConditionLabel(conditional.if);
    edges.push({
      id: `${sourceId}-then-${conditional.then}`,
      source: sourceId,
      target: conditional.then,
      type: 'smoothstep',
      animated: false,
      label,
      style: { stroke: '#10b981', strokeWidth: 2 },
      labelStyle: { fill: '#10b981', fontWeight: 600, fontSize: 12 },
      labelBgStyle: { fill: '#fff', fillOpacity: 0.9 },
    });
  }

  // Handle simple then/else without if object
  else if (typeof conditional.then === 'string') {
    edges.push({
      id: `${sourceId}-then-${conditional.then}`,
      source: sourceId,
      target: conditional.then,
      type: 'smoothstep',
      animated: false,
      label: 'if',
      style: { stroke: '#10b981', strokeWidth: 2 },
      labelStyle: { fill: '#10b981', fontWeight: 600, fontSize: 12 },
      labelBgStyle: { fill: '#fff', fillOpacity: 0.9 },
    });
  }

  // Handle else branch
  if (typeof conditional.else === 'string') {
    edges.push({
      id: `${sourceId}-else-${conditional.else}`,
      source: sourceId,
      target: conditional.else,
      type: 'smoothstep',
      animated: false,
      label: 'else',
      style: { stroke: '#ef4444', strokeWidth: 2 },
      labelStyle: { fill: '#ef4444', fontWeight: 600, fontSize: 12 },
      labelBgStyle: { fill: '#fff', fillOpacity: 0.9 },
    });
  } else if (conditional.else && typeof conditional.else === 'object') {
    // Recursive for nested conditionals
    extractConditionalEdges(sourceId, conditional.else, edges);
  }
}

/**
 * Format a condition object into a readable label
 */
function formatConditionLabel(when: any): string {
  if (!when) return 'if';

  // Handle simple equality
  if (when.variable && when.equals !== undefined) {
    return `${when.variable} = ${when.equals}`;
  }

  // Handle contains
  if (when.variable && when.contains !== undefined) {
    return `${when.variable} contains ${when.contains}`;
  }

  // Handle comparisons
  if (when.variable && when.greaterThan !== undefined) {
    return `${when.variable} > ${when.greaterThan}`;
  }

  if (when.variable && when.lessThan !== undefined) {
    return `${when.variable} < ${when.lessThan}`;
  }

  // Handle NOT
  if (when.not) {
    return `NOT ${formatConditionLabel(when.not)}`;
  }

  // Handle OR
  if (when.or && Array.isArray(when.or)) {
    return when.or.map(formatConditionLabel).join(' OR ');
  }

  // Handle AND
  if (when.and && Array.isArray(when.and)) {
    return when.and.map(formatConditionLabel).join(' AND ');
  }

  return 'if';
}

/**
 * Auto-layout using Dagre
 */
export function getLayoutedElements(
  nodes: Node[],
  edges: Edge[],
  direction: 'TB' | 'LR' = 'TB'
): { nodes: Node[]; edges: Edge[] } {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  // Configure graph
  dagreGraph.setGraph({
    rankdir: direction,
    nodesep: 100,
    ranksep: 150,
  });

  // Add nodes to dagre
  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
  });

  // Add edges to dagre
  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  // Calculate layout
  dagre.layout(dagreGraph);

  // Apply layout to nodes
  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - NODE_WIDTH / 2,
        y: nodeWithPosition.y - NODE_HEIGHT / 2,
      },
    };
  });

  return { nodes: layoutedNodes, edges };
}

/**
 * Convert nodes to FlowLayout format for storage
 */
export function nodesToFlowLayout(nodes: Node[]): FlowLayout {
  const layout: FlowLayout = {};
  nodes.forEach((node) => {
    layout[node.id] = {
      x: node.position.x,
      y: node.position.y,
    };
  });
  return layout;
}

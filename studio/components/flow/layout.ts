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
    // Skip blocks without an id
    if (!block || !block.id) {
      console.warn('[FlowEditor] Skipping block without id:', block);
      return;
    }

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
    // Skip blocks without an id
    if (!block || !block.id) {
      return;
    }

    // Check if block has option-based routing
    const hasOptionRouting = block.options && block.options.some((opt: any) => opt.next);

    // Check if block has conditional routing
    const hasConditionalRouting =
      (block.next && typeof block.next === 'object') ||
      block.conditionalNext;

    // Debug logging for router blocks
    if (block.id.includes('router')) {
      console.log(`[FlowEditor] Processing router block ${block.id}:`, {
        hasConditionalNext: !!block.conditionalNext,
        conditionalNext: block.conditionalNext,
        hasNext: !!block.next,
        nextType: typeof block.next,
      });
    }

    // Simple next (only if no other routing)
    if (typeof block.next === 'string' && !hasOptionRouting && !hasConditionalRouting) {
      edges.push({
        id: `${block.id}-${block.next}`,
        source: block.id,
        target: block.next,
        type: 'smoothstep',
        animated: false,
        style: { stroke: '#94a3b8', strokeWidth: 1.5 },
      });
    }

    // Conditional next (complex)
    else if (block.next && typeof block.next === 'object') {
      console.log(`[FlowEditor] Extracting edges from block.next for ${block.id}`);
      extractConditionalEdges(block.id, block.next, edges);
    }

    // ConditionalNext field
    if (block.conditionalNext) {
      console.log(`[FlowEditor] Extracting edges from conditionalNext for ${block.id}`);
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
 * @param depth - Used to color-code nested conditions (0=green, 1=orange, 2+=purple)
 */
function extractConditionalEdges(
  sourceId: string,
  conditional: any,
  edges: Edge[],
  depth: number = 0
): void {
  console.log(`[extractConditionalEdges] Called for ${sourceId} at depth ${depth}:`, {
    hasIf: !!conditional.if,
    ifType: conditional.if ? (Array.isArray(conditional.if) ? 'array' : typeof conditional.if) : 'none',
    hasThen: !!conditional.then,
    hasElse: !!conditional.else,
    elseType: conditional.else ? typeof conditional.else : 'none',
  });

  // Color by depth: first condition=green, nested=orange, deeper=purple
  const colors = ['#10b981', '#f97316', '#a855f7']; // green, orange, purple
  const color = colors[Math.min(depth, colors.length - 1)];

  // Handle array format: { if: [{ when: {...}, goto: "..." }], else: "..." }
  if (conditional.if && Array.isArray(conditional.if)) {
    console.log(`[extractConditionalEdges] ✓ MATCHED: Array format`);

    conditional.if.forEach((condition: any, index: number) => {
      if (condition.goto && condition.when) {
        const label = formatConditionLabel(condition.when);
        const edgeColor = colors[Math.min(index, colors.length - 1)];
        console.log(`[extractConditionalEdges] Creating edge: ${sourceId} → ${condition.goto} (${label})`);
        edges.push({
          id: `${sourceId}-if${index}-${condition.goto}`,
          source: sourceId,
          target: condition.goto,
          type: 'smoothstep',
          animated: false,
          label,
          style: { stroke: edgeColor, strokeWidth: 2 },
          labelStyle: { fill: edgeColor, fontWeight: 600, fontSize: 12 },
          labelBgStyle: { fill: '#fff', fillOpacity: 0.9 },
        });
      }
    });
  }

  // Handle object format: { if: {...condition...}, then: "...", else: "..." }
  else if (conditional.if && !Array.isArray(conditional.if) && typeof conditional.if === 'object' && conditional.then) {
    console.log(`[extractConditionalEdges] ✓ MATCHED: Object format with if/then/else`);
    const label = formatConditionLabel(conditional.if);
    console.log(`[extractConditionalEdges] Creating edge: ${sourceId} → ${conditional.then} (${label})`);
    edges.push({
      id: `${sourceId}-then-${conditional.then}`,
      source: sourceId,
      target: conditional.then,
      type: 'smoothstep',
      animated: false,
      label,
      style: { stroke: color, strokeWidth: 2 },
      labelStyle: { fill: color, fontWeight: 600, fontSize: 12 },
      labelBgStyle: { fill: '#fff', fillOpacity: 0.9 },
    });
  }

  // Handle simple then/else without if object
  else if (typeof conditional.then === 'string') {
    console.log(`[extractConditionalEdges] ✓ MATCHED: Simple then without if`);
    console.log(`[extractConditionalEdges] Creating edge: ${sourceId} → ${conditional.then} (if)`);
    edges.push({
      id: `${sourceId}-then-${conditional.then}`,
      source: sourceId,
      target: conditional.then,
      type: 'smoothstep',
      animated: false,
      label: 'if',
      style: { stroke: color, strokeWidth: 2 },
      labelStyle: { fill: color, fontWeight: 600, fontSize: 12 },
      labelBgStyle: { fill: '#fff', fillOpacity: 0.9 },
    });
  }
  else {
    console.log(`[extractConditionalEdges] ✗ NO MATCH: No if branch matched!`, {
      hasIf: !!conditional.if,
      ifIsArray: Array.isArray(conditional.if),
      ifType: typeof conditional.if,
      hasThen: !!conditional.then,
      thenType: typeof conditional.then,
    });
  }

  // Handle else branch
  if (typeof conditional.else === 'string') {
    console.log(`[extractConditionalEdges] Creating else edge: ${sourceId} → ${conditional.else}`);
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
    console.log(`[extractConditionalEdges] Else is object - checking for nested conditional`);
    // Nested conditional in else - process as next level
    if (conditional.else.if && conditional.else.then) {
      console.log(`[extractConditionalEdges] Found nested conditional in else (else-if pattern)`);
      // This is a nested conditional, not just an else
      const nestedLabel = formatConditionLabel(conditional.else.if);
      const nestedColor = colors[Math.min(depth + 1, colors.length - 1)];

      edges.push({
        id: `${sourceId}-elseif-${conditional.else.then}`,
        source: sourceId,
        target: conditional.else.then,
        type: 'smoothstep',
        animated: false,
        label: `else if ${nestedLabel}`,
        style: { stroke: nestedColor, strokeWidth: 2 },
        labelStyle: { fill: nestedColor, fontWeight: 600, fontSize: 12 },
        labelBgStyle: { fill: '#fff', fillOpacity: 0.9 },
      });

      // Continue recursively for deeper else branches
      if (conditional.else.else) {
        console.log(`[extractConditionalEdges] Recursing for deeper else branch`);
        extractConditionalEdges(sourceId, conditional.else.else, edges, depth + 1);
      }
    } else {
      console.log(`[extractConditionalEdges] Recursing into else object`);
      // Just a plain else with more nested structure
      extractConditionalEdges(sourceId, conditional.else, edges, depth + 1);
    }
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

  // Handle not equals
  if (when.variable && when.notEquals !== undefined) {
    return `${when.variable} ≠ ${when.notEquals}`;
  }

  // Handle contains
  if (when.variable && when.contains !== undefined) {
    return `${when.variable} contains ${when.contains}`;
  }

  // Handle comparisons
  if (when.variable && when.greaterThan !== undefined) {
    return `${when.variable} > ${when.greaterThan}`;
  }

  if (when.variable && when.greaterThanOrEqual !== undefined) {
    return `${when.variable} ≥ ${when.greaterThanOrEqual}`;
  }

  if (when.variable && when.lessThan !== undefined) {
    return `${when.variable} < ${when.lessThan}`;
  }

  if (when.variable && when.lessThanOrEqual !== undefined) {
    return `${when.variable} ≤ ${when.lessThanOrEqual}`;
  }

  // Handle between
  if (when.variable && when.between && Array.isArray(when.between) && when.between.length === 2) {
    return `${when.between[0]} ≤ ${when.variable} ≤ ${when.between[1]}`;
  }

  // Handle NOT
  if (when.not) {
    return `NOT (${formatConditionLabel(when.not)})`;
  }

  // Handle OR (keep it concise for labels)
  if (when.or && Array.isArray(when.or)) {
    if (when.or.length > 2) {
      return `${when.or.length} conditions (OR)`;
    }
    return when.or.map(formatConditionLabel).join(' OR ');
  }

  // Handle AND (keep it concise for labels)
  if (when.and && Array.isArray(when.and)) {
    if (when.and.length > 2) {
      return `${when.and.length} conditions (AND)`;
    }
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

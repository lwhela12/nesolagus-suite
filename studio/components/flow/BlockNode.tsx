"use client";

import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Edit2, Trash2 } from 'lucide-react';
import { BlockNodeData, BLOCK_TYPE_INFO } from './types';

/**
 * Custom node component for rendering survey blocks
 */
function BlockNode({ data }: { data: BlockNodeData }) {
  const { block, onEdit, onDelete } = data;
  const typeInfo = BLOCK_TYPE_INFO[block.type] || BLOCK_TYPE_INFO.default;

  // Get content preview (truncate if too long)
  const contentPreview = (block.content || block.text || 'Untitled Block').substring(0, 80);
  const isLong = (block.content || block.text || '').length > 80;

  return (
    <div className="relative bg-white border-2 rounded-lg shadow-lg hover:shadow-xl transition-shadow w-[280px]"
      style={{ borderColor: typeInfo.color }}>
      {/* Top handle */}
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 !bg-gray-400 border-2 border-white"
      />

      {/* Header */}
      <div className="px-3 py-2 border-b flex items-center justify-between"
        style={{ backgroundColor: typeInfo.color + '10' }}>
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="text-lg" style={{ flexShrink: 0 }}>{typeInfo.icon}</span>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold text-gray-600 truncate">{typeInfo.label}</div>
            <div className="text-xs text-gray-500 truncate">{block.id}</div>
          </div>
        </div>
        <div className="flex items-center gap-1 ml-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(block.id);
            }}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
            title="Edit block"
          >
            <Edit2 className="w-3 h-3 text-gray-600" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (confirm(`Delete block ${block.id}?`)) {
                onDelete(block.id);
              }
            }}
            className="p-1 hover:bg-red-100 rounded transition-colors"
            title="Delete block"
          >
            <Trash2 className="w-3 h-3 text-red-600" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="px-3 py-3">
        <p className="text-sm text-gray-700 leading-snug">
          {contentPreview}
          {isLong && '...'}
        </p>

        {/* Variable badge */}
        {block.variable && (
          <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs font-mono">
            <span className="opacity-60">var:</span>
            {block.variable}
          </div>
        )}

        {/* Options count */}
        {block.options && block.options.length > 0 && (
          <div className="mt-2 text-xs text-gray-500">
            {block.options.length} option{block.options.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>

      {/* Bottom handle */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 !bg-gray-400 border-2 border-white"
      />

      {/* Conditional indicator */}
      {(typeof block.next === 'object' || block.conditionalNext) && (
        <div
          className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold bg-yellow-400 text-yellow-900 border-2 border-white shadow"
          title="Has conditional routing"
        >
          ?
        </div>
      )}
    </div>
  );
}

export default memo(BlockNode);

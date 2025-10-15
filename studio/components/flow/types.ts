import { Node, Edge } from '@xyflow/react';

/**
 * Survey block as stored in config.blocks
 */
export interface SurveyBlock {
  id: string;
  type: string;
  content?: string;
  text?: string;
  variable?: string;
  options?: Array<{
    id: string;
    label: string;
    value: string;
    next?: string;
  }>;
  next?: string | ConditionalNext;
  conditionalNext?: ConditionalNext;
  // ... other block properties
  [key: string]: any;
}

/**
 * Conditional routing structure
 */
export interface ConditionalNext {
  if: Condition;
  then: string;
  else: string | ConditionalNext;
}

export interface Condition {
  variable?: string;
  equals?: any;
  contains?: any;
  greaterThan?: number;
  lessThan?: number;
  not?: Condition;
  or?: Condition[];
  and?: Condition[];
}

/**
 * Flow layout storage format
 * Maps block ID to position
 */
export interface FlowLayout {
  [blockId: string]: {
    x: number;
    y: number;
  };
}

/**
 * Custom data for BlockNode
 */
export interface BlockNodeData {
  block: SurveyBlock;
  onEdit: (blockId: string) => void;
  onDelete: (blockId: string) => void;
}

/**
 * Block type metadata
 */
export interface BlockTypeInfo {
  label: string;
  color: string;
  icon: string;
}

export const BLOCK_TYPE_INFO: Record<string, BlockTypeInfo> = {
  'text-input': {
    label: 'Text Input',
    color: '#3B82F6', // blue
    icon: '✏️',
  },
  'single-choice': {
    label: 'Single Choice',
    color: '#8B5CF6', // purple
    icon: '◉',
  },
  'multi-choice': {
    label: 'Multi Choice',
    color: '#A855F7', // violet
    icon: '☑',
  },
  'scale': {
    label: 'Scale',
    color: '#EC4899', // pink
    icon: '📊',
  },
  'yes-no': {
    label: 'Yes/No',
    color: '#10B981', // green
    icon: '✓',
  },
  'dynamic-message': {
    label: 'Message',
    color: '#6B7280', // gray
    icon: '💬',
  },
  'final-message': {
    label: 'Final Message',
    color: '#F59E0B', // amber
    icon: '🎉',
  },
  'video-autoplay': {
    label: 'Video',
    color: '#EF4444', // red
    icon: '📹',
  },
  'videoask': {
    label: 'VideoAsk',
    color: '#DC2626', // red
    icon: '🎥',
  },
  'contact-form': {
    label: 'Contact Form',
    color: '#0EA5E9', // sky
    icon: '📧',
  },
  'demographics': {
    label: 'Demographics',
    color: '#14B8A6', // teal
    icon: '👤',
  },
  'semantic-differential': {
    label: 'Semantic Differential',
    color: '#8B5CF6', // purple
    icon: '⚖️',
  },
  default: {
    label: 'Block',
    color: '#9CA3AF', // gray
    icon: '📦',
  },
};

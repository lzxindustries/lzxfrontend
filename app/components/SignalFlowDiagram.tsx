/**
 * SVG signal-flow diagram for product setup tabs.
 * Shows how a product connects in a typical video synthesis signal chain.
 */
import {useState} from 'react';

interface ConnectionNode {
  id: string;
  label: string;
  x: number;
  y: number;
  type: 'source' | 'processor' | 'output' | 'modular';
  description?: string;
}

interface ConnectionEdge {
  from: string;
  to: string;
  label?: string;
  type?: 'hdmi' | 'composite' | 'component' | 'eurorack' | 'usb';
}

export interface SignalFlowConfig {
  nodes: ConnectionNode[];
  edges: ConnectionEdge[];
  width?: number;
  height?: number;
}

const NODE_W = 140;
const NODE_H = 50;
const NODE_RX = 8;

const typeColors: Record<ConnectionNode['type'], string> = {
  source: '#3b82f6',
  processor: '#8b5cf6',
  output: '#10b981',
  modular: '#f59e0b',
};

const edgeColors: Record<string, string> = {
  hdmi: '#3b82f6',
  composite: '#ef4444',
  component: '#10b981',
  eurorack: '#f59e0b',
  usb: '#6b7280',
};

function getAnchor(
  node: ConnectionNode,
  side: 'left' | 'right',
): {x: number; y: number} {
  return {
    x: side === 'left' ? node.x - NODE_W / 2 : node.x + NODE_W / 2,
    y: node.y,
  };
}

export function SignalFlowDiagram({config}: {config: SignalFlowConfig}) {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const vw = config.width ?? 640;
  const vh = config.height ?? 200;

  const nodesById = Object.fromEntries(config.nodes.map((n) => [n.id, n]));

  return (
    <div className="rounded-xl border border-base-300 bg-base-200 p-4 overflow-x-auto">
      <svg
        viewBox={`0 0 ${vw} ${vh}`}
        className="w-full max-w-2xl mx-auto"
        role="img"
        aria-label="Signal flow diagram"
      >
        {/* Edges */}
        {config.edges.map((edge, i) => {
          const fromNode = nodesById[edge.from];
          const toNode = nodesById[edge.to];
          if (!fromNode || !toNode) return null;


          const start = getAnchor(fromNode, 'right');
          const end = getAnchor(toNode, 'left');
          const midX = (start.x + end.x) / 2;
          const color = edgeColors[edge.type ?? 'hdmi'] ?? '#888';

          return (
            <g key={i}>
              <path
                d={`M${start.x},${start.y} C${midX},${start.y} ${midX},${end.y} ${end.x},${end.y}`}
                fill="none"
                stroke={color}
                strokeWidth={2}
                opacity={0.6}
                markerEnd="url(#arrowhead)"
              />
              {edge.label && (
                <text
                  x={midX}
                  y={Math.min(start.y, end.y) - 8}
                  textAnchor="middle"
                  fontSize={10}
                  fill="currentColor"
                  opacity={0.6}
                >
                  {edge.label}
                </text>
              )}
            </g>
          );
        })}

        {/* Arrowhead marker */}
        <defs>
          <marker
            id="arrowhead"
            markerWidth={8}
            markerHeight={6}
            refX={8}
            refY={3}
            orient="auto"
          >
            <path d="M0,0 L8,3 L0,6 Z" fill="#888" />
          </marker>
        </defs>

        {/* Nodes */}
        {config.nodes.map((node) => {
          const isHovered = hoveredNode === node.id;
          const color = typeColors[node.type];
          return (
            <g
              key={node.id}
              onMouseEnter={() => setHoveredNode(node.id)}
              onMouseLeave={() => setHoveredNode(null)}
              className="cursor-pointer"
            >
              <rect
                x={node.x - NODE_W / 2}
                y={node.y - NODE_H / 2}
                width={NODE_W}
                height={NODE_H}
                rx={NODE_RX}
                fill={isHovered ? color : 'var(--fallback-b1,oklch(var(--b1)))'}
                stroke={color}
                strokeWidth={isHovered ? 2.5 : 1.5}
                className="transition-all duration-200"
              />
              <text
                x={node.x}
                y={node.y + 1}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={12}
                fontWeight={600}
                fill={isHovered ? '#fff' : 'currentColor'}
              >
                {node.label}
              </text>
              {isHovered && node.description && (
                <text
                  x={node.x}
                  y={node.y + NODE_H / 2 + 14}
                  textAnchor="middle"
                  fontSize={10}
                  fill="currentColor"
                  opacity={0.7}
                >
                  {node.description}
                </text>
              )}
            </g>
          );
        })}
      </svg>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mt-3 justify-center text-xs text-base-content/60">
        {config.edges.some((e) => e.type === 'hdmi') && (
          <span className="flex items-center gap-1">
            <span
              className="inline-block w-4 h-0.5"
              style={{background: edgeColors.hdmi}}
            />
            HDMI
          </span>
        )}
        {config.edges.some((e) => e.type === 'composite') && (
          <span className="flex items-center gap-1">
            <span
              className="inline-block w-4 h-0.5"
              style={{background: edgeColors.composite}}
            />
            Composite
          </span>
        )}
        {config.edges.some((e) => e.type === 'eurorack') && (
          <span className="flex items-center gap-1">
            <span
              className="inline-block w-4 h-0.5"
              style={{background: edgeColors.eurorack}}
            />
            Eurorack
          </span>
        )}
        {config.edges.some((e) => e.type === 'usb') && (
          <span className="flex items-center gap-1">
            <span
              className="inline-block w-4 h-0.5"
              style={{background: edgeColors.usb}}
            />
            USB
          </span>
        )}
      </div>
    </div>
  );
}

// --- Preset Configurations ---

export const VIDEOMANCER_SIGNAL_FLOW: SignalFlowConfig = {
  width: 640,
  height: 200,
  nodes: [
    {
      id: 'source',
      label: 'HDMI Source',
      x: 90,
      y: 60,
      type: 'source',
      description: 'Camera, computer, game console',
    },
    {
      id: 'videomancer',
      label: 'Videomancer',
      x: 320,
      y: 60,
      type: 'processor',
      description: 'Video processor & synthesizer',
    },
    {
      id: 'display',
      label: 'Display',
      x: 550,
      y: 60,
      type: 'output',
      description: 'Monitor, TV, or capture device',
    },
    {
      id: 'eurorack',
      label: 'Eurorack',
      x: 320,
      y: 160,
      type: 'modular',
      description: 'Optional LZX modular system',
    },
  ],
  edges: [
    {from: 'source', to: 'videomancer', label: 'HDMI IN', type: 'hdmi'},
    {from: 'videomancer', to: 'display', label: 'HDMI OUT', type: 'hdmi'},
    {from: 'eurorack', to: 'videomancer', label: 'CV / Audio', type: 'eurorack'},
  ],
};

export const CHROMAGNON_SIGNAL_FLOW: SignalFlowConfig = {
  width: 640,
  height: 200,
  nodes: [
    {
      id: 'source',
      label: 'Video Source',
      x: 90,
      y: 60,
      type: 'source',
      description: 'Camera, player, or synthesizer',
    },
    {
      id: 'chromagnon',
      label: 'Chromagnon',
      x: 320,
      y: 60,
      type: 'processor',
      description: 'Analog video processor',
    },
    {
      id: 'display',
      label: 'Display',
      x: 550,
      y: 60,
      type: 'output',
      description: 'Monitor or capture device',
    },
    {
      id: 'eurorack',
      label: 'Eurorack',
      x: 320,
      y: 160,
      type: 'modular',
      description: 'LZX modular expansion',
    },
  ],
  edges: [
    {from: 'source', to: 'chromagnon', label: 'Component', type: 'component'},
    {from: 'chromagnon', to: 'display', label: 'Component', type: 'component'},
    {from: 'eurorack', to: 'chromagnon', label: '1V RGB', type: 'eurorack'},
  ],
};

/** Generic module signal flow (module within a eurorack system) */
export const MODULE_SIGNAL_FLOW: SignalFlowConfig = {
  width: 640,
  height: 140,
  nodes: [
    {
      id: 'input',
      label: 'Input Signal',
      x: 90,
      y: 70,
      type: 'source',
      description: 'Video or CV source',
    },
    {
      id: 'module',
      label: 'Module',
      x: 320,
      y: 70,
      type: 'processor',
      description: 'Signal processing',
    },
    {
      id: 'output',
      label: 'Output',
      x: 550,
      y: 70,
      type: 'output',
      description: 'To other modules or encoder',
    },
  ],
  edges: [
    {from: 'input', to: 'module', label: 'Patch cable', type: 'eurorack'},
    {from: 'module', to: 'output', label: 'Patch cable', type: 'eurorack'},
  ],
};

/** Get the appropriate signal flow config for a given product slug */
export function getSignalFlowForProduct(slug: string): SignalFlowConfig | null {
  switch (slug) {
    case 'videomancer':
      return VIDEOMANCER_SIGNAL_FLOW;
    case 'chromagnon':
      return CHROMAGNON_SIGNAL_FLOW;
    default:
      return null;
  }
}

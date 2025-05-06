import React from 'react';

// Configuration
const LAYERS = [3, 5, 4, 3, 1]; // Input (3), Hidden (5, 4, 3), Output (1)
const NODE_RADIUS = 15;
const LAYER_SPACING = 100;
const NODE_SPACING_V = 50;
const SVG_PADDING = 30;
const LABEL_OFFSET = 25; // Offset for input/output labels

// Calculate SVG dimensions based on layers and spacing
const maxNodesInLayer = Math.max(...LAYERS);
const svgHeight = maxNodesInLayer * NODE_SPACING_V + 2 * SVG_PADDING;
const svgWidth = (LAYERS.length - 1) * LAYER_SPACING + 2 * SVG_PADDING + 2 * LABEL_OFFSET;

// --- Node Component --- (Defined within DnnDiagram for simplicity)
interface NodeProps {
  cx: number;
  cy: number;
  radius: number;
}

const Node: React.FC<NodeProps> = ({ cx, cy, radius }) => {
  return (
    <circle
      cx={cx}
      cy={cy}
      r={radius}
      className="fill-primary stroke-black"
      strokeWidth="1"
    />
  );
};

// --- Layer Component --- (Defined within DnnDiagram for simplicity)
interface LayerProps {
  layerIndex: number;
  nodeCount: number;
  totalLayers: number;
  maxNodesInAnyLayer: number;
}

const Layer: React.FC<LayerProps> = ({ layerIndex, nodeCount, totalLayers, maxNodesInAnyLayer }) => {
  const layerX = SVG_PADDING + LABEL_OFFSET + layerIndex * LAYER_SPACING;

  // Calculate vertical center offset for this layer
  const layerHeight = nodeCount * NODE_SPACING_V;
  const maxLayerHeight = maxNodesInAnyLayer * NODE_SPACING_V;
  const startY = (svgHeight - layerHeight) / 2 + NODE_SPACING_V / 2 - NODE_RADIUS / 2;

  const nodes = Array.from({ length: nodeCount }).map((_, nodeIndex) => {
    const nodeY = startY + nodeIndex * NODE_SPACING_V;
    return <Node key={nodeIndex} cx={layerX} cy={nodeY} radius={NODE_RADIUS} />;
  });

  return <g>{nodes}</g>; // Group nodes in the layer
};

// --- DnnDiagram Component ---
const DnnDiagram: React.FC = () => {
  const inputLabels = ["once", "upon", "a"];
  const outputLabel = "time";

  // Helper function to calculate node positions
  const getNodePosition = (layerIndex: number, nodeIndex: number) => {
    const nodeCount = LAYERS[layerIndex];
    const layerX = SVG_PADDING + LABEL_OFFSET + layerIndex * LAYER_SPACING;
    const layerHeight = nodeCount * NODE_SPACING_V;
    const startY = (svgHeight - layerHeight) / 2 + NODE_SPACING_V / 2 - NODE_RADIUS / 2;
    const nodeY = startY + nodeIndex * NODE_SPACING_V;
    return { x: layerX, y: nodeY };
  };

  // Generate connections
  const connections: React.ReactNode[] = [];
  for (let i = 0; i < LAYERS.length - 1; i++) {
    const currentLayerNodeCount = LAYERS[i];
    const nextLayerNodeCount = LAYERS[i + 1];
    for (let j = 0; j < currentLayerNodeCount; j++) {
      for (let k = 0; k < nextLayerNodeCount; k++) {
        const startNodePos = getNodePosition(i, j);
        const endNodePos = getNodePosition(i + 1, k);
        connections.push(
          <line
            key={`conn-${i}-${j}-${k}`}
            x1={startNodePos.x}
            y1={startNodePos.y}
            x2={endNodePos.x}
            y2={endNodePos.y}
            stroke="rgba(0, 0, 0, 0.3)"
            strokeWidth="0.5"
          />
        );
      }
    }
  }

  // Generate Labels
  const labels: React.ReactNode[] = [];
  // Input labels
  if (LAYERS[0] === inputLabels.length) {
    inputLabels.forEach((label, index) => {
      const nodePos = getNodePosition(0, index);
      labels.push(
        <text
          key={`input-label-${index}`}
          x={nodePos.x - NODE_RADIUS - LABEL_OFFSET}
          y={nodePos.y}
          dy=".3em" // Vertical alignment adjustment
          textAnchor="end" // Align text to the right of the coordinate
          fill="black"
          fontSize="14"
        >
          "{label}"
        </text>
      );
    });
  }

  // Output label
  if (LAYERS[LAYERS.length - 1] === 1) {
    const nodePos = getNodePosition(LAYERS.length - 1, 0);
    labels.push(
      <text
        key="output-label"
        x={nodePos.x + NODE_RADIUS + LABEL_OFFSET}
        y={nodePos.y}
        dy=".3em"
        textAnchor="start" // Align text to the left of the coordinate
        fill="black"
        fontSize="14"
      >
        "{outputLabel}"
      </text>
    );
  }

  return (
    <svg width={svgWidth} height={svgHeight} style={{ overflow: 'visible' }}>
      {/* Render Connections */}
      <g>{connections}</g>

      {/* Render Layers */}
      {LAYERS.map((nodeCount, index) => (
        <Layer
          key={index}
          layerIndex={index}
          nodeCount={nodeCount}
          totalLayers={LAYERS.length}
          maxNodesInAnyLayer={maxNodesInLayer}
        />
      ))}

      {/* Render Labels */}
      <g>{labels}</g>
    </svg>
  );
};

export default DnnDiagram; 
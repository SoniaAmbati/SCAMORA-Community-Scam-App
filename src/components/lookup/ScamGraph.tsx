"use client";

import { useState } from "react";
import { GraphNode, GraphLink } from "@/types";

interface ScamGraphProps {
  nodes: GraphNode[];
  links: GraphLink[];
  onNodeClick?: (node: GraphNode) => void;
}

export function ScamGraph({ nodes, links, onNodeClick }: ScamGraphProps) {
  const [activeNode, setActiveNode] = useState<string | null>("center");

  // Center coordinates
  const cx = 250;
  const cy = 160;

  // Pre-calculated radial coordinates for connected satellites matching reference image
  // Node layout:
  // center: 98XXXXX210 (Phone)
  // Left: +91 87654 32109 (Phone)
  // Top Right: fake-update.in (Website)
  // Right: xyz@upi (UPI ID)
  // Bottom Right: ALERT123 (SMS sender)
  const NODE_POSITIONS: Record<string, { x: number; y: number; textPos: "top" | "bottom" | "left" | "right" }> = {
    center: { x: 250, y: 160, textPos: "bottom" },
    "phone-2": { x: 95, y: 160, textPos: "bottom" },
    "domain-1": { x: 345, y: 80, textPos: "top" },
    "upi-1": { x: 420, y: 165, textPos: "right" },
    "sms-1": { x: 375, y: 250, textPos: "right" },
    // Fallback coordinates for dynamic lookups
    "sub-1": { x: 120, y: 160, textPos: "left" },
    "p1": { x: 120, y: 160, textPos: "left" },
    "d1": { x: 380, y: 160, textPos: "right" },
    "sms-s": { x: 140, y: 90, textPos: "top" },
    "u-pay": { x: 380, y: 230, textPos: "right" }
  };

  const getNodePos = (node: GraphNode, index: number) => {
    if (node.isCenter) return { x: cx, y: cy, textPos: "bottom" as const };
    if (NODE_POSITIONS[node.id]) return NODE_POSITIONS[node.id];

    // Dynamic radial placement fallback
    const angle = (index * (2 * Math.PI)) / (nodes.length - 1);
    const radius = 130;
    return {
      x: cx + radius * Math.cos(angle),
      y: cy + radius * Math.sin(angle),
      textPos: "bottom" as const
    };
  };

  return (
    <div className="rounded-2xl bg-[#0E1520] border border-[#1E2B3C] p-5 space-y-4">
      {/* Title */}
      <div className="flex items-center justify-between">
        <h4 className="text-xs sm:text-sm font-semibold text-[#F0EEE8]">
          Related campaign (ScamGraph)
        </h4>
        <span className="text-[11px] text-[#9299A3]/80 font-mono">
          5 connected nodes
        </span>
      </div>

      {/* Graph SVG Canvas */}
      <div className="relative w-full aspect-[500/320] max-h-[340px] bg-[#090D14] rounded-xl border border-[#1E2B3C]/70 overflow-hidden">
        <svg
          viewBox="0 0 500 320"
          className="w-full h-full select-none"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Subtle graph background grid */}
          <line x1="0" y1="160" x2="500" y2="160" stroke="#172536" strokeWidth="0.5" strokeDasharray="3 3" opacity="0.4" />
          <line x1="250" y1="0" x2="250" y2="320" stroke="#172536" strokeWidth="0.5" strokeDasharray="3 3" opacity="0.4" />

          {/* Links between nodes */}
          {links.map((link, idx) => {
            const sourceNode = nodes.find(n => n.id === link.source) || nodes[0];
            const targetNode = nodes.find(n => n.id === link.target) || nodes[1];
            const sourcePos = getNodePos(sourceNode, nodes.indexOf(sourceNode));
            const targetPos = getNodePos(targetNode, nodes.indexOf(targetNode));

            return (
              <g key={idx}>
                {/* Connecting Line */}
                <line
                  x1={sourcePos.x}
                  y1={sourcePos.y}
                  x2={targetPos.x}
                  y2={targetPos.y}
                  stroke="#398BFF"
                  strokeWidth="1.5"
                  opacity="0.4"
                />
              </g>
            );
          })}

          {/* Render Nodes */}
          {nodes.map((node, index) => {
            const pos = getNodePos(node, index);
            const isCenter = node.isCenter;
            const isSelected = activeNode === node.id;

            return (
              <g
                key={node.id}
                className="cursor-pointer group"
                onClick={() => {
                  setActiveNode(node.id);
                  if (onNodeClick) onNodeClick(node);
                }}
                onMouseEnter={() => setActiveNode(node.id)}
              >
                {/* Center pulse glow */}
                {isCenter && (
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r="24"
                    fill="#FF604B"
                    opacity="0.18"
                    className="animate-threat-pulse"
                  />
                )}

                {/* Node Body Circle */}
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={isCenter ? "12" : "8"}
                  fill={isCenter ? "#FF604B" : "#398BFF"}
                  stroke={isSelected ? "#FFFFFF" : isCenter ? "#FF604B" : "#398BFF"}
                  strokeWidth={isSelected ? "2" : "1"}
                  className="transition-all duration-200"
                />

                {/* Node Label Text */}
                <text
                  x={pos.x}
                  y={pos.textPos === "top" ? pos.y - 14 : pos.y + 20}
                  textAnchor="middle"
                  className={`text-[11px] font-sans font-medium select-none ${
                    isCenter ? "fill-[#FF604B] font-bold" : "fill-[#F0EEE8]"
                  }`}
                  style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.9))" }}
                >
                  {node.label}
                </text>

                {/* Node Sublabel (Phone, Website, UPI ID, etc.) */}
                <text
                  x={pos.x}
                  y={pos.textPos === "top" ? pos.y - 26 : pos.y + 32}
                  textAnchor="middle"
                  className="text-[10px] font-sans fill-[#9299A3] select-none"
                >
                  {node.sublabel}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Legend matching reference: Coral dot = This identifier, Blue dot = Related identifier */}
      <div className="flex items-center gap-6 text-xs text-[#9299A3] pt-1">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#FF604B]" />
          <span>This identifier</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#398BFF]" />
          <span>Related identifier</span>
        </div>
      </div>
    </div>
  );
}

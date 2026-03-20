import React, { useState, useEffect } from "react";
import { Box, Text } from "ink";
import { theme } from "../../theme.js";

// ── SDF patterns ported from agent-bank/src/lib/patterns.ts ──

function heavyNoise(x: number, y: number, t: number): number {
  const v =
    Math.sin(x * 3.2 + t * 0.3) * Math.cos(y * 3.5 - t * 0.25) +
    Math.sin(x * 2.1 - y * 2.8 + t * 0.4) * 0.6 +
    Math.cos(x * 4.5 + y * 2.2 - t * 0.5) * 0.4 +
    Math.sin(x * 1.5 + y * 1.8 + t * 0.2) * 0.3;
  return v * 0.22 - 0.08;
}

function plasma(x: number, y: number, t: number): number {
  const d = Math.sqrt(x * x + y * y);
  const v =
    Math.sin(x * 4 + t * 0.5) +
    Math.sin(y * 3.5 - t * 0.4) +
    Math.sin(d * 5 - t * 0.6) +
    Math.sin((x + y) * 3 + t * 0.3);
  return v * 0.15 - 0.05;
}

// ── Smoothstep from dotmatrix.ts ──

function smoothstep(a: number, b: number, x: number): number {
  const t = Math.max(0, Math.min(1, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
}

// ── Terminal dot characters (density levels) ──
// Maps opacity 0→1 to increasingly dense block chars
const DENSITY = [" ", "·", "∙", ":", "░", "▒", "▓", "█"];

function opacityToChar(opacity: number): string {
  if (opacity < 0.02) return " ";
  const idx = Math.min(
    DENSITY.length - 1,
    Math.floor(opacity * DENSITY.length),
  );
  return DENSITY[idx];
}

function opacityToColor(opacity: number): string {
  if (opacity > 0.7) return theme.colors.primary;   // NERV orange for hot
  if (opacity > 0.4) return theme.colors.noiseBright;
  if (opacity > 0.15) return theme.colors.noise;
  return theme.colors.bg;
}

// ── Breathe effect from dotmatrix engine ──

function breathe(col: number, row: number, t: number): number {
  return (
    Math.sin(col * 0.7 + t * 1.5) *
    Math.cos(row * 0.5 + t * 1.1) *
    0.025
  );
}

interface NoisePanelProps {
  cols: number;
  rows: number;
  pattern?: "heavyNoise" | "plasma";
  children?: React.ReactNode;
}

const patterns = { heavyNoise, plasma };

export function NoisePanel({
  cols,
  rows,
  pattern = "heavyNoise",
  children,
}: NoisePanelProps) {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 120);
    return () => clearInterval(interval);
  }, []);

  const elapsed = tick * 0.12;
  const fn = patterns[pattern];

  // Render the dot matrix grid
  const grid: React.ReactNode[] = [];

  for (let row = 0; row < rows; row++) {
    const rowChars: React.ReactNode[] = [];

    for (let col = 0; col < cols; col++) {
      // Normalize to [-1, 1] like the canvas engine
      const nx = cols > 1 ? (col / (cols - 1)) * 2 - 1 : 0;
      const ny = rows > 1 ? (row / (rows - 1)) * 2 - 1 : 0;

      const d = fn(nx, ny, elapsed);
      const b = breathe(col, row, elapsed);
      const opacity = 1 - smoothstep(-0.1, 0.03 + b, d);

      const char = opacityToChar(opacity);
      const color = opacityToColor(opacity);

      rowChars.push(
        <Text key={col} color={color}>
          {char}
        </Text>,
      );
    }

    grid.push(
      <Box key={row}>
        {rowChars}
      </Box>,
    );
  }

  if (children) {
    // Overlay children centered over the noise
    return (
      <Box flexDirection="column" width={cols}>
        {grid.slice(0, Math.floor(rows / 2) - 1)}
        <Box justifyContent="center">{children}</Box>
        {grid.slice(Math.floor(rows / 2))}
      </Box>
    );
  }

  return <Box flexDirection="column">{grid}</Box>;
}

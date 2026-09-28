import React, { useState, useEffect, useMemo } from "react";
import { Box, Text } from "ink";
import { theme } from "../../theme.js";

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

function smoothstep(a: number, b: number, x: number): number {
  const t = Math.max(0, Math.min(1, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
}

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
  if (opacity > 0.7) return theme.colors.primary;
  if (opacity > 0.4) return theme.colors.noiseBright;
  if (opacity > 0.15) return theme.colors.noise;
  return theme.colors.bg;
}

function breathe(col: number, row: number, t: number): number {
  return Math.sin(col * 0.7 + t * 1.5) * Math.cos(row * 0.5 + t * 1.1) * 0.025;
}

interface NoisePanelProps {
  cols: number;
  rows: number;
  pattern?: "heavyNoise" | "plasma";
  children?: React.ReactNode;
}

const patterns = { heavyNoise, plasma };

type Segment = { color: string; text: string };

function buildRows(
  cols: number,
  rows: number,
  elapsed: number,
  pattern: "heavyNoise" | "plasma",
): Segment[][] {
  const fn = patterns[pattern];
  const grid: Segment[][] = [];

  for (let row = 0; row < rows; row++) {
    const segments: Segment[] = [];
    let currentColor: string | null = null;
    let buf = "";

    for (let col = 0; col < cols; col++) {
      const nx = cols > 1 ? (col / (cols - 1)) * 2 - 1 : 0;
      const ny = rows > 1 ? (row / (rows - 1)) * 2 - 1 : 0;
      const d = fn(nx, ny, elapsed);
      const b = breathe(col, row, elapsed);
      const opacity = 1 - smoothstep(-0.1, 0.03 + b, d);
      const color = opacityToColor(opacity);
      const char = opacityToChar(opacity);

      if (currentColor === null) {
        currentColor = color;
        buf = char;
      } else if (color === currentColor) {
        buf += char;
      } else {
        segments.push({ color: currentColor, text: buf });
        currentColor = color;
        buf = char;
      }
    }
    if (currentColor !== null && buf.length > 0) {
      segments.push({ color: currentColor, text: buf });
    }
    grid.push(segments);
  }

  return grid;
}

export function NoisePanel({
  cols,
  rows,
  pattern = "heavyNoise",
  children,
}: NoisePanelProps) {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    // Slow enough that Ink can patch without clearing the screen.
    const interval = setInterval(() => setTick((t) => t + 1), 800);
    return () => clearInterval(interval);
  }, []);

  const elapsed = tick * 0.35;
  const grid = useMemo(
    () => buildRows(cols, rows, elapsed, pattern),
    [cols, rows, elapsed, pattern],
  );

  const rendered = grid.map((segments, row) => (
    <Text key={row}>
      {segments.map((seg, i) => (
        <Text key={i} color={seg.color}>
          {seg.text}
        </Text>
      ))}
    </Text>
  ));

  if (children) {
    const mid = Math.max(0, Math.floor(rows / 2) - 1);
    return (
      <Box flexDirection="column" width={cols}>
        {rendered.slice(0, mid)}
        <Box justifyContent="center">{children}</Box>
        {rendered.slice(mid)}
      </Box>
    );
  }

  return <Box flexDirection="column">{rendered}</Box>;
}

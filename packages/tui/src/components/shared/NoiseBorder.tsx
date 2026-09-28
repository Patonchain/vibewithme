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

const BLOCK_CHARS = [" ", "·", "░", "▒", "▓", "█"];

function noiseToChar(value: number): string {
  const idx = Math.min(
    BLOCK_CHARS.length - 1,
    Math.max(0, Math.floor((value + 0.5) * BLOCK_CHARS.length)),
  );
  return BLOCK_CHARS[idx];
}

function noiseRow(innerWidth: number, yPos: number, height: number, t: number): string {
  let out = "";
  for (let x = 0; x < innerWidth; x++) {
    const nx = (x / Math.max(1, innerWidth)) * 4 - 2;
    const ny = (yPos / Math.max(1, height)) * 4 - 2;
    out += noiseToChar(heavyNoise(nx, ny, t));
  }
  return out;
}

interface NoiseBorderProps {
  width: number;
  height: number;
  children: React.ReactNode;
  label?: string;
  focused?: boolean;
}

export function NoiseBorder({
  width,
  height,
  children,
  label,
  focused = false,
}: NoiseBorderProps) {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTick((t) => t + 1);
    }, 800);
    return () => clearInterval(interval);
  }, []);

  const t = tick * 0.3;
  const borderColor = focused ? theme.colors.primary : theme.colors.border;
  const innerWidth = Math.max(1, width - 2);
  const sideHeight = Math.max(0, height - 2);

  const topRow = useMemo(() => noiseRow(innerWidth, 0, height, t), [innerWidth, height, t]);
  const botRow = useMemo(() => noiseRow(innerWidth, height, height, t), [innerWidth, height, t]);
  const leftCol = useMemo(() => {
    const chars: string[] = [];
    for (let i = 0; i < sideHeight; i++) {
      const ny = ((i + 1) / Math.max(1, height)) * 4 - 2;
      chars.push(noiseToChar(heavyNoise(-2, ny, t)));
    }
    return chars;
  }, [sideHeight, height, t]);
  const rightCol = useMemo(() => {
    const chars: string[] = [];
    for (let i = 0; i < sideHeight; i++) {
      const ny = ((i + 1) / Math.max(1, height)) * 4 - 2;
      chars.push(noiseToChar(heavyNoise(2, ny, t)));
    }
    return chars;
  }, [sideHeight, height, t]);

  const topLeft = focused ? "╔" : "┌";
  const topRight = focused ? "╗" : "┐";
  const botLeft = focused ? "╚" : "└";
  const botRight = focused ? "╝" : "┘";

  const labelText = label ? ` ${label.toUpperCase()} ` : "";
  const topFill = topRow.slice(labelText.length);

  return (
    <Box flexDirection="column" width={width}>
      <Text>
        <Text color={borderColor}>{topLeft}</Text>
        {labelText ? (
          <Text color={theme.colors.primary} bold>
            {labelText}
          </Text>
        ) : null}
        <Text color={theme.colors.noise}>{topFill || topRow}</Text>
        <Text color={borderColor}>{topRight}</Text>
      </Text>

      <Box flexDirection="row" flexGrow={1}>
        <Box flexDirection="column">
          <Text color={theme.colors.noise}>{leftCol.join("\n")}</Text>
        </Box>
        <Box flexDirection="column" flexGrow={1}>
          {children}
        </Box>
        <Box flexDirection="column">
          <Text color={theme.colors.noise}>{rightCol.join("\n")}</Text>
        </Box>
      </Box>

      <Text>
        <Text color={borderColor}>{botLeft}</Text>
        <Text color={theme.colors.noise}>{botRow}</Text>
        <Text color={borderColor}>{botRight}</Text>
      </Text>
    </Box>
  );
}

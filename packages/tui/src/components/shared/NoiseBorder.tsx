import React, { useState, useEffect } from "react";
import { Box, Text } from "ink";
import { theme } from "../../theme.js";

// Port of heavyNoise from agent-bank patterns
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

function noiseToColor(value: number): string {
  if (value > 0.3) return theme.colors.noiseAccent;
  if (value > 0.1) return theme.colors.noiseBright;
  if (value > -0.1) return theme.colors.noise;
  return theme.colors.bg;
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
    }, 150); // ~7fps animation
    return () => clearInterval(interval);
  }, []);

  const t = tick * 0.3;
  const borderColor = focused ? theme.colors.primary : theme.colors.border;
  const innerWidth = Math.max(1, width - 2);

  // Generate noise strips for top and bottom borders
  function renderNoiseRow(yPos: number): React.ReactNode {
    const chars: React.ReactNode[] = [];
    for (let x = 0; x < innerWidth; x++) {
      const nx = (x / innerWidth) * 4 - 2;
      const ny = (yPos / height) * 4 - 2;
      const v = heavyNoise(nx, ny, t);
      chars.push(
        <Text key={x} color={noiseToColor(v)}>
          {noiseToChar(v)}
        </Text>,
      );
    }
    return chars;
  }

  // Top border with label
  const topLeft = focused ? "╔" : "┌";
  const topRight = focused ? "╗" : "┐";
  const botLeft = focused ? "╚" : "└";
  const botRight = focused ? "╝" : "┘";

  return (
    <Box flexDirection="column" width={width}>
      {/* Top noise strip */}
      <Box>
        <Text color={borderColor}>{topLeft}</Text>
        {label ? (
          <>
            <Text color={theme.colors.primary} bold>
              {" "}
              {label.toUpperCase()}{" "}
            </Text>
            {renderNoiseRow(0)}
          </>
        ) : (
          renderNoiseRow(0)
        )}
        <Text color={borderColor}>{topRight}</Text>
      </Box>

      {/* Content with side noise */}
      <Box flexDirection="row" flexGrow={1}>
        <Box flexDirection="column">
          {Array.from({ length: Math.max(0, height - 2) }, (_, i) => {
            const ny = ((i + 1) / height) * 4 - 2;
            const v = heavyNoise(-2, ny, t);
            return (
              <Text key={i} color={noiseToColor(v)}>
                {noiseToChar(v)}
              </Text>
            );
          })}
        </Box>
        <Box flexDirection="column" flexGrow={1}>
          {children}
        </Box>
        <Box flexDirection="column">
          {Array.from({ length: Math.max(0, height - 2) }, (_, i) => {
            const ny = ((i + 1) / height) * 4 - 2;
            const v = heavyNoise(2, ny, t);
            return (
              <Text key={i} color={noiseToColor(v)}>
                {noiseToChar(v)}
              </Text>
            );
          })}
        </Box>
      </Box>

      {/* Bottom noise strip */}
      <Box>
        <Text color={borderColor}>{botLeft}</Text>
        {renderNoiseRow(height)}
        <Text color={borderColor}>{botRight}</Text>
      </Box>
    </Box>
  );
}

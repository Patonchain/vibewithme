// ═══════════════════════════════════════════════════════════
// EVANGELION / NERV TERMINAL AESTHETIC
// ═══════════════════════════════════════════════════════════

export const theme = {
  colors: {
    // Core
    bg: "#0a0a0a",
    surface: "#111411",
    border: "#1a3a1a",
    borderFocus: "#ff6600",
    borderWarn: "#ff3300",

    // Text
    text: "#88aa88",
    textDim: "#3a5a3a",
    textBright: "#ccffcc",
    textWhite: "#e0ffe0",

    // Evangelion accents
    primary: "#ff6600",       // NERV orange
    secondary: "#00ff66",     // Terminal green
    accent: "#ff3300",        // Warning red
    warning: "#ffaa00",       // Amber
    error: "#ff0033",         // Alert red
    success: "#00ff44",       // System green

    // UI specific
    aiBubble: "#ff6600",      // Claude = NERV orange
    userBubble: "#00ff66",    // User = green
    systemText: "#3a6a3a",    // Dim system messages

    // Noise/border characters
    noise: "#1a3a1a",         // Dim green noise
    noiseBright: "#2a5a2a",   // Brighter noise
    noiseAccent: "#ff6600",   // Orange noise highlights
  },

  // Block characters for noise borders
  noiseChars: ["░", "▒", "▓", "█", "▄", "▀", "▌", "▐", "┃", "║", "│"],
  borderChars: ["╔", "╗", "╚", "╝", "═", "║", "╠", "╣", "╦", "╩", "╬"],

  icons: {
    file: "  ",
    folder: "▸ ",
    folderOpen: "▾ ",
    online: "◆",
    offline: "◇",
    idle: "◈",
    ai: "◉",
    lock: "⊡",
    check: "✓",
    cross: "✗",
    arrow: "►",
    dot: "·",
  },
} as const;

export type Theme = typeof theme;

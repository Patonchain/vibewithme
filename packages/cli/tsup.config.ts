import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/bin.tsx"],
  format: ["esm"],
  banner: {
    js: "#!/usr/bin/env node",
  },
  external: ["react", "ink"],
  noExternal: ["@vibewithme/tui", "@vibewithme/shared"],
});

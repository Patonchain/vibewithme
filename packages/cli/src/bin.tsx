import React from "react";
import { render } from "ink";
import { Command } from "commander";
import path from "node:path";
import { App } from "@vibewithme/tui";

const program = new Command();

program
  .name("vibewithme")
  .description("Collaborative terminal IDE for vibe coding")
  .version("0.1.0");

// Main command — launch the TUI
program
  .argument("[project-path]", "Path to project directory", ".")
  .option("-s, --server <url>", "Collaboration server URL", "http://localhost:3847")
  .option("-r, --room <id>", "Room ID to join")
  .option("--solo", "Run without collaboration server")
  .action(
    (
      projectPath: string,
      options: { server?: string; room?: string; solo?: boolean },
    ) => {
      const resolvedPath = path.resolve(projectPath);

      const { waitUntilExit } = render(
        <App
          projectPath={resolvedPath}
          serverUrl={options.solo ? undefined : options.server}
          roomId={options.room}
        />,
        {
          exitOnCtrlC: true,
        },
      );

      waitUntilExit().then(() => {
        process.exit(0);
      });
    },
  );

// Serve command — run the collaboration server
program
  .command("serve")
  .description("Start the collaboration server")
  .option("-p, --port <port>", "HTTP port", "3847")
  .option("-w, --ws-port <port>", "WebSocket port", "3848")
  .action(async (options: { port: string; wsPort: string }) => {
    process.env.VWM_PORT = options.port;
    process.env.VWM_WS_PORT = options.wsPort;

    // Dynamic import to avoid bundling server deps in the CLI
    try {
      await import("@vibewithme/server");
    } catch (err) {
      console.error(
        "Server package not found. Install @vibewithme/server to run the collab server.",
      );
      console.error(err);
      process.exit(1);
    }
  });

program.parse();

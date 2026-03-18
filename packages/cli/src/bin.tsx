import React from "react";
import { render } from "ink";
import { Command } from "commander";
import path from "node:path";
import { App } from "@vibewithme/tui";

const program = new Command();

program
  .name("vibewithme")
  .description("Collaborative terminal IDE for vibe coding")
  .version("0.1.0")
  .argument("[project-path]", "Path to project directory", ".")
  .option("-s, --server <url>", "Collaboration server URL")
  .action((projectPath: string, options: { server?: string }) => {
    const resolvedPath = path.resolve(projectPath);

    const { waitUntilExit } = render(
      <App projectPath={resolvedPath} />,
      {
        exitOnCtrlC: true,
      },
    );

    waitUntilExit().then(() => {
      process.exit(0);
    });
  });

program.parse();

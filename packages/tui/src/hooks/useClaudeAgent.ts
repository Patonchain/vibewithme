import { useCallback, useRef } from "react";
import { useChatStore } from "../store/chat.js";
import { useWorkspaceStore } from "../store/workspace.js";

interface AgentSession {
  close: () => void;
}

export function useClaudeAgent() {
  const sessionRef = useRef<AgentSession | null>(null);
  const {
    addMessage,
    setAgentRunning,
    setAgentStreamText,
    appendAgentStreamText,
  } = useChatStore();
  const projectPath = useWorkspaceStore((s) => s.projectPath);

  const runAgent = useCallback(
    async (prompt: string) => {
      // Strip @ai prefix
      const cleanPrompt = prompt.replace(/^@ai\s*/i, "").trim();
      if (!cleanPrompt) return;

      setAgentRunning(true);
      setAgentStreamText("");

      try {
        // Dynamic import to avoid bundling issues
        const { query } = await import("@anthropic-ai/claude-agent-sdk");

        const session = query({
          prompt: cleanPrompt,
          options: {
            allowedTools: [
              "Read",
              "Write",
              "Edit",
              "Bash",
              "Glob",
              "Grep",
            ],
            cwd: projectPath,
            maxTurns: 25,
          },
        });

        sessionRef.current = session;

        let fullText = "";

        for await (const message of session) {
          // Handle different message types
          switch (message.type) {
            case "assistant": {
              // Complete assistant message
              const content = message.message?.content;
              if (Array.isArray(content)) {
                for (const block of content) {
                  if (block.type === "text") {
                    fullText = block.text;
                    setAgentStreamText(fullText);
                  } else if (block.type === "tool_use") {
                    addMessage({
                      userId: "claude",
                      userName: "Claude",
                      userColor: "#b4befe",
                      text: `[${block.name}] ${typeof block.input === "object" ? JSON.stringify(block.input).slice(0, 100) : String(block.input)}...`,
                      type: "system",
                    });
                  }
                }
              }
              break;
            }

            case "result": {
              // Final result
              const resultContent = message.result?.content;
              if (typeof resultContent === "string" && resultContent) {
                fullText = resultContent;
              } else if (Array.isArray(resultContent)) {
                for (const block of resultContent) {
                  if (block.type === "text") {
                    fullText = block.text;
                  }
                }
              }
              break;
            }

            default:
              // Other message types (status, progress, etc.)
              break;
          }
        }

        // Add the final complete response
        if (fullText) {
          addMessage({
            userId: "claude",
            userName: "Claude",
            userColor: "#b4befe",
            text: fullText,
            type: "agent",
          });
        }
      } catch (err: unknown) {
        const errorMsg =
          err instanceof Error ? err.message : "Unknown error";
        addMessage({
          userId: "system",
          userName: "system",
          userColor: "#6c7086",
          text: `Error: ${errorMsg}`,
          type: "system",
        });
      } finally {
        setAgentRunning(false);
        setAgentStreamText("");
        sessionRef.current = null;
      }
    },
    [
      projectPath,
      addMessage,
      setAgentRunning,
      setAgentStreamText,
      appendAgentStreamText,
    ],
  );

  const interrupt = useCallback(() => {
    if (sessionRef.current) {
      sessionRef.current.close();
      sessionRef.current = null;
      setAgentRunning(false);
      setAgentStreamText("");
      addMessage({
        userId: "system",
        userName: "system",
        userColor: "#6c7086",
        text: "Agent interrupted.",
        type: "system",
      });
    }
  }, [addMessage, setAgentRunning, setAgentStreamText]);

  return { runAgent, interrupt };
}

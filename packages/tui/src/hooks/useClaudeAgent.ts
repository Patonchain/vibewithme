import { useCallback, useRef } from "react";
import { useClaudeStore } from "../store/claude.js";
import { useChatStore } from "../store/chat.js";
import { useWorkspaceStore } from "../store/workspace.js";

export function useClaudeAgent() {
  const sessionRef = useRef<any>(null);
  const claudeStore = useClaudeStore();
  const chatStore = useChatStore();
  const projectPath = useWorkspaceStore((s) => s.projectPath);

  const runAgent = useCallback(
    async (prompt: string) => {
      const cleanPrompt = prompt.replace(/^@ai\s*/i, "").trim();
      if (!cleanPrompt) return;

      claudeStore.setRunning(true);
      claudeStore.clearEvents();
      claudeStore.setCurrentPrompt(cleanPrompt);

      claudeStore.addEvent({
        id: "",
        type: "thinking",
        content: `Prompt: ${cleanPrompt}`,
        timestamp: Date.now(),
      });

      try {
        const sdk = await import("@anthropic-ai/claude-agent-sdk");

        const session = sdk.query({
          prompt: cleanPrompt,
          options: {
            allowedTools: ["Read", "Write", "Edit", "Bash", "Glob", "Grep"],
            cwd: projectPath,
            maxTurns: 25,
          },
        });

        sessionRef.current = session;
        let fullResponseText = "";

        for await (const message of session) {
          const msgType = message?.type;

          if (msgType === "assistant") {
            const content = message?.message?.content;
            if (Array.isArray(content)) {
              for (const block of content) {
                if (block.type === "text" && block.text) {
                  fullResponseText = block.text;
                  claudeStore.setStreamingText(fullResponseText);
                } else if (block.type === "tool_use") {
                  const inputStr = typeof block.input === "object"
                    ? JSON.stringify(block.input).slice(0, 200)
                    : String(block.input).slice(0, 200);

                  claudeStore.addEvent({
                    id: "",
                    type: "tool_start",
                    content: inputStr,
                    toolName: block.name,
                    timestamp: Date.now(),
                  });
                }
              }
            }
          } else if (msgType === "result") {
            const resultContent = message?.result?.content;
            if (typeof resultContent === "string" && resultContent) {
              fullResponseText = resultContent;
            } else if (Array.isArray(resultContent)) {
              for (const block of resultContent) {
                if (block.type === "text") {
                  fullResponseText = block.text;
                }
              }
            }
            claudeStore.addEvent({
              id: "",
              type: "complete",
              content: "Session complete",
              timestamp: Date.now(),
            });
          }
        }

        // Add final response to chat
        if (fullResponseText) {
          chatStore.addMessage({
            userId: "claude",
            userName: "CLAUDE",
            userColor: "#ff6600",
            text: fullResponseText,
            type: "agent",
          });
        }
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : "Unknown error";
        claudeStore.addEvent({
          id: "",
          type: "error",
          content: errorMsg,
          timestamp: Date.now(),
        });
        chatStore.addMessage({
          userId: "system",
          userName: "SYSTEM",
          userColor: "#3a6a3a",
          text: `Error: ${errorMsg}`,
          type: "system",
        });
      } finally {
        claudeStore.setRunning(false);
        sessionRef.current = null;
      }
    },
    [projectPath, claudeStore, chatStore],
  );

  const interrupt = useCallback(() => {
    if (sessionRef.current) {
      sessionRef.current.close();
      sessionRef.current = null;
      claudeStore.setRunning(false);
      claudeStore.addEvent({
        id: "",
        type: "error",
        content: "Interrupted by user",
        timestamp: Date.now(),
      });
    }
  }, [claudeStore]);

  return { runAgent, interrupt };
}

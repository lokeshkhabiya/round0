"use client";
import { useEffect, useState, useImperativeHandle, forwardRef } from "react";
import { Button } from "./ui/button";
import { Bot } from "lucide-react";
import { Badge } from "./ui/badge";
import { useConversationContext } from "../context/conversation-context";

interface ToolArguments {
  task: string;
}

interface ExcalidrawWrapperProps {
  onClose?: () => void;
  setCanvasData?: (data: any) => void;
  tool?: {
    id: string;
    tool: string;
    arguments: ToolArguments;
  };
}

export interface ExcalidrawRef {
  exportAsImage: () => Promise<Blob | null>;
}

const ExcalidrawWrapper = forwardRef<ExcalidrawRef, ExcalidrawWrapperProps>(
  ({ onClose, setCanvasData, tool }, ref) => {
    const [Excalidraw, setExcalidraw] = useState<any>(null);
    const [excalidrawAPI, setExcalidrawAPI] = useState<any>(null);
    const [data, setData] = useState<any>(null);
    const [excalidrawTheme, setExcalidrawTheme] = useState<"light" | "dark">("light");
    const { submitToolResult } = useConversationContext();

    useEffect(() => {
      if (setCanvasData) {
        setCanvasData(data);
      }
    }, [data, setCanvasData]);

    // console.log(data);

    useEffect(() => {
      // Dynamic import to handle SSR issues
      import("@excalidraw/excalidraw").then((comp) => {
        // Also import CSS only when component loads
        // @ts-expect-error excalidraw css is not a module
        import("@excalidraw/excalidraw/index.css");
        setExcalidraw(() => comp.Excalidraw);
      });
    }, []);

    useEffect(() => {
      if (typeof document === "undefined") return;
      const root = document.documentElement;
      const syncTheme = () => {
        setExcalidrawTheme(root.classList.contains("dark") ? "dark" : "light");
      };
      syncTheme();

      const observer = new MutationObserver(syncTheme);
      observer.observe(root, { attributes: true, attributeFilter: ["class"] });

      return () => observer.disconnect();
    }, []);

    // Submit tool result when tool is provided (used in agent conversation)
    const submitCanvas = async () => {
      if (tool && excalidrawAPI) {
        try {
          const elements = excalidrawAPI.getSceneElements();
          const appState = excalidrawAPI.getAppState();
          
          const result = {
            elements: elements.length,
            hasContent: elements.length > 0,
            canvasData: data,
            success: elements.length > 0,
            metadata: {
              elementCount: elements.length,
              appState: {
                viewBackgroundColor: appState.viewBackgroundColor,
                zoom: appState.zoom
              },
              timestamp: new Date().toISOString()
            }
          };
          
          submitToolResult('system_design_evaluator', result);
        } catch (error) {
          console.error('Error submitting canvas:', error);
          submitToolResult('system_design_evaluator', {
            success: false,
            error: 'Failed to export canvas data'
          });
        }
      }
    };

    useImperativeHandle(ref, () => ({
      exportAsImage: async (): Promise<Blob | null> => {
        if (!excalidrawAPI) {
          console.error("Excalidraw API not available");
          return null;
        }

        try {
          // Import exportToBlob function
          const { exportToBlob } = await import("@excalidraw/excalidraw");
          
          // Get current scene state from excalidrawAPI instead of stale data
          const elements = excalidrawAPI.getSceneElements();
          const appState = excalidrawAPI.getAppState();
          const files = excalidrawAPI.getFiles();

          // console.log("Exporting with elements:", elements);
          // console.log("Exporting with appState:", appState);

          const blob = await exportToBlob({
            elements: elements,
            appState: {
              ...appState,
              exportBackground: true,
              exportWithDarkMode: false,
              exportEmbedScene: false, // Set to true if you want scene data embedded
            },
            files: files,
            getDimensions: () => ({ width: 1920, height: 1080 }), // Optional: set export dimensions
          });

          return blob;
        } catch (error) {
          console.error("Error exporting Excalidraw as image:", error);
          return null;
        }
      },
    }));

    if (!Excalidraw) {
      return (
        <div className="h-full w-full flex items-center justify-center bg-muted/40">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
            <p className="text-sm text-muted-foreground">Loading Excalidraw...</p>
          </div>
        </div>
      );
    }

    return (
      <div className="w-full h-full bg-card relative rounded-2xl border border-border/60 overflow-hidden">
        {/* Tool Instructions (when used by agent) - Enhanced visibility */}
        {tool?.arguments?.task && (
          <div className="absolute top-0 left-0 right-0 p-4 border-b border-border/80 bg-card/95 backdrop-blur-md z-50">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h4 className="font-semibold mb-1 text-base">System Design Task</h4>
                <p className="text-sm text-muted-foreground">{tool.arguments.task}</p>
              </div>
              <div className="flex items-center gap-3">
                {tool && (
                  <Badge variant="secondary" className="font-medium">
                    <Bot className="h-3 w-3 mr-1" />
                    Agent Tool
                  </Badge>
                )}
                {tool && (
                  <Button
                    size="sm"
                    onClick={submitCanvas}
                    className="flex items-center gap-1.5 shadow-sm"
                  >
                    <Bot className="h-4 w-4" />
                    Submit to Agent
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Always visible floating submit button when tool is present */}
        {tool && (
          <div className="absolute bottom-6 right-6 z-50">
            <Button
              size="sm"
              onClick={submitCanvas}
              className="flex items-center gap-1.5 rounded-full px-4 shadow-md"
            >
              <Bot className="h-4 w-4" />
              Submit to Agent
            </Button>
          </div>
        )}

        <div className={`w-full h-full ${tool?.arguments?.task ? 'pt-24' : ''}`}>
          <Excalidraw
            theme={excalidrawTheme}
            UIOptions={{
              canvasActions: {
                changeViewBackgroundColor: true,
                clearCanvas: true,
                export: false,
                loadScene: false,
                saveAsImage: true,
                theme: true,
                saveToActiveFile: false,
              },
            }}
            onChange={(e: any) => {
              setData(e);
            }}
            excalidrawAPI={(api: any) => setExcalidrawAPI(api)}
          />
        </div>
      </div>
    );
  }
);

ExcalidrawWrapper.displayName = "ExcalidrawWrapper";

export default ExcalidrawWrapper; 

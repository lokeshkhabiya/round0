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
        <div className="h-full w-full flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading Excalidraw...</p>
          </div>
        </div>
      );
    }

    return (
      <div className="w-full h-full bg-white relative">
        {/* Tool Instructions (when used by agent) - Enhanced visibility */}
        {tool?.arguments?.task && (
          <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-r from-blue-100 to-indigo-100 border-b-2 border-blue-200 shadow-lg z-50">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h4 className="font-semibold text-blue-900 mb-1 text-lg">System Design Task:</h4>
                <p className="text-blue-800 text-sm font-medium">{tool.arguments.task}</p>
              </div>
              <div className="flex items-center gap-3">
                {tool && (
                  <Badge variant="secondary" className="bg-blue-200 text-blue-800 font-medium">
                    <Bot className="h-3 w-3 mr-1" />
                    Agent Tool
                  </Badge>
                )}
                {tool && (
                  <Button
                    size="lg"
                    onClick={submitCanvas}
                    className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                  >
                    <Bot className="h-5 w-5" />
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
              size="lg"
              onClick={submitCanvas}
              className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-110 px-6 py-3 rounded-full border-2 border-white"
            >
              <Bot className="h-6 w-6" />
              Submit to Agent
            </Button>
          </div>
        )}

        <div className={`w-full h-full ${tool?.arguments?.task ? 'pt-24' : ''}`}>
          <Excalidraw
            theme="light"
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
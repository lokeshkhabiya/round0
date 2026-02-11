import dynamic from "next/dynamic";

const ExcalidrawWrapper = dynamic(
  () => import("./excalidraw-wrapper"),
  {
    ssr: false,
    loading: () => (
      <div className="h-full w-full flex items-center justify-center bg-muted/40">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">Loading Excalidraw...</p>
        </div>
      </div>
    ),
  }
);

export default ExcalidrawWrapper; 

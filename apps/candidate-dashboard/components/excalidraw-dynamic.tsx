import dynamic from "next/dynamic";

const ExcalidrawWrapper = dynamic(
  () => import("./excalidraw-wrapper"),
  {
    ssr: false,
    loading: () => (
      <div className="h-full w-full flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Excalidraw...</p>
        </div>
      </div>
    ),
  }
);

export default ExcalidrawWrapper; 
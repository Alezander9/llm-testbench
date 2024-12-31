import { useAgentEditorStore } from "../../../stores/agent-editor";
import { Tabs, TabsList, TabsTrigger } from "../../ui/tabs";

export const PreviewToggle = () => {
  const { previewMode, setPreviewMode } = useAgentEditorStore();

  return (
    <Tabs
      value={previewMode}
      onValueChange={(value) => setPreviewMode(value as "preview" | "compare")}
      className="w-full flex justify-center"
    >
      <TabsList className="grid w-[200px] grid-cols-2">
        <TabsTrigger value="preview">Preview</TabsTrigger>
        <TabsTrigger value="compare">Compare</TabsTrigger>
      </TabsList>
    </Tabs>
  );
};

import { useEffect, useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { LoaderCircle, Plus } from "lucide-react";
import { useLocation } from "react-router";

import { useAuth } from "@/components/auth/AuthContext";
import SettingsSection from "@/components/settings/SettingsSection";
import { useCacheWorkspace } from "@/components/settings/useCacheWorkspace";
import Notice from "@/components/shared/Notice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useWorkspace } from "@/components/workspace/WorkspaceContext";
import { createWorkspace } from "@/lib/fastapi.api";

export default function CreateWorkspaceSection() {
  const { session } = useAuth();
  const { setActiveWorkspaceId } = useWorkspace();
  const cacheWorkspace = useCacheWorkspace();
  const { hash, key } = useLocation();
  const nameRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  // "Create workspace" links elsewhere in the app point here.
  useEffect(() => {
    if (hash !== "#create-workspace") return;
    // Wait briefly so a closing menu has finished returning focus.
    const timer = window.setTimeout(() => {
      nameRef.current?.focus({ preventScroll: true });
      nameRef.current?.scrollIntoView({ block: "center" });
    }, 150);
    return () => window.clearTimeout(timer);
  }, [hash, key]);

  const createMutation = useMutation({
    mutationFn: () => createWorkspace(session!.access_token, name.trim(), description),
    onSuccess: (workspace) => {
      cacheWorkspace(workspace);
      setActiveWorkspaceId(workspace.id);
      setName("");
      setDescription("");
    },
  });

  return (
    <SettingsSection
      id="create-workspace"
      title="Create another workspace"
      description="You will become its owner, and it will be selected automatically."
    >
      <form
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          createMutation.mutate();
        }}
      >
        <div className="space-y-2">
          <Label htmlFor="new-workspace-name">New workspace name</Label>
          <Input
            ref={nameRef}
            id="new-workspace-name"
            required
            maxLength={120}
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Acme Support"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="new-workspace-description">Description (optional)</Label>
          <Textarea
            id="new-workspace-description"
            maxLength={500}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="What does this workspace support?"
            className="min-h-20 resize-y"
          />
        </div>
        {createMutation.isError && <Notice tone="error">{createMutation.error.message}</Notice>}
        {createMutation.isSuccess && (
          <Notice tone="success">{createMutation.data.name} was created and is now selected.</Notice>
        )}
        <div className="flex justify-end">
          <Button
            type="submit"
            variant="outline"
            className="w-full sm:w-auto"
            disabled={createMutation.isPending || !name.trim()}
          >
            {createMutation.isPending
              ? <LoaderCircle aria-hidden="true" className="animate-spin" />
              : <Plus aria-hidden="true" />}
            {createMutation.isPending ? "Creating…" : "Create workspace"}
          </Button>
        </div>
      </form>
    </SettingsSection>
  );
}

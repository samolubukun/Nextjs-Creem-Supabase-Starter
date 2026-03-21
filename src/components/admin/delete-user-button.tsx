"use client";

import { useTransition } from "react";
import { Trash2, Loader2 } from "lucide-react";
import { deleteUserAction } from "@/app/actions/admin-actions";
import { Button } from "@/components/ui/button";

export function DeleteUserButton({ userId, userName }: { userId: string, userName: string }) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (confirm(`ARE YOU ABSOLUTELY SURE? \n\nThis will permanently delete ${userName} and ALL their associated data, credits, and subscriptions. This cannot be undone.`)) {
      startTransition(async () => {
        const result = await deleteUserAction(userId);
        if (!result.success) {
          alert(`Error: ${result.error}`);
        }
      });
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleDelete}
      disabled={isPending}
      className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
      title="Delete User"
    >
      {isPending ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
    </Button>
  );
}

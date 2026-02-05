"use client";

import { Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export function DraftsManager({
  isOpen,
  onOpenChange,
  drafts,
  handleDeleteDraft,
  handleEditDraft,
  handlePublishDraft, // Passing this as a prop to invoke createPost behavior
  deletingDraftId,
  publishingDraftId,
  stripMarkdown, // Helper function passed as prop
}) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-x-hidden overflow-y-auto">
        <DialogHeader>
          <DialogTitle>My Drafts</DialogTitle>
          <DialogDescription>
            Manage your unpublished posts here. You can edit or publish them.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 mt-4">
          {drafts.length > 0 ? (
            drafts.map((draft) => (
              <div
                key={draft.id}
                className="flex w-full min-w-0 items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <div className="flex items-center flex-1 min-w-0 mr-4">
                  {draft.imageUrl && (
                    <img
                      src={draft.imageUrl}
                      alt=""
                      className="w-12 h-12 object-cover rounded mr-4 shrink-0 border"
                    />
                  )}
                  <div className="min-w-0 w-full">
                    <h4 className="font-semibold truncate">{draft.title}</h4>
                    <p className="text-sm text-gray-500 line-clamp-1">
                      {stripMarkdown(draft.content)}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0 max-w-full">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                    disabled={deletingDraftId === draft.id}
                    onClick={() => handleDeleteDraft(draft.id)}>
                    {deletingDraftId === draft.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={
                      publishingDraftId === draft.id ||
                      deletingDraftId === draft.id
                    }
                    onClick={() => handleEditDraft(draft)}>
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    disabled={
                      publishingDraftId === draft.id ||
                      deletingDraftId === draft.id
                    }
                    onClick={() => handlePublishDraft(draft)}>
                    {publishingDraftId === draft.id ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Publishing...
                      </>
                    ) : (
                      "Publish"
                    )}
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center py-8 text-gray-500">
              You have no drafts at the moment.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

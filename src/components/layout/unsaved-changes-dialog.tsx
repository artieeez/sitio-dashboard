import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { ptBR } from "@/messages/pt-BR";

export type UnsavedChangesDialogProps = {
  open: boolean;
  onContinueEditing: () => void;
  onDiscard: () => void;
  onSave?: () => void;
  /** When true and `onSave` is set, shows the optional primary save action. */
  canSave?: boolean;
};

export function UnsavedChangesDialog({
  open,
  onContinueEditing,
  onDiscard,
  onSave,
  canSave = false,
}: UnsavedChangesDialogProps) {
  const copy = ptBR.unsavedChanges;

  return (
    <AlertDialog open={open}>
      <AlertDialogContent data-testid="unsaved-changes-dialog">
        <AlertDialogHeader>
          <AlertDialogTitle>{copy.title}</AlertDialogTitle>
          <AlertDialogDescription>{copy.description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button type="button" variant="outline" onClick={onContinueEditing}>
            {copy.continueEditing}
          </Button>
          {canSave && onSave ? (
            <Button type="button" onClick={onSave}>
              {copy.save}
            </Button>
          ) : null}
          <Button type="button" variant="destructive" onClick={onDiscard}>
            {copy.discard}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

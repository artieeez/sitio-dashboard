import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { UnsavedChangesDialog } from "@/components/layout/unsaved-changes-dialog";
import { ptBR } from "@/messages/pt-BR";

describe("unsaved-changes-dialog shell (M3)", () => {
  it("renders pt-BR copy when open", () => {
    render(
      <UnsavedChangesDialog
        open
        onContinueEditing={vi.fn()}
        onDiscard={vi.fn()}
      />,
    );

    expect(screen.getByTestId("unsaved-changes-dialog")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: ptBR.unsavedChanges.title }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(ptBR.unsavedChanges.description),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: ptBR.unsavedChanges.continueEditing }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: ptBR.unsavedChanges.discard }),
    ).toBeInTheDocument();
  });

  it("invokes continue editing without discard", () => {
    const onContinue = vi.fn();
    const onDiscard = vi.fn();

    render(
      <UnsavedChangesDialog
        open
        onContinueEditing={onContinue}
        onDiscard={onDiscard}
      />,
    );

    fireEvent.click(
      screen.getByRole("button", { name: ptBR.unsavedChanges.continueEditing }),
    );

    expect(onContinue).toHaveBeenCalledTimes(1);
    expect(onDiscard).not.toHaveBeenCalled();
  });

  it("invokes discard", () => {
    const onContinue = vi.fn();
    const onDiscard = vi.fn();

    render(
      <UnsavedChangesDialog
        open
        onContinueEditing={onContinue}
        onDiscard={onDiscard}
      />,
    );

    fireEvent.click(
      screen.getByRole("button", { name: ptBR.unsavedChanges.discard }),
    );

    expect(onDiscard).toHaveBeenCalledTimes(1);
  });
});

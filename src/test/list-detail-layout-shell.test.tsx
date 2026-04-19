import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import {
  ListDetailLayoutPane,
  useListDetailLayout,
} from "@/components/layout/list-detail-layout-pane";
import { ptBR } from "@/messages/pt-BR";

function RowButton({ id, label }: { id: string; label: string }) {
  const { selectedKey, requestSelect } = useListDetailLayout();
  return (
    <button
      type="button"
      aria-current={selectedKey === id ? true : undefined}
      onClick={() => requestSelect(id)}
    >
      {label}
    </button>
  );
}

function CompactDetailWithClose({
  testId,
  label,
}: {
  testId: string;
  label: string;
}) {
  const { requestCloseDetail } = useListDetailLayout();
  return (
    <div data-testid={testId}>
      <button
        type="button"
        aria-label={ptBR.listDetail.detailClose}
        onClick={() => requestCloseDetail()}
      >
        ×
      </button>
      <span>{label}</span>
    </div>
  );
}

describe("list-detail-layout shell (M3)", () => {
  it("exposes stable test ids and named list/detail regions when expanded", () => {
    render(
      <ListDetailLayoutPane
        isCompact={false}
        list={<span>lista</span>}
        detail={<span>detalhe</span>}
      />,
    );

    expect(screen.getByTestId("list-detail-layout")).toBeInTheDocument();
    expect(screen.getByTestId("list-detail-list-pane")).toBeInTheDocument();
    expect(screen.getByTestId("list-detail-detail-pane")).toBeInTheDocument();

    expect(
      screen.getByRole("region", { name: ptBR.listDetail.listRegion }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("region", { name: ptBR.listDetail.detailRegion }),
    ).toBeInTheDocument();
  });

  it("uses a narrow detail column on desktop when narrowDetailPane is set", () => {
    render(
      <ListDetailLayoutPane
        isCompact={false}
        narrowDetailPane
        list={<span>lista</span>}
        detail={<span>detalhe</span>}
      />,
    );

    const detail = screen.getByTestId("list-detail-detail-pane");
    expect(detail.className).toContain("max-w-");
    expect(detail.className).toContain("shrink-0");
  });

  it("marks the selected row with aria-current in expanded mode", () => {
    render(
      <ListDetailLayoutPane
        isCompact={false}
        selectedKey="b"
        list={
          <div>
            <RowButton id="a" label="Row A" />
            <RowButton id="b" label="Row B" />
          </div>
        }
        detail={<span>detalhe</span>}
      />,
    );

    const rowB = screen.getByRole("button", { name: "Row B" });
    expect(rowB).toHaveAttribute("aria-current", "true");
    expect(screen.getByRole("button", { name: "Row A" })).not.toHaveAttribute(
      "aria-current",
    );
  });

  it("shows one primary pane at a time in compact mode with a close control on detail", () => {
    render(
      <ListDetailLayoutPane
        isCompact
        selectedKey="x"
        list={<span data-testid="compact-list">lista-compacta</span>}
        detail={
          <CompactDetailWithClose
            testId="compact-detail"
            label="detalhe-compacto"
          />
        }
      />,
    );

    expect(screen.queryByTestId("compact-list")).not.toBeInTheDocument();
    expect(screen.getByTestId("compact-detail")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: ptBR.listDetail.detailClose }),
    ).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", { name: ptBR.listDetail.detailClose }),
    );

    expect(screen.getByTestId("compact-list")).toBeInTheDocument();
    expect(screen.queryByTestId("compact-detail")).not.toBeInTheDocument();
  });

  it("when dirty, blocks row change until the user continues editing", () => {
    const onSelectedKeyChange = vi.fn();
    const onDiscardDirty = vi.fn();

    render(
      <ListDetailLayoutPane
        isCompact={false}
        selectedKey="a"
        onSelectedKeyChange={onSelectedKeyChange}
        isDirty
        onDiscardDirty={onDiscardDirty}
        list={
          <div>
            <RowButton id="a" label="Row A" />
            <RowButton id="b" label="Row B" />
          </div>
        }
        detail={<span>detalhe</span>}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Row B" }));

    expect(screen.getByTestId("unsaved-changes-dialog")).toBeInTheDocument();
    expect(onSelectedKeyChange).not.toHaveBeenCalled();
    expect(onDiscardDirty).not.toHaveBeenCalled();

    fireEvent.click(
      screen.getByRole("button", { name: ptBR.unsavedChanges.continueEditing }),
    );

    expect(onSelectedKeyChange).not.toHaveBeenCalled();
    expect(onDiscardDirty).not.toHaveBeenCalled();
  });

  it("when dirty, discard applies pending selection change and calls onDiscardDirty", () => {
    const onSelectedKeyChange = vi.fn();
    const onDiscardDirty = vi.fn();

    render(
      <ListDetailLayoutPane
        isCompact={false}
        selectedKey="a"
        onSelectedKeyChange={onSelectedKeyChange}
        isDirty
        onDiscardDirty={onDiscardDirty}
        list={
          <div>
            <RowButton id="a" label="Row A" />
            <RowButton id="b" label="Row B" />
          </div>
        }
        detail={<span>detalhe</span>}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Row B" }));

    fireEvent.click(
      screen.getByRole("button", { name: ptBR.unsavedChanges.discard }),
    );

    expect(onDiscardDirty).toHaveBeenCalledTimes(1);
    expect(onSelectedKeyChange).toHaveBeenCalledWith("b");
  });

  it("when dirty, compact close opens the unsaved dialog before leaving detail", () => {
    const onDiscardDirty = vi.fn();

    render(
      <ListDetailLayoutPane
        isCompact
        selectedKey="x"
        isDirty
        onDiscardDirty={onDiscardDirty}
        list={<span data-testid="compact-list">lista-compacta</span>}
        detail={
          <CompactDetailWithClose
            testId="compact-detail"
            label="detalhe-compacto"
          />
        }
      />,
    );

    fireEvent.click(
      screen.getByRole("button", { name: ptBR.listDetail.detailClose }),
    );

    expect(screen.getByTestId("unsaved-changes-dialog")).toBeInTheDocument();
    expect(screen.queryByTestId("compact-list")).not.toBeInTheDocument();
    expect(onDiscardDirty).not.toHaveBeenCalled();
  });
});

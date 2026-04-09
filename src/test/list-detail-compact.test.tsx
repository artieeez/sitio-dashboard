import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ListDetailLayout } from "@/components/layout/list-detail-layout";
import { ptBR } from "@/messages/pt-BR";

/**
 * US2 / T023: compact list↔detail via `isCompactOverride` (no `matchMedia` in unit tests).
 */
describe("list-detail compact (US2 / T023)", () => {
  it("with selection, shows detail only until Close returns to list", () => {
    render(
      <ListDetailLayout
        isCompactOverride
        selectedKey="row-1"
        list={<span data-testid="compact-list">lista</span>}
        detail={<span data-testid="compact-detail">detalhe</span>}
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

  it("with no selection, shows list pane only (detail region hidden)", () => {
    render(
      <ListDetailLayout
        isCompactOverride
        selectedKey={null}
        list={<span data-testid="compact-list-only">lista</span>}
        detail={<span data-testid="compact-detail-hidden">detalhe</span>}
      />,
    );

    expect(screen.getByTestId("compact-list-only")).toBeInTheDocument();
    expect(
      screen.queryByTestId("compact-detail-hidden"),
    ).not.toBeInTheDocument();
  });

  it("Close invokes onSelectedKeyChange(null) when parent controls routing", () => {
    const onSelectedKeyChange = vi.fn();

    render(
      <ListDetailLayout
        isCompactOverride
        selectedKey="x"
        onSelectedKeyChange={onSelectedKeyChange}
        list={<span>lista</span>}
        detail={<span>detalhe</span>}
      />,
    );

    fireEvent.click(
      screen.getByRole("button", { name: ptBR.listDetail.detailClose }),
    );

    expect(onSelectedKeyChange).toHaveBeenCalledWith(null);
  });

  it("dirty compact Close opens unsaved dialog (same guard path as row change)", () => {
    render(
      <ListDetailLayout
        isCompactOverride
        selectedKey="x"
        isDirty
        onDiscardDirty={vi.fn()}
        list={<span data-testid="compact-list">lista</span>}
        detail={<span data-testid="compact-detail">detalhe</span>}
      />,
    );

    fireEvent.click(
      screen.getByRole("button", { name: ptBR.listDetail.detailClose }),
    );

    expect(screen.getByTestId("unsaved-changes-dialog")).toBeInTheDocument();
    expect(screen.queryByTestId("compact-list")).not.toBeInTheDocument();
  });
});

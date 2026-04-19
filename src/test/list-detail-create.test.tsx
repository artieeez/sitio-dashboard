import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ListDetailLayout } from "@/components/layout/list-detail-layout";
import { ptBR } from "@/messages/pt-BR";

describe("list–detail create/edit in detail region (US3 / T026)", () => {
  it("renders a create surface inside the named detail region", () => {
    render(
      <ListDetailLayout
        isCompactOverride={false}
        selectedKey="__new__"
        list={<div data-testid="collection-list">collection</div>}
        detail={
          <div data-testid="create-form-surface">
            {ptBR.actions.create} {ptBR.entities.school}
          </div>
        }
      />,
    );

    const detailRegion = screen.getByRole("region", {
      name: ptBR.listDetail.detailRegion,
    });
    expect(detailRegion).toContainElement(
      screen.getByTestId("create-form-surface"),
    );
    expect(detailRegion).toHaveTextContent(ptBR.actions.create);
  });
});

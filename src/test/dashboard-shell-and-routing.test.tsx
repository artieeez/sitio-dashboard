import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@tanstack/react-router", async (importOriginal) => {
  const mod = await importOriginal<typeof import("@tanstack/react-router")>();
  return {
    ...mod,
    Link: (props: { to: string; className?: string; children: ReactNode }) => (
      <a href={props.to} className={props.className}>
        {props.children}
      </a>
    ),
  };
});

import { DashboardShell } from "@/components/layout/dashboard-shell";

describe("Dashboard shell (US5)", () => {
  it("exposes a scrollable main region and sidebar landmark", () => {
    render(
      <DashboardShell>
        <div>Conteúdo</div>
      </DashboardShell>,
    );
    expect(screen.getByRole("main")).toBeInTheDocument();
    expect(
      screen.getByRole("complementary", { name: /navegação principal/i }),
    ).toBeInTheDocument();
  });
});

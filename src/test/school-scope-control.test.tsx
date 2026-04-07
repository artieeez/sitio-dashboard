import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SchoolScopeSummary } from "@/components/layout/school-scope-header";

describe("school scope header", () => {
  it("renders fallback initials and placeholder user", () => {
    render(<SchoolScopeSummary school={null} />);
    expect(screen.getByText(/selecione uma escola/i)).toBeInTheDocument();
    expect(screen.getByText(/usuário da escola/i)).toBeInTheDocument();
  });

  it("renders school title when available", () => {
    render(
      <SchoolScopeSummary
        school={{
          id: "550e8400-e29b-41d4-a716-446655440000",
          title: "Escola Aurora",
          faviconUrl: null,
          url: null,
          active: true,
          createdAt: "2026-01-01T00:00:00.000Z",
          updatedAt: "2026-01-01T00:00:00.000Z",
        }}
      />,
    );
    expect(screen.getByText("Escola Aurora")).toBeInTheDocument();
  });
});

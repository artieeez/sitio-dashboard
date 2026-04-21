import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it } from "vitest";

import { WixIntegrationKeyFields } from "@/components/wix/wix-integration-key-fields";

function KeyFieldsHarness() {
  const [appId, setAppId] = useState<string | null>(null);
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [privateApiKeyPrefix, setPrivateApiKeyPrefix] = useState<string | null>(
    null,
  );
  return (
    <WixIntegrationKeyFields
      appId={appId}
      publicKey={publicKey}
      privateApiKeyPrefix={privateApiKeyPrefix}
      onAppIdChange={setAppId}
      onPublicKeyChange={setPublicKey}
      onPrivateApiKeyChange={(v) => setPrivateApiKeyPrefix(v.slice(0, 10))}
    />
  );
}

describe("Wix integration key fields (US2)", () => {
  it("shows edit controls; private input is masked until reveal", () => {
    render(<KeyFieldsHarness />);

    const editButtons = screen.getAllByRole("button", { name: /^editar$/i });
    expect(editButtons).toHaveLength(3);

    fireEvent.click(editButtons[0]);
    expect(
      screen.getByPlaceholderText(/oauth apps no painel wix/i),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /cancelar/i }));
    fireEvent.click(screen.getAllByRole("button", { name: /^editar$/i })[2]);

    const privateInput = screen.getByPlaceholderText(
      /chave privada ou da api/i,
    );
    expect(privateInput).toHaveAttribute("type", "password");
  });

  it("retains draft values in edit mode after blur", () => {
    render(<KeyFieldsHarness />);

    fireEvent.click(screen.getAllByRole("button", { name: /^editar$/i })[1]);
    const pub = screen.getByPlaceholderText(/chave pública do site/i);
    fireEvent.change(pub, { target: { value: "pk-test" } });
    fireEvent.blur(pub);
    expect(pub).toHaveValue("pk-test");
  });

  it("toggles private field visibility with reveal control", () => {
    render(<KeyFieldsHarness />);

    fireEvent.click(screen.getAllByRole("button", { name: /^editar$/i })[2]);
    const priv = screen.getByPlaceholderText(/chave privada ou da api/i);
    expect(priv).toHaveAttribute("type", "password");

    fireEvent.click(screen.getByRole("button", { name: /mostrar chave/i }));
    expect(priv).toHaveAttribute("type", "text");

    fireEvent.click(screen.getByRole("button", { name: /ocultar chave/i }));
    expect(priv).toHaveAttribute("type", "password");
  });
});

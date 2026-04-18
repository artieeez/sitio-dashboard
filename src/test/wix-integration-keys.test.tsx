import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it } from "vitest";

import { WixIntegrationKeyFields } from "@/components/wix/wix-integration-key-fields";

function KeyFieldsHarness() {
  const [publicKey, setPublicKey] = useState("");
  const [privateApiKey, setPrivateApiKey] = useState("");
  return (
    <WixIntegrationKeyFields
      publicKey={publicKey}
      privateApiKey={privateApiKey}
      onPublicKeyChange={setPublicKey}
      onPrivateApiKeyChange={setPrivateApiKey}
    />
  );
}

describe("Wix integration key fields (US2)", () => {
  it("renders public and private inputs above the table area; private is masked by default", () => {
    render(<KeyFieldsHarness />);

    expect(
      screen.getByPlaceholderText(/chave pública do site/i),
    ).toBeInTheDocument();
    const privateInput = screen.getByPlaceholderText(
      /chave privada ou da api/i,
    );
    expect(privateInput).toHaveAttribute("type", "password");
  });

  it("retains values after blur", () => {
    render(<KeyFieldsHarness />);

    const pub = screen.getByPlaceholderText(/chave pública do site/i);
    const priv = screen.getByPlaceholderText(/chave privada ou da api/i);

    fireEvent.change(pub, { target: { value: "pk-test" } });
    fireEvent.change(priv, { target: { value: "sk-secret" } });
    fireEvent.blur(pub);
    fireEvent.blur(priv);

    expect(pub).toHaveValue("pk-test");
    expect(priv).toHaveValue("sk-secret");
  });

  it("toggles private field visibility with reveal control", () => {
    render(<KeyFieldsHarness />);

    const priv = screen.getByPlaceholderText(/chave privada ou da api/i);
    expect(priv).toHaveAttribute("type", "password");

    fireEvent.click(screen.getByRole("button", { name: /mostrar chave/i }));
    expect(priv).toHaveAttribute("type", "text");

    fireEvent.click(screen.getByRole("button", { name: /ocultar chave/i }));
    expect(priv).toHaveAttribute("type", "password");
  });
});

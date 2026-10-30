export type AccountChrome =
  | { kind: "guest"; label: "Demo guest"; hint: string; prompt: null }
  | { kind: "owner"; label: string; prompt: null }
  | { kind: "signed-out"; label: string; prompt: string };

export function accountChrome(input: { demo: boolean; ownerName?: string | null }): AccountChrome {
  if (input.demo) {
    return {
      kind: "guest",
      label: "Demo guest",
      hint: "Sample books stay on this device.",
      prompt: null,
    };
  }
  if (input.ownerName) return { kind: "owner", label: input.ownerName, prompt: null };
  return { kind: "signed-out", label: "Studio", prompt: "Sign in" };
}

export type LoginCopy =
  | { kind: "hidden"; heading: string; body: string }
  | {
      kind: "form";
      heading: string;
      body: string;
      emailLabel: string;
      passwordLabel: string;
      submit: string;
    };

export function loginCopy(demo: boolean): LoginCopy {
  if (demo) {
    return {
      kind: "hidden",
      heading: "Demo guest",
      body: "This preview is open. Browse, book, and pay with the sample book. No account is required.",
    };
  }
  return {
    kind: "form",
    heading: "Sign in",
    body: "Owners open the studio with the email and password set for this shop.",
    emailLabel: "Email",
    passwordLabel: "Password",
    submit: "Continue",
  };
}

export function loginSurface(demo: boolean): "redirect" | "form" {
  return demo ? "redirect" : "form";
}

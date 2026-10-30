import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { loginCopy } from "@/lib/account-chrome";
import { setOwner } from "@/lib/store";
import { signInOwner } from "@/lib/server-fns";
import { fieldClass, primaryClass } from "./classes";

export function LoginScreen({ demo }: { demo: boolean }) {
  const copy = loginCopy(demo);
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (copy.kind === "hidden") {
    return (
      <div className="mx-auto max-w-md py-10">
        <h1 className="font-display text-4xl">{copy.heading}</h1>
        <p className="mt-3 text-stone">{copy.body}</p>
      </div>
    );
  }

  return (
    <form
      className="mx-auto flex max-w-md flex-col gap-4 py-6"
      onSubmit={(event) => {
        event.preventDefault();
        setBusy(true);
        setError("");
        void signInOwner({ data: { email, password } })
          .then((result) => {
            if (!result.ok) {
              setError(result.error);
              return;
            }
            setOwner({ email: result.email, name: result.name });
            void navigate({ to: "/studio" });
          })
          .catch(() => setError("The studio couldn't be reached. Try again."))
          .finally(() => setBusy(false));
      }}
    >
      <div>
        <h1 className="font-display text-4xl">{copy.heading}</h1>
        <p className="mt-2 text-sm text-stone">{copy.body}</p>
      </div>
      <label className="text-sm">
        {copy.emailLabel}
        <input
          type="email"
          autoComplete="username"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
          className={fieldClass}
        />
      </label>
      <label className="text-sm">
        {copy.passwordLabel}
        <input
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
          className={fieldClass}
        />
      </label>
      {error && (
        <p className="text-sm text-oxblood" role="alert">
          {error}
        </p>
      )}
      <button type="submit" disabled={busy} className={primaryClass}>
        {busy ? "Checking…" : copy.submit}
      </button>
    </form>
  );
}

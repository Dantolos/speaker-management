"use client";

import { useState, useRef } from "react";

function OtpInput() {
  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (i: number, val: string) => {
    const digit = val.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[i] = digit;
    setDigits(next);
    if (digit && i < 5) inputsRef.current[i + 1]?.focus();
  };

  const handleKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !digits[i] && i > 0) {
      inputsRef.current[i - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    if (pasted.length === 6) {
      setDigits(pasted.split(""));
      inputsRef.current[5]?.focus();
    }
    e.preventDefault();
  };

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm text-foreground/50 text-center">
        Authenticator Code
      </span>
      <input type="hidden" name="otp" value={digits.join("")} />
      <div className="flex gap-2 justify-center">
        {digits.map((d, i) => (
          <input
            key={i}
            ref={(el) => {
              inputsRef.current[i] = el;
            }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={d}
            autoFocus={i === 0}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onPaste={i === 0 ? handlePaste : undefined}
            className="w-11 h-14 text-center text-xl font-medium bg-primary/10 border-2 border-primary/20 rounded-xl focus:outline-none focus:border-primary transition-all"
          />
        ))}
      </div>
    </div>
  );
}
import { authInternal } from "./actions";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Image from "next/image";

export default function SignIn() {
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get("redirect") || "/";
  const error = searchParams.get("error");

  const [step, setStep] = useState<"credentials" | "otp">("credentials");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="bg-primary/10 w-screen h-screen absolute px-4 flex justify-center items-center">
      <div className="max-w-md w-full mx-auto bg-background shadow-2xl rounded-3xl pt-10 pb-8 px-4">
        <div className="flex flex-col gap-4 mb-6 px-2">
          <div className="flex w-full justify-center">
            <Image
              src="/assets/linden-icon.svg"
              alt="LINDENverse"
              height={60}
              width={60}
            />
          </div>
          <p className="text-center text-foreground/50">
            {step === "credentials" ? "" : "2-Faktor Authentifizierung"}
          </p>
        </div>

        {error === "credentials" && (
          <p className="text-center text-sm text-secondary mb-4">
            E-Mail oder Passwort falsch.
          </p>
        )}
        {error === "otp" && (
          <p className="text-center text-sm text-secondary mb-4">
            Falscher Authenticator Code.
          </p>
        )}

        <form action={authInternal} className="flex flex-col gap-3 px-2">
          <input type="hidden" name="redirect" value={redirectParam} />

          {step === "credentials" ? (
            <>
              <label className="flex flex-col gap-1">
                <span className="text-sm text-foreground/50 ">E-Mail</span>
                <input
                  type="email"
                  name="email"
                  required
                  autoFocus
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="p-4 bg-primary/10 border-2 border-primary/20 rounded-2xl focus:outline-none focus:border-primary"
                />
              </label>

              <label className="flex flex-col gap-1">
                <span className="text-sm text-foreground/50">Passwort</span>
                <input
                  type="password"
                  name="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="p-4 bg-primary/10 border-2 border-primary/20 rounded-2xl focus:outline-none focus:border-primary"
                />
              </label>

              <button
                type="button"
                disabled={!email || !password}
                onClick={() => setStep("otp")}
                className="w-full py-4 bg-primary text-white rounded-xl hover:bg-secondary transition-colors cursor-pointer mt-2 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Weiter
              </button>
            </>
          ) : (
            <>
              {/* Hidden fields so form has all values */}
              <input type="hidden" name="email" value={email} />
              <input type="hidden" name="password" value={password} />

              <OtpInput />

              <button
                type="submit"
                className="w-full py-4 bg-primary text-white rounded-xl hover:bg-secondary transition-colors cursor-pointer mt-2"
              >
                Anmelden
              </button>

              <button
                type="button"
                onClick={() => setStep("credentials")}
                className="flex items-center justify-center gap-2 text-sm text-foreground/40 hover:text-foreground/60 transition-colors"
              >
                <ArrowLeft size={14} />
                Zurück
              </button>
            </>
          )}
        </form>
      </div>

      <div className="w-full text-center text-foreground/30 bottom-3 absolute text-xs">
        © 2025{" "}
        <Link
          href="https://livelearninglabs.ch/"
          target="_blank"
          className="hover:text-foreground/60"
        >
          LINDEN 3L AG
        </Link>
        {" | "}
        <Link
          href="https://livelearninglabs.ch/impressum/"
          target="_blank"
          className="hover:text-foreground/60"
        >
          Impressum
        </Link>
      </div>
    </div>
  );
}

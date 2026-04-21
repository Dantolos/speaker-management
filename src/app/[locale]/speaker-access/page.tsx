import { authSpeaker } from "./actions";
import Link from "next/link";
import { directus } from "@/services/directus";
import { readItems } from "@directus/sdk";
import { getSpeaker } from "@/services/airtable";

interface Props {
  searchParams: Promise<{ redirect?: string; error?: string }>;
}

export default async function SpeakerAccess({ searchParams }: Props) {
  const { redirect: redirectParam, error } = await searchParams;

  // Theme laden basierend auf Speaker-ID im Redirect
  const speakerId = redirectParam?.match(/\/speaker\/([^/]+)/)?.[1];

  type ThemeShape = {
    primary_color?: string;
    secondary_color?: string;
    background?: string;
    foreground?: string;
  };

  let theme: ThemeShape | null = null;

  if (speakerId) {
    try {
      const speaker = await getSpeaker(speakerId);
      const eventAirtableId = speaker?.Event?.id;
      if (eventAirtableId) {
        const events = await directus.request(
          readItems("events", {
            filter: { airtable_id: { _eq: eventAirtableId } },
            fields: [{ theme: ["*"] }], // ← geändert
            limit: 1,
          }),
        );
        theme = events[0]?.theme ?? null;
      }
    } catch {
      // Theme nicht gefunden – Fallback auf Default
    }
  }

  return (
    <>
      {theme && (
        <script
          dangerouslySetInnerHTML={{
            __html: `
          (function() {
            const root = document.documentElement;
            ${theme.primary_color ? `root.style.setProperty('--color-primary', '${theme.primary_color}');` : ""}
            ${theme.secondary_color ? `root.style.setProperty('--color-secondary', '${theme.secondary_color}');` : ""}
            ${theme.background ? `root.style.setProperty('--color-background', '${theme.background}');` : ""}
            ${theme.foreground ? `root.style.setProperty('--color-foreground', '${theme.foreground}');` : ""}
            ${theme.foreground ? `root.style.setProperty('--color-background-dark', '${theme.foreground}');` : ""}
            ${theme.background ? `root.style.setProperty('--color-foreground-dark', '${theme.background}');` : ""}
          })();
        `,
          }}
        />
      )}

      <div className="bg-primary/10 w-screen h-screen absolute px-4 flex justify-center items-center">
        <div className="max-w-md w-full mx-auto bg-background shadow-2xl rounded-3xl pt-10 pb-8 px-4">
          <div className="flex flex-col gap-4 mb-6 px-2">
            <h2 className="text-3xl text-center text-primary">
              Speaker Access
            </h2>
            <p className="text-center text-foreground/50">
              Bitte gib dein Event-Passwort ein
            </p>
          </div>

          {error && (
            <p className="text-center text-sm text-secondary mb-4">
              Falsches Passwort.
            </p>
          )}

          <form action={authSpeaker} className="flex flex-col gap-3 px-2">
            <input type="hidden" name="redirect" value={redirectParam || "/"} />
            <label className="flex flex-col gap-1">
              <span className="text-sm text-foreground/50">Passwort</span>
              <input
                type="password"
                name="password"
                required
                autoFocus
                className="p-4 bg-primary/10 border-2 border-primary/20 rounded-2xl focus:outline-none focus:border-primary"
              />
            </label>
            <button
              type="submit"
              className="w-full py-4 bg-primary text-white rounded-xl hover:bg-secondary transition-colors cursor-pointer mt-2"
            >
              Zugang
            </button>
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
        </div>
      </div>
    </>
  );
}

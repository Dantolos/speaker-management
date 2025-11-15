import { auth, authTeam } from "./actions";
import { getTranslations } from "next-intl/server";
import Link from "next/link";

interface Props {
  searchParams: Promise<{ redirect?: string; type?: string }>;
  params: Promise<{ locale: string }>;
}

export default async function SignIn({ searchParams, params }: Props) {
  //const session = await getSession();
  const { redirect: redirectParam, type: sessionType } = await searchParams;
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "SignIn" });

  // if (session.isAuthenticated) {
  //   redirect(redirectParam || "/");
  // }
  console.log(sessionType);

  return (
    <div className="bg-gray-600 w-[100vw] h-[100vh] absolute px-2">
      <div className="max-w-md mx-auto mt-10   bg-white shadow-2xl rounded-3xl pt-10 pb-4 px-4">
        <div className="flex flex-col gap-4 mb-4 px-2">
          <h2 className="text-4xl text-center text-gray-700 font-bold">
            {t("title")}
          </h2>
          <p className="text-center text-gray-700">{t("description")}</p>
        </div>
        <form
          action={sessionType && sessionType === "team" ? authTeam : auth}
          className="rounded-3xl bg-white"
        >
          <input
            type="hidden"
            name="redirect"
            defaultValue={redirectParam || "/"}
          />
          <label className="block mb-4">
            <p className="text-center text-gray-500 font-bold">
              {t("password")}
            </p>
            <input
              type="password"
              name="password"
              required
              autoFocus
              className="block w-full mt-1 p-4 bg-gray-200 rounded-2xl"
            />
          </label>
          <button
            type="submit"
            className="w-full py-4 bg-gray-800 text-white rounded-xl hover:bg-gray-700 cursor-pointer"
          >
            Sign In
          </button>
        </form>
      </div>
      <div className="w-full text-center text-gray-900 bottom-3 absolute text-xs">
        © 2025{" "}
        <Link
          href="https://livelearninglabs.ch/"
          target="_blank"
          className="hover:text-gray-300"
        >
          LINDEN 3L AG
        </Link>
        {" | "}
        <Link
          href="https://livelearninglabs.ch/impressum/"
          target="_blank"
          className="hover:text-gray-300"
        >
          Impressum
        </Link>
      </div>
    </div>
  );
}

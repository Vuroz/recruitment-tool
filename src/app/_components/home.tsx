import Link from "next/link";
import type { Session } from "next-auth";

type HomeViewProps = {
    session: Session | null
}

export default async function HomeView({ session }: HomeViewProps) {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#026e6e] to-[#152a2b] text-white">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
          <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
            [company name] Recruitment
          </h1>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-8">
            <Link
              className="flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 hover:bg-white/20"
              href="/api/auth/signin"
            >
              <h3 className="text-2xl font-bold">Sign In →</h3>
              <div className="text-lg">
                If you already have an account
              </div>
            </Link>
            <Link
              className="flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 hover:bg-white/20"
              href="/register"
            >
              <h3 className="text-2xl font-bold">Start your application →</h3>
              <div className="text-lg">
                If you want to start an application, please go through here.
              </div>
            </Link>
          </div>
          {session &&
            <div className="flex flex-col items-center gap-2">
              <div className="flex flex-col items-center justify-center gap-4">
                <p className="text-center text-2xl text-white">
                  {<span>Logged in as {session.user?.name}</span>}
                </p>
                <Link
                  href="/api/auth/signout"
                  className="rounded-full bg-white/10 px-10 py-3 font-semibold no-underline transition hover:bg-white/20"
                >
                  Sign out
                </Link>
              </div>
            </div>
          }
        </div>
      </main>
    )
}
export default function ServiceUnavailablePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#026e6e] to-[#152a2b] text-white">
      <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
        <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem] text-center">
          Temporary Service Issues
        </h1>
        <p className="text-xl text-center max-w-2xl">
          We are currently experiencing technical difficulties. Please try again in a little while.
        </p>
      </div>
    </main>
  );
}
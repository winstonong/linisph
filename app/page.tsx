import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-blue-600 text-white px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">LinisPH</h1>
        <div className="flex gap-3">
          <Link
            href="/login"
            className="text-sm px-4 py-2 rounded-lg border border-white/30 hover:bg-white/10"
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="text-sm px-4 py-2 rounded-lg bg-white text-blue-600 font-semibold hover:bg-blue-50"
          >
            Sign up
          </Link>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-16 text-center">
        <h2 className="text-4xl font-extrabold text-gray-900 mb-4">
          Trusted Cleaners in Manila
        </h2>
        <p className="text-lg text-gray-600 mb-10 max-w-md">
          Book a professional cleaner for your home, condo, or office. Or earn
          money by offering your cleaning services.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm">
          <Link
            href="/signup?role=customer"
            className="flex-1 bg-blue-600 text-white text-center py-4 rounded-xl font-semibold text-lg hover:bg-blue-700 transition"
          >
            Find a Cleaner
          </Link>
          <Link
            href="/signup?role=cleaner"
            className="flex-1 bg-emerald-600 text-white text-center py-4 rounded-xl font-semibold text-lg hover:bg-emerald-700 transition"
          >
            Earn as a Cleaner
          </Link>
        </div>
      </main>

      {/* Features */}
      <section className="bg-white py-16 px-6">
        <div className="max-w-3xl mx-auto grid sm:grid-cols-3 gap-8 text-center">
          <div>
            <div className="text-3xl mb-3">🔍</div>
            <h3 className="font-bold mb-1">Browse Cleaners</h3>
            <p className="text-sm text-gray-500">
              View profiles, ratings, and hourly rates to find the right match.
            </p>
          </div>
          <div>
            <div className="text-3xl mb-3">📋</div>
            <h3 className="font-bold mb-1">Post a Job</h3>
            <p className="text-sm text-gray-500">
              Describe what you need and let cleaners come to you with bids.
            </p>
          </div>
          <div>
            <div className="text-3xl mb-3">⭐</div>
            <h3 className="font-bold mb-1">Verified Reviews</h3>
            <p className="text-sm text-gray-500">
              Only real customers can leave reviews after a completed service.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center text-sm text-gray-400 py-6">
        LinisPH &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
}

import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Upgrade Required" };

export default function SubscribePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] px-4">
      <div className="w-full max-w-sm text-center">
        <div className="inline-flex items-center gap-2 mb-8">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">AE</span>
          </div>
          <span className="text-white font-semibold text-lg">Aussie Estimator</span>
        </div>

        <div className="bg-[#111] border border-[#2a2a2a] rounded-xl p-8">
          <div className="w-12 h-12 bg-amber-900/30 rounded-full flex items-center justify-center mx-auto mb-5">
            <svg className="w-6 h-6 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>

          <h1 className="text-white text-lg font-semibold mb-2">Free trial complete</h1>
          <p className="text-zinc-400 text-sm mb-6 leading-relaxed">
            Your access key has been used 3 times. Subscribe to continue creating estimates with Aussie Estimator.
          </p>

          <a
            href="mailto:ipaliboboma@gmail.com?subject=Aussie%20Estimator%20%E2%80%94%20Subscription%20Request"
            className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition-colors text-sm text-center"
          >
            Contact us to subscribe
          </a>

          <div className="mt-4 pt-4 border-t border-[#2a2a2a]">
            <div className="flex justify-center gap-6 text-xs text-zinc-600">
              <span>✓ Unlimited estimates</span>
              <span>✓ Full BoQ export</span>
              <span>✓ Priority support</span>
            </div>
          </div>
        </div>

        <Link href="/login" className="inline-block mt-6 text-zinc-600 text-xs hover:text-zinc-400 transition-colors">
          ← Back to login
        </Link>
      </div>
    </div>
  );
}

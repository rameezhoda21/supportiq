import Link from 'next/link';
import { CheckCircle2, Sparkles } from 'lucide-react';

const plans = [
  {
    name: 'Starter',
    price: '$19',
    description: 'For solo shops validating AI support.',
    features: ['1 business workspace', '50 documents', '1,000 chats/month', 'Email support'],
  },
  {
    name: 'Growth',
    price: '$49',
    description: 'For growing teams with more customer volume.',
    features: ['3 business workspaces', '250 documents', '10,000 chats/month', 'Priority support'],
    highlighted: true,
  },
  {
    name: 'Scale',
    price: '$149',
    description: 'For brands that need higher limits and oversight.',
    features: ['10 business workspaces', 'Unlimited documents', '50,000 chats/month', 'Admin reporting'],
  },
];

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-gray-950 text-white">
            <Sparkles className="h-6 w-6" aria-hidden="true" />
          </div>
          <h1 className="mt-6 text-4xl font-semibold text-gray-950">Choose your SupportIQ plan</h1>
          <p className="mt-4 text-base leading-7 text-gray-600">
            Start with the plan that matches your support volume. Billing checkout can be connected next with Stripe.
          </p>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {plans.map(plan => (
            <div
              key={plan.name}
              className={`rounded-lg border bg-white p-6 shadow-sm ${
                plan.highlighted ? 'border-gray-950 ring-2 ring-gray-950' : 'border-gray-200'
              }`}
            >
              {plan.highlighted && (
                <span className="inline-flex rounded-full bg-gray-950 px-3 py-1 text-xs font-medium text-white">Most popular</span>
              )}
              <h2 className="mt-5 text-xl font-semibold text-gray-950">{plan.name}</h2>
              <p className="mt-2 text-sm text-gray-500">{plan.description}</p>
              <div className="mt-6 flex items-end gap-1">
                <span className="text-4xl font-semibold text-gray-950">{plan.price}</span>
                <span className="pb-1 text-sm text-gray-500">/month</span>
              </div>
              <ul className="mt-6 space-y-3">
                {plan.features.map(feature => (
                  <li key={feature} className="flex items-start gap-2 text-sm text-gray-700">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-hidden="true" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Link
                href="/register"
                className={`mt-8 inline-flex w-full justify-center rounded-lg px-4 py-2.5 text-sm font-medium shadow-sm ${
                  plan.highlighted
                    ? 'bg-gray-950 text-white hover:bg-gray-800'
                    : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Get started
              </Link>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

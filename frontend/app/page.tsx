import Link from 'next/link';
import { CheckCircle2, FileText, MessageSquareText, ShieldCheck } from 'lucide-react';

const plans = [
  { name: 'Starter', price: '$19', note: '1 workspace, 1,000 chats/month' },
  { name: 'Growth', price: '$49', note: '3 workspaces, 10,000 chats/month' },
  { name: 'Scale', price: '$149', note: '10 workspaces, admin reporting' },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <section className="mx-auto grid max-w-7xl gap-10 px-6 py-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">AI support for growing businesses</p>
          <h1 className="mt-4 text-5xl font-bold tracking-normal text-gray-950">SupportIQ answers customers from your own documents</h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-gray-600">
            Upload policies, FAQs, product notes, and guides. SupportIQ turns them into a customer-facing chatbot with sources, logs, and admin oversight.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/register" className="rounded-lg bg-gray-950 px-6 py-3 text-sm font-medium text-white shadow-sm hover:bg-gray-800">Get Started</Link>
            <Link href="/pricing" className="rounded-lg border border-gray-300 bg-white px-6 py-3 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50">View Plans</Link>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-950">What you get</h2>
          <div className="mt-5 space-y-4">
            {[
              { icon: FileText, title: 'Document knowledge base', text: 'Upload PDFs and TXT files that power grounded answers.' },
              { icon: MessageSquareText, title: 'Customer chatbot', text: 'Share a public chat link and review conversation history.' },
              { icon: ShieldCheck, title: 'Admin visibility', text: 'Monitor registered businesses, documents, and chat volume.' },
            ].map(item => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="flex gap-3 rounded-lg border border-gray-200 p-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-950">{item.title}</p>
                    <p className="mt-1 text-sm text-gray-500">{item.text}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-t border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-14">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">Subscription plans</p>
              <h2 className="mt-2 text-3xl font-semibold text-gray-950">Pick a plan that fits your support volume</h2>
            </div>
            <Link href="/pricing" className="text-sm font-medium text-blue-700 hover:text-blue-800">Compare all plans</Link>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {plans.map(plan => (
              <div key={plan.name} className="rounded-lg border border-gray-200 p-5 shadow-sm">
                <div className="flex items-center justify-between gap-4">
                  <h3 className="text-lg font-semibold text-gray-950">{plan.name}</h3>
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" aria-hidden="true" />
                </div>
                <p className="mt-4 text-3xl font-semibold text-gray-950">{plan.price}<span className="text-sm font-normal text-gray-500">/month</span></p>
                <p className="mt-2 text-sm text-gray-500">{plan.note}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

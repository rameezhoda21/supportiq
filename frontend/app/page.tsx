export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-50">
      <h1 className="text-5xl font-bold text-gray-900 mb-6">Welcome to SupportIQ</h1>
      <p className="text-xl text-gray-600 max-w-2xl text-center mb-8">
        The ultimate AI customer support chatbot platform for small businesses.
        Upload your existing documents and let our AI handle the rest.
      </p>
      <div className="flex gap-4">
        <a href="/register" className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700">Get Started</a>
        <a href="/login" className="bg-white text-blue-600 border border-blue-600 px-6 py-3 rounded-lg font-medium hover:bg-gray-50">Login</a>
      </div>
    </main>
  )
}

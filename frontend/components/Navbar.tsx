import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center font-bold text-xl text-blue-600">
              SupportIQ
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/pricing" className="text-gray-600 hover:text-gray-900">Pricing</Link>
            <Link href="/admin" className="text-gray-600 hover:text-gray-900">Admin</Link>
            <Link href="/login" className="text-gray-600 hover:text-gray-900">Login</Link>
            <Link href="/register" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">Register</Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

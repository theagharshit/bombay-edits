import { requireAdmin } from '@/lib/admin/auth';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Currencies | Admin' };

export default async function CurrenciesPage() {
  await requireAdmin();

  const SUPPORTED = [
    { code: 'NPR', name: 'Nepalese Rupee', symbol: 'Rs.', primary: true },
    { code: 'INR', name: 'Indian Rupee', symbol: '₹', primary: false },
    { code: 'USD', name: 'US Dollar', symbol: '$', primary: false },
  ];

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto pb-32">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold">Currencies</h1>
        <p className="text-sm text-gray-500 mt-1">
          The store operates in integer minor units. All prices are stored as paisa/cents, never
          floats.
        </p>
      </div>

      <div className="bg-white border rounded-lg shadow-sm overflow-hidden mb-6">
        <div className="px-5 py-4 border-b bg-gray-50">
          <h2 className="font-semibold">Supported Currencies</h2>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left py-3 px-5 font-medium text-gray-500">Code</th>
              <th className="text-left py-3 px-5 font-medium text-gray-500">Name</th>
              <th className="text-left py-3 px-5 font-medium text-gray-500">Symbol</th>
              <th className="text-center py-3 px-5 font-medium text-gray-500">Role</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {SUPPORTED.map((c) => (
              <tr key={c.code} className="hover:bg-gray-50">
                <td className="py-3 px-5 font-mono font-semibold">{c.code}</td>
                <td className="py-3 px-5">{c.name}</td>
                <td className="py-3 px-5">{c.symbol}</td>
                <td className="py-3 px-5 text-center">
                  {c.primary ? (
                    <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-[10px] font-semibold uppercase tracking-wider">
                      Primary
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full text-[10px] font-semibold uppercase tracking-wider">
                      Supported
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-5 text-sm text-blue-800">
        <strong>Note:</strong> Currency conversion rates are not managed here. All prices in the
        database are stored in their respective currency's minor units (e.g., NPR paisa, USD cents).
        Changing the primary currency requires a database migration. Contact your developer.
      </div>
    </div>
  );
}

interface Invoice {
  id: string;
  category: string;
  price: string;
  status: 'Paid' | 'Out of date' | 'Progress';
}

const invoices: Invoice[] = [
  { id: 'INV-1990', category: 'Android', price: '$83.74', status: 'Paid' },
  { id: 'INV-1991', category: 'Mac', price: '$97.14', status: 'Out of date' },
  { id: 'INV-1992', category: 'Windows', price: '$68.71', status: 'Progress' },
  { id: 'INV-1993', category: 'Android', price: '$85.21', status: 'Paid' },
  { id: 'INV-1994', category: 'Mac', price: '$52.17', status: 'Paid' }
];

function getStatusColor(status: Invoice['status']) {
  switch (status) {
    case 'Paid':
      return 'bg-emerald-50 text-emerald-600';
    case 'Out of date':
      return 'bg-red-50 text-red-600';
    case 'Progress':
      return 'bg-amber-50 text-amber-600';
    default:
      return '';
  }
}

export default function InvoiceTable() {
  return (
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <h3 className="text-gray-700 font-semibold mb-6">New invoice</h3>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left bg-gray-50">
              <th className="px-4 py-3 text-sm font-medium text-gray-500">Invoice ID</th>
              <th className="px-4 py-3 text-sm font-medium text-gray-500">Category</th>
              <th className="px-4 py-3 text-sm font-medium text-gray-500">Price</th>
              <th className="px-4 py-3 text-sm font-medium text-gray-500">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {invoices.map((invoice) => (
              <tr key={invoice.id}>
                <td className="px-4 py-3 text-sm text-gray-700">{invoice.id}</td>
                <td className="px-4 py-3 text-sm text-gray-700">{invoice.category}</td>
                <td className="px-4 py-3 text-sm text-gray-700">{invoice.price}</td>
                <td className="px-4 py-3">
                  <span className={`inline-block px-2 py-1 text-xs rounded-full ${getStatusColor(invoice.status)}`}>
                    {invoice.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 flex justify-end">
        <div className="flex gap-2">
          <button className="px-3 py-1 text-sm font-medium text-gray-600 hover:text-gray-800">
            Top 7 days
          </button>
          <button className="px-3 py-1 text-sm font-medium text-gray-600 hover:text-gray-800">
            Top 30 days
          </button>
          <button className="px-3 py-1 text-sm font-medium text-gray-600 hover:text-gray-800">
            All times
          </button>
        </div>
      </div>
    </div>
  );
} 
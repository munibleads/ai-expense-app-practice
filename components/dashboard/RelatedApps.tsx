import Image from 'next/image';

interface RelatedApp {
  name: string;
  logo: string;
  type: string;
  rating: string;
  size: string;
  downloads: string;
  price?: string;
}

const apps: RelatedApp[] = [
  {
    name: 'Microsoft office 365',
    logo: '/app-logos/office365.png',
    type: 'Free',
    rating: '9.9k',
    size: '9.68 Mb',
    downloads: '9.9k'
  },
  {
    name: 'Opera',
    logo: '/app-logos/opera.png',
    type: 'Free',
    rating: '1.95k',
    size: '19 Mb',
    downloads: '1.95k'
  },
  {
    name: 'Adobe acrobat reader DC',
    logo: '/app-logos/adobe.png',
    type: 'Free',
    rating: '9.1k',
    size: '8.91 Mb',
    downloads: '9.1k',
    price: '$68.71'
  },
  {
    name: 'Joplin',
    logo: '/app-logos/joplin.png',
    type: 'Free',
    rating: '6.98k',
    size: '6.62 Mb',
    downloads: '6.98k'
  },
  {
    name: 'Topaz photo AI',
    logo: '/app-logos/topaz.png',
    type: 'Free',
    rating: '8.45k',
    size: '8.29 Mb',
    downloads: '8.45k',
    price: '$52.17'
  }
];

export default function RelatedApps() {
  return (
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <h3 className="text-gray-700 font-semibold mb-6">Related applications</h3>

      <div className="space-y-4">
        {apps.map((app) => (
          <div key={app.name} className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                <Image src={app.logo} alt={app.name} width={24} height={24} />
              </div>
              <div>
                <h4 className="text-sm font-medium flex items-center">
                  {app.name}
                  <span className="ml-2 text-xs text-gray-500">{app.type}</span>
                  {app.price && (
                    <span className="ml-2 text-xs text-emerald-600">{app.price}</span>
                  )}
                </h4>
                <div className="flex items-center space-x-4 text-xs text-gray-500">
                  <span>⭐ {app.rating}</span>
                  <span>💾 {app.size}</span>
                  <span>⬇️ {app.downloads}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button className="mt-6 text-sm text-blue-600 hover:text-blue-800">
        View all →
      </button>
    </div>
  );
} 
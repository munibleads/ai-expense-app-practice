import Image from 'next/image';

interface Country {
  name: string;
  flag: string;
  downloads: string;
  users: string;
}

const countries: Country[] = [
  {
    name: 'Germany',
    flag: '/flags/de.svg',
    downloads: '9.91k',
    users: '1.95k'
  },
  {
    name: 'England',
    flag: '/flags/gb.svg',
    downloads: '1.95k',
    users: '9.12k'
  },
  {
    name: 'France',
    flag: '/flags/fr.svg',
    downloads: '9.12k',
    users: '6.98k'
  },
  {
    name: 'Korean',
    flag: '/flags/kr.svg',
    downloads: '6.98k',
    users: '8.49k'
  },
  {
    name: 'USA',
    flag: '/flags/us.svg',
    downloads: '8.49k',
    users: '2.03k'
  }
];

export default function TopCountries() {
  return (
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <h3 className="text-gray-700 font-semibold mb-6">Top installed countries</h3>

      <div className="space-y-4">
        {countries.map((country) => (
          <div key={country.name} className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Image
                src={country.flag}
                alt={country.name}
                width={24}
                height={24}
                className="rounded-full"
              />
              <span className="text-sm font-medium">{country.name}</span>
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <span>⬇️ {country.downloads}</span>
              <span>👥 {country.users}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 
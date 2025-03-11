import Image from 'next/image';

interface Author {
  name: string;
  avatar: string;
  rating: string;
  isTrophy?: boolean;
}

const authors: Author[] = [
  {
    name: 'Jayvion Simon',
    avatar: '/avatars/avatar1.jpg',
    rating: '9.91k',
    isTrophy: true
  },
  {
    name: 'Deja Brady',
    avatar: '/avatars/avatar2.jpg',
    rating: '9.12k',
    isTrophy: true
  },
  {
    name: 'Lucian Obrien',
    avatar: '/avatars/avatar3.jpg',
    rating: '1.95k',
    isTrophy: true
  }
];

export default function TopAuthors() {
  return (
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <h3 className="text-gray-700 font-semibold mb-6">Top authors</h3>

      <div className="space-y-4">
        {authors.map((author) => (
          <div key={author.name} className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Image
                src={author.avatar}
                alt={author.name}
                width={40}
                height={40}
                className="rounded-full"
              />
              <div>
                <h4 className="text-sm font-medium">{author.name}</h4>
                <p className="text-xs text-gray-500">⭐ {author.rating}</p>
              </div>
            </div>
            {author.isTrophy && (
              <span className="text-xl">🏆</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
} 
interface ApplicationsCardProps {
  value: number;
  percentage: number;
}

export default function ApplicationsCard({ value, percentage }: ApplicationsCardProps) {
  return (
    <div className="bg-blue-700 rounded-lg p-6 text-white">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Applications</h3>
          <p className="text-3xl font-bold mt-2">{value.toLocaleString()}</p>
        </div>
        <div className="relative w-16 h-16">
          <svg className="w-full h-full" viewBox="0 0 36 36">
            <path
              d="M18 2.0845
                a 15.9155 15.9155 0 0 1 0 31.831
                a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="rgba(255, 255, 255, 0.2)"
              strokeWidth="3"
            />
            <path
              d="M18 2.0845
                a 15.9155 15.9155 0 0 1 0 31.831
                a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="#fff"
              strokeWidth="3"
              strokeDasharray={`${percentage}, 100`}
            />
            <text
              x="18"
              y="20.35"
              className="text-[0.5em]"
              textAnchor="middle"
              fill="white"
            >
              {percentage}%
            </text>
          </svg>
        </div>
      </div>
    </div>
  );
} 
export default function PhysioSection({ data }) {
  return (
    <div>
      <h2 className="text-sm font-bold text-gray-400 uppercase mb-3">
        Recovery Plan
      </h2>

      <div className="space-y-3">
        {data.map((ex) => (
          <div
            key={ex.id}
            className="flex items-center gap-4 p-5 bg-white rounded-[24px] border border-gray-100"
          >
            <div className="text-2xl">{ex.icon}</div>

            <div className="flex-1">
              <div className="font-bold">{ex.name}</div>
              <div className="text-[10px] text-gray-400 uppercase">
                {ex.sets} sets • {ex.target}
              </div>
            </div>

            {ex.completed && <span className="text-green-500 font-bold">✓</span>}
          </div>
        ))}
      </div>
    </div>
  );
}
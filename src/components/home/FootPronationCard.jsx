export default function FootPronationCard({ data }) {
  const isOver = data.pronationLeft > 8;

  return (
    <div className="bg-white border border-gray-100 rounded-[32px] p-6 shadow-sm">

      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h4 className="font-bold text-gray-800">Foot Pronation</h4>
          <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">
            Dynamic Eversion Angle
          </p>
        </div>

        <div className={`text-xs font-bold ${isOver ? "text-orange-500" : "text-green-600"}`}>
          {isOver ? "Overpronating" : "Neutral"}
        </div>
      </div>

      {/* Feet */}
      <div className="flex justify-center gap-10 mb-5">

        {/* Left */}
        <div className="text-center">
          <div className="w-12 h-16 bg-gray-50 border-b-4 border-blue-600 rounded-lg flex items-center justify-center">
            <span
              className="font-bold text-blue-600"
              style={{ transform: `rotate(${data.pronationLeft}deg)` }}
            >
              L
            </span>
          </div>
          <div className="text-xs font-bold mt-2">{data.pronationLeft}°</div>
          <div className="text-[9px] text-gray-400 uppercase">Operated</div>
        </div>

        {/* Right */}
        <div className="text-center">
          <div className="w-12 h-16 bg-gray-50 border-b-4 border-gray-300 rounded-lg flex items-center justify-center">
            <span
              className="font-bold text-gray-400"
              style={{ transform: `rotate(${data.pronationRight}deg)` }}
            >
              R
            </span>
          </div>
          <div className="text-xs font-bold mt-2">{data.pronationRight}°</div>
          <div className="text-[9px] text-gray-400 uppercase">Healthy</div>
        </div>
      </div>

      {/* Scale */}
      <div className="h-2 bg-gray-100 rounded-full relative">
        <div
          className="absolute w-3 h-3 bg-blue-600 rounded-full border-2 border-white top-1/2 -translate-y-1/2"
          style={{ left: `${(data.pronationLeft / 15) * 100}%` }}
        />
      </div>

    </div>
  );
}
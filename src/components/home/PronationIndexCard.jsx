function PronationIndexCard({ data }) {
  return (
    <div className="bg-white border border-gray-100 rounded-[32px] p-6 shadow-sm">

      <div className="flex justify-between items-start mb-4">
        <div>
          <h4 className="font-bold text-gray-800">Pronation Index</h4>
          <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">
            Medial vs Lateral Load
          </p>
        </div>
        <div className="text-2xl font-black text-blue-600">
          {data.pronationIndex}%
        </div>
      </div>

      {/* Gauge */}
      <div className="h-3 flex rounded-full overflow-hidden bg-gray-100 mb-4">
        <div className="w-[20%] bg-yellow-400 opacity-40" />
        <div className="w-[40%] bg-green-500 opacity-40" />
        <div className="flex-1 bg-red-500 opacity-40" />
      </div>

      {/* Indicator */}
      <div
        className="w-3 h-3 bg-black rounded-full relative"
        style={{ left: `${data.pronationIndex * 3}%` }}
      />

    </div>
  );
}

export default PronationIndexCard;
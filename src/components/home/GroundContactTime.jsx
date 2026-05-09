function GroundContactTimeCard({ data }) {
  const gap = data.left - data.right;
  const isHigh = data.left > 750;

  return (
    <div className="bg-white border border-gray-100 rounded-[32px] p-6 shadow-sm">

      <div className="flex justify-between items-start mb-6">
        <div>
          <h4 className="font-bold text-gray-800">Ground Contact Time</h4>
          <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">
            Heel Strike → Toe Off
          </p>
        </div>
        <div className="text-[10px] font-black text-blue-600">
          BIOMECHANICS
        </div>
      </div>

      <div className="flex justify-between items-center mb-6">

        {/* Left */}
        <div className="flex-1">
          <div className="text-[10px] text-blue-600 font-bold uppercase">Left</div>
          <div className="text-2xl font-black">{data.left} ms</div>
        </div>

        {/* Gap */}
        <div className="px-3 text-center">
          <div className="text-xs font-black text-red-500">+{gap}ms</div>
          <div className="text-[8px] text-gray-400">Gap</div>
        </div>

        {/* Right */}
        <div className="flex-1 text-right">
          <div className="text-[10px] text-gray-400 font-bold uppercase">Right</div>
          <div className="text-2xl font-black">{data.right} ms</div>
        </div>
      </div>

      <div className={`p-3 rounded-2xl ${isHigh ? "bg-orange-50" : "bg-green-50"}`}>
        <div className={`font-bold text-sm ${isHigh ? "text-orange-700" : "text-green-700"}`}>
          {isHigh ? "Hesitation Detected" : "Efficient Loading"}
        </div>
      </div>

    </div>
  );
}

export default GroundContactTimeCard;
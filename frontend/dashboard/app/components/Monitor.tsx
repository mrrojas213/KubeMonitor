import React from "react";

const Monitor = () => {
  return (
    <div className="w-[98%] h-[400px] bg-white drop-shadow-sm mt-10 rounded-xl border border-gray-300 py-3 px-7">
      <div className="flex items-center justify-between">
        <div>
          <h1>CPU Usage</h1>
          <p>Last 60 minutes </p>
        </div>
        <span className="text-black font-medium">42%</span>
      </div>
    </div>
  );
};

export default Monitor;

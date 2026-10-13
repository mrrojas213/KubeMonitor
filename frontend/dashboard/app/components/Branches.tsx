import React from "react";
import { MdOutlineCheckCircle } from "react-icons/md";

const Branches = () => {
  return (
    <div className="w-[98%] h-[300px] bg-white drop-shadow-sm mt-10 rounded-xl border border-gray-300 py-3 px-7">
      <div className="flex items-center justify-between">
        <h1>Latest CI/CD run</h1>
        <div className="flex items-center gap-2 rounded-full px-2 py-1 bg-green-100 text-main w-fit">
          <div className="flex items-center gap-2">
            <MdOutlineCheckCircle />
            <span>Passed</span>
          </div>
        </div>
      </div>

      <h2>Improve health endpoint</h2>
    </div>
  );
};

export default Branches;

import React from "react";
import { BiCube } from "react-icons/bi";

const Pods = () => {
  return (
    <div className="w-[98%] h-100 bg-white drop-shadow-sm mt-10 rounded-xl border border-gray-300 py-3 px-7">
      <div className="flex items-center justify-between">
        <h1>Running Pods</h1>
        <div className="flex items-center gap-2 rounded-full px-2 py-1 bg-green-100 text-main w-fit">
          <div className="w-2 h-2 rounded-full bg-main"></div>
          <p>4 running</p>
        </div>
      </div>

      <ul className="flex items-center mt-5">
        <li className="basis-7/15">Pod name</li>
        <li className="basis-4/15">Status</li>
        <li className="basis-2/15">CPU</li>
        <li className="basis-2/15">Age</li>
      </ul>
    </div>
  );
};

export default Pods;

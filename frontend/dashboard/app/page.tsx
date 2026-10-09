import Image from "next/image";
import { MdOutlineDashboard } from "react-icons/md";
import { LiaCubesSolid } from "react-icons/lia";
import { MdOutlineMonitorHeart } from "react-icons/md";
import { FaCodeBranch } from "react-icons/fa";
import { IoRocketOutline } from "react-icons/io5";
import { FaRegFileLines } from "react-icons/fa6";
import { BsCpu } from "react-icons/bs";
import { RiFlashlightLine } from "react-icons/ri";

export default function Home() {
  return (
    <div className="flex-center bg-gray-200 h-full w-full ">
      <div className="w-[900px] h-300 rounded-3xl bg-[#F3F6F8] mt-10 border border-gray-300 shadow-lg">
        <div className=" w-full h-[250px] bg-[#0D1D24] rounded-t-3xl">
          <div className="flex items-center gap-3 ml-10 mb-5 pt-10">
            <div className="flex-center w-[40px] h-[40px] rounded-xl bg-white">
              <Image
                src="/logo.png"
                width={1200}
                height={1200}
                alt="logo"
                className="w-[90%] h-[90%] drop-shadow-3xl"
              />
            </div>
            <span className="text-indigo-50 text-xl font-medium">
              KubeMonitor
            </span>
          </div>
          <div className="flex flex-wrap gap-2 ml-10 ">
            <a href="" className="flex items-center gap-2">
              <MdOutlineDashboard />
              <span>Overview</span>
            </a>
            <a href="" className="flex items-center gap-2">
              <LiaCubesSolid />
              <span>Pods</span>
            </a>
            <a href="" className="flex items-center gap-2">
              <MdOutlineMonitorHeart />
              <span>Monitoring</span>
            </a>
            <a href="" className="flex items-center gap-2">
              <FaCodeBranch />
              <span>CI/CD</span>
            </a>
            <a href="" className="flex items-center gap-2">
              <IoRocketOutline />
              <span>Deployments</span>
            </a>
            <a href="" className="flex items-center gap-2">
              <FaRegFileLines />
              <span>Events</span>
            </a>
          </div>
        </div>

        <div className="w-[90%] m-auto mt-5">

          <div className="flex items-center gap-5">
            <div>
              <div className="flex items-center gap-5  basis-1/2">
                <h1>Overview</h1>
                <div className="flex items-center gap-2 rounded-full px-2 py-1 bg-amber-200 w-fit">
                  <div className="w-2 h-2 rounded-full bg-amber-400 "></div>
                  <p>gvbnmgvbhnjm,kmjnbvc</p>
                </div>
              </div>
              <p>Live health and deployment status for your EKS application.</p>
            </div>
            <div className="flex basis-1/2 gap-4 ">
              <button className="text-[18px] flex items-center gap-2 w-fit text-white font-medium cursor-pointer bg-main transition-all duration-300 ease-in-out hover:bg-secondary py-3 px-3 rounded-xl">
                <BsCpu/>
                <span>CPU Spike</span>
              </button>
              <button className="text-[18px] flex items-center gap-2 w-fit text-white font-medium cursor-pointer bg-main transition-all duration-300 ease-in-out hover:bg-secondary py-3 px-3 rounded-xl">
                <RiFlashlightLine/>
                <span>Pod crashes</span>
              </button>
            </div>

            <div className="flex items-center gap-5">

            </div>

          </div>



        </div>
      </div>
    </div>
  );
}

import Image from "next/image";
import { MdOutlineDashboard } from "react-icons/md";
import { LiaCubesSolid } from "react-icons/lia";
import { MdOutlineMonitorHeart } from "react-icons/md";
import { FaCodeBranch } from "react-icons/fa";
import { IoRocketOutline } from "react-icons/io5";
import { FaRegFileLines } from "react-icons/fa6";
import { BsCpu } from "react-icons/bs";
import { RiFlashlightLine } from "react-icons/ri";

import { LuShieldCheck } from "react-icons/lu";
import { LuShieldAlert } from "react-icons/lu";

import { TbServer } from "react-icons/tb";
import { BiCube } from "react-icons/bi";
import { RiNetworkLine } from "react-icons/ri";

import { MdOutlineCheckCircle } from "react-icons/md";

import OverviewCard from "./components/OverviewCard";
import Monitor from "./components/Monitor";
import Pods from "./components/Pods";
import Branches from "./components/Branches";
import Events from "./components/Events";

export default function Home() {
  return (
    <div className="flex-center bg-gray-200 h-full ">
      <div className="w-225 h-auto rounded-3xl bg-[#F3F6F8] my-10 border border-gray-300 shadow-lg">
        <div className=" w-full h-62.5 bg-[#0D1D24] rounded-t-3xl">
          <div className="flex items-center gap-3 ml-10 mb-5 pt-10">
            <div className="flex-center w-10 h-10rounded-xl bg-white">
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
              <MdOutlineMonitorHeart />
              <span>Monitoring</span>
            </a>
            <a href="" className="flex items-center gap-2">
              <LiaCubesSolid />
              <span>Pods</span>
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

        <div className="w-[90%] m-auto py-10">
          <div className="">
            <div className="flex items-center gap-5">
              <div>
                <div className="flex items-center gap-5  basis-1/2">
                  <h1>Overview</h1>
                  <div className="flex items-center gap-2 rounded-full px-2 py-1 bg-green-100 w-fit text-main">
                    <div className="w-2 h-2 rounded-full bg-green-500 "></div>
                    <p>All Systems are healthy</p>
                  </div>
                </div>
                <p>
                  Live health and deployment status for your EKS application.
                </p>
              </div>
              <div className="flex basis-1/2 gap-4 ">
                <button className="text-[18px] flex items-center gap-2 w-fit text-white font-medium cursor-pointer bg-main transition-all duration-300 ease-in-out hover:bg-secondary py-3 px-3 rounded-xl drop-shadow-lg">
                  <BsCpu />
                  <span>CPU Spike</span>
                </button>
                <button className="text-[18px] flex items-center gap-2 w-fit text-white font-medium cursor-pointer bg-main transition-all duration-300 ease-in-out hover:bg-secondary py-3 px-3 rounded-xl drop-shadow-lg">
                  <RiFlashlightLine />
                  <span>Pod crashes</span>
                </button>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-5 mt-10">
              <OverviewCard
                title="Cluster Health"
                icon={<LuShieldCheck />}
                result="Healthy"
                description="EKS control plane available"
              />
              <OverviewCard
                title="Worker Nodes"
                icon={<TbServer />}
                result="2 / 2"
                description="Nodes ready"
              />
              <OverviewCard
                title="Running Pods"
                icon={<BiCube />}
                result="4 / 4"
                description="Desired replicas available"
              />
              <OverviewCard
                title="CPU usage"
                icon={<BsCpu />}
                result="42%"
                description="Across Express.js Pods"
              />
              <OverviewCard
                title="Network traffic"
                icon={<RiNetworkLine />}
                result="12.4"
                description="MB/s inbound + outbound"
              />
              <OverviewCard
                title="Latest deployment"
                icon={<MdOutlineCheckCircle />}
                result="Successful"
                description="8 minutes ago"
              />
            </div>
            <Monitor />
            <Pods/>
            <Branches/>
            <Events/>
          </div>
        </div>
      </div>
    </div>
  );
}

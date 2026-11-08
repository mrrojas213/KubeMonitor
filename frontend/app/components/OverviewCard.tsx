
import React from "react";

interface OverviewCardProps {
  title: string;
  icon: React.ReactNode;
  result: string;
  description: string;
  status?: "blue" | "green" | "yellow" | "red" | "gray";
}

const colors = {
  blue: {
    card: "bg-blue-50 border-blue-200",
    icon: "bg-blue-100 text-blue-600",
    result: "text-blue-700",
  },
  green: {
    card: "bg-green-50 border-green-200",
    icon: "bg-green-100 text-green-600",
    result: "text-green-700",
  },
  yellow: {
    card: "bg-yellow-50 border-yellow-200",
    icon: "bg-yellow-100 text-yellow-600",
    result: "text-yellow-700",
  },
  red: {
    card: "bg-red-50 border-red-200",
    icon: "bg-red-100 text-red-600",
    result: "text-red-700",
  },
  gray: {
    card: "bg-white border-gray-300",
    icon: "bg-gray-100 text-gray-600",
    result: "text-gray-700",
  },
};

const OverviewCard = ({
  title,
  icon,
  result,
  description,
  status = "gray",
}: OverviewCardProps) => {
  const color = colors[status];



  return (
    <div
      className={`border p-3 w-[250px] h-[130px] rounded-xl
        drop-shadow-sm transition-colors duration-300 ${color.card}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-gray-700">{title}</span>

        <div
          className={`flex-center rounded-lg w-8 h-8 text-[20px]
            ${color.icon}`}
        >
          {icon}
        </div>
      </div>

      <span className={`font-semibold text-xl ${color.result}`}>
        {result}
      </span>

      <p className="text-sm mt-1 text-gray-600">
        {description}
      </p>
    </div>
  );
};

export default OverviewCard;

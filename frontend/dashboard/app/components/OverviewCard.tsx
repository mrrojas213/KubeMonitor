import React from "react";

interface OverviewCardProps {
  title: string;
  icon: React.ReactNode;
  result: string;
  description: string;
}

const OverviewCard = ({
  title,
  icon,
  result,
  description,
}: OverviewCardProps) => {
  return (
    <div className="border border-gray-300 p-3 w-[250px] h-[130px] rounded-xl bg-white drop-shadow-sm">
      <div className="flex items-center justify-between">
        <span>{title}</span>
        <div className="flex-center rounded-lg w-8 h-8">
          <span className="text-[20px] rounded-2xl">{icon}</span>
        </div>
      </div>
      <span className="text-black font-medium">{result}</span>
      <p className="text-sm mt-1">{description}</p>
    </div>
  );
};

export default OverviewCard;

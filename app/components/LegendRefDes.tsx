import React from 'react';

export interface LegendRefDesProps {
  refDes: string;
  selected: boolean;
}

export const LegendRefDes = ({
  refDes = "J1",
  selected = false,
  ...props
}: LegendRefDesProps) => {
  return (
    <div className={(selected ? "font-bold bg-yellow-500 text-black " : "font-normal bg-gray-700 text-white " ) + " text-sm rounded-full text-center w-7 h-7"}>
      <span className="inline-block py-1">{refDes}</span>
    </div>
  );
};

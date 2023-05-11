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
    <div className={(selected ? "font-semibold bg-yellow-500 text-black border-black border-2 " : "font-semibold bg-white border-black text-black border-2 " ) + " text-sm rounded-full text-center w-8 h-8"}>
      <span className="inline-block py-1">{refDes}</span>
    </div>
  );
};

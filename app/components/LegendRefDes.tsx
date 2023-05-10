import React from 'react';

export interface LegendRefDesProps {
  refDes: string;
}

export const LegendRefDes = ({
  refDes = "J1",
  ...props
}: LegendRefDesProps) => {
  return (
    <div className="bg-pink-500 text-white font-semibold text-sm rounded-full text-center w-7 h-7">
      <span className="inline-block py-1">{refDes}</span>
    </div>
  );
};

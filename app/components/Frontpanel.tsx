import React from 'react';
import './frontpanel.css';

export enum FrontpanelMaterial {
  MatteBlack = 0,
  Aluminum = 1
}

export function getMaterialGradientColorTop(material: FrontpanelMaterial) {
  switch (material) {
    case FrontpanelMaterial.Aluminum:
      return ("#D0CFCC");
    case FrontpanelMaterial.MatteBlack:
      return ("#2D2D2D");
  }
}

export function getMaterialGradientColorBottom(material: FrontpanelMaterial) {
  switch (material) {
    case FrontpanelMaterial.Aluminum:
      return ("#D2D1CE");
    case FrontpanelMaterial.MatteBlack:
      return ("#2D2D2D");
  }
}


export interface FrontpanelProps {
  hpWidth: number;
  pixelsPerHP: number;
  material: FrontpanelMaterial;
}

function renderBackground(w: number, h: number) {
  return ("M0 0h " + w + "v" + h + "h-" + w + "z ")
}

function renderMountingHole(x: number, y: number, r: number) {
  return ("M" + (x - r) + " " + (y) + "a" + r + " " + r + " 0 1 1 0 0.0001 z ");
}

export const Frontpanel = ({
  hpWidth = 8,
  pixelsPerHP = 20,
  material = FrontpanelMaterial.Aluminum,
  ...props
}: FrontpanelProps) => {
  const hpScale = 5.08; // millimeters
  const frontpanelHeight = 128.5; // millimeters
  const mountingHoleDiameter = 3; // millimeters

  const frontpanelWidth = hpWidth * hpScale;
  const mountingHoleRadius = mountingHoleDiameter / 2;
  return (
    <>
      <svg
        className="frontpanel"
        width={hpWidth * pixelsPerHP}
        height={(pixelsPerHP * 128.5) / hpScale}
        xmlns="http://www.w3.org/2000/svg"
        id="frontpanel"
        data-name="frontpanel"
        viewBox={"0 0 " + frontpanelWidth + " " + frontpanelHeight}>
        <defs>
          <linearGradient id="bg-gradient" x1="0" x2="0" y1="0" y2="1">
            <stop stop-color={getMaterialGradientColorTop(material)} offset="0%" />
            <stop stop-color={getMaterialGradientColorBottom(material)} offset="100%" />
          </linearGradient>
        </defs>
        <path id="bg" d={
          renderBackground(frontpanelWidth, frontpanelHeight) +
          renderMountingHole(1.5 * hpScale, mountingHoleDiameter, mountingHoleRadius) +
          renderMountingHole(1.5 * hpScale, frontpanelHeight - mountingHoleDiameter, mountingHoleRadius) +
          (
            Boolean(hpWidth >= 8) ? (renderMountingHole(frontpanelWidth - (1.5 * hpScale), mountingHoleDiameter, mountingHoleRadius) +
              renderMountingHole(frontpanelWidth - (1.5 * hpScale), frontpanelHeight - mountingHoleDiameter, mountingHoleRadius)) : (null)
          ) + 
          (
            Boolean(hpWidth == 52) ? (renderMountingHole(((1.5 + 16) * hpScale), mountingHoleDiameter, mountingHoleRadius) +
              renderMountingHole(((1.5 + 16) * hpScale), frontpanelHeight - mountingHoleDiameter, mountingHoleRadius) +
              renderMountingHole(frontpanelWidth - ((1.5 + 16)  * hpScale), mountingHoleDiameter, mountingHoleRadius) +
              renderMountingHole(frontpanelWidth - ((1.5 + 16)  * hpScale), frontpanelHeight - mountingHoleDiameter, mountingHoleRadius)) : (null)
          )
        }
          fill="url(#bg-gradient)"
          fill-rule="evenodd" />
      </svg>
    </>
  );
};

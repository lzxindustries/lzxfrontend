import { ModuleView } from '~/views/module';
import { LegendRefDes } from './LegendRefDes';

export function ModuleLegendPanel({
  moduleData,
  activeRefDes,
  setActiveRefDes,
  pixelsPerHP
}: {
  moduleData: ModuleView;
  activeRefDes: string;
  setActiveRefDes: Function;
  pixelsPerHP: number;
}) {
  const hpScale = 5.08; // millimeters
  const pixelsPerMm = pixelsPerHP / hpScale;
  const pixelsPerInch = pixelsPerHP * 5;
  const frontpanelHeight = 128.5 * pixelsPerMm; // millimeters
  const frontpanelWidth = moduleData.hp * pixelsPerHP;
  const xCenter = frontpanelWidth / 2;
  const yCenter = frontpanelHeight / 2;

  return (
    <div className="relative" style={{ width: frontpanelWidth, height: frontpanelHeight }}>
      <img className="" width={frontpanelWidth} height={frontpanelHeight} src={"/images/" + moduleData.legend} />
      {moduleData.connectors.map((obj) => {
        const xPos = xCenter - 28 + ((obj.x / 1000) * pixelsPerInch);
        const yPos = yCenter + ((obj.y / 1000) * pixelsPerInch);
        return <div style={{ top: yPos, left: xPos }}
          className="cursor-pointer absolute"
          onMouseEnter={() => {
            setActiveRefDes(obj.refDes)
          }}
        ><LegendRefDes selected={activeRefDes == obj.refDes ? true : false} refDes={obj.refDes} />
        </div>
      })}
      {moduleData.controls.map((obj) => {
        const xPos = xCenter - 28 + ((obj.x / 1000) * pixelsPerInch);
        const yPos = yCenter + ((obj.y / 1000) * pixelsPerInch);
        return <div style={{ top: yPos, left: xPos }}
          className="cursor-pointer absolute"
          onMouseEnter={() => {
            setActiveRefDes(obj.refDes)
          }}
        ><LegendRefDes selected={activeRefDes == obj.refDes ? true : false} refDes={obj.refDes} />
        </div>
      })}
    </div>
  )
};

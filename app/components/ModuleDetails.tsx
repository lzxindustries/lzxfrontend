import { db } from '~/lib/db'
import { Heading, Text } from './Text'
import { IconTV } from './Icon'
import {Module} from '~/lib/api.types'

export function ModuleDetails({
  moduleData
}: {
  moduleData: Module;
}) {
  var it = 0;
  var it2 = 0;
  return (
    <div>
      {/* <div className="inline-block w-full h-4"></div> */}
      <Text size="copy">{moduleData.description}</Text>
      <div className="inline-block w-full h-2"></div>
      <div className="inline-block w-full align-top">
        {moduleData.features.map((feature, it) => {
          return (
            <>
              <div className="inline-block w-full"><IconTV className="inline-block align-middle"/> <Text size="lead" className="align-middle">{feature.title}</Text></div>
              <div className="inline-block w-full"><Text size="copy" color="subtle">{feature.description}</Text></div>
              <div className="inline-block w-full h-2"></div>
            </>)
        })}
      </div>
      <div className="inline-block w-1/2 align-top">
        <Heading as="h3" format size="copy" className="uppercase">Dimensions</Heading>
        <ul>
          <li><Text size="copy" color="subtle">{'Width, ' + moduleData.dimensions?.width + moduleData.dimensions?.widthUnit}</Text></li>
          <li><Text size="copy" color="subtle">{'Mounting Depth, ' + moduleData.dimensions?.depth + moduleData.dimensions?.depthUnit}</Text></li>
        </ul>
      </div>
      <div className="inline-block w-1/2 align-top">
        <Heading as="h3" format size="copy" className="uppercase">Power Consumption</Heading>
        <ul>
          {moduleData.powerConsumption?.map((conn, it) => {
            return <li><Text size="copy" color="subtle">{conn.current + conn.currentUnit + ' @ ' + conn.voltage + conn.voltageUnit}</Text></li>
          })}
        </ul>
      </div>
      <div className="inline-block w-full h-2"></div>
      <Heading as="h3" format size="copy" className="uppercase">VIDEO SYNC</Heading>
      {/* <Text size="copy" color="subtle">{moduleData.videoSync?.length ? "" : "This module does not require any connection to your system's video sync generator."}</Text> */}
      <div className="inline-block w-full h-2"></div>
      <Heading as="h3" format size="copy" className="uppercase">Inputs & Outputs</Heading>

      {moduleData.connectors.map((conn, it) => {
        it = it + 1
        return (
          <>
            <div className="w-full inline-block">
              <div className="w-1/12 inline-block">
                <Text color="subtle">
                  J{it}
                </Text>
              </div>
              <div className="w-11/12 inline-block">
                <Text color="subtle">
                  {conn.description} {conn.direction}
                </Text>
              </div>
            </div>
          </>)
      })}
      <div className="inline-block w-full h-2"></div>
      <Heading as="h3" format size="copy" className="uppercase">Controls</Heading>

      {moduleData.controls.map((ctrl, it) => {
        it2 = it2 + 1
        return (
          <>
            <div className="w-full inline-block">
              <div className="w-1/12 inline-block">
                <Text color="subtle">
                  P{it2}
                </Text>
              </div>
              <div className="w-11/12 inline-block">
                <Text color="subtle">
                  {ctrl.description}
                </Text>
              </div>
            </div>
          </>)
      })}
      <div className="inline-block w-full h-2"></div>
    </div>
  )
};



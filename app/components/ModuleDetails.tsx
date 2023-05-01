import { db } from '~/lib/db'
import { Heading, Text } from './Text'
import { IconCheck } from './Icon'

export function ModuleDetails({
  moduleIndex
}: {
  moduleIndex: number;
}) {
  var it = 0;
  var it2 = 0;
  return (
    <div>
      {/* <div className="inline-block w-full h-4"></div> */}
      <Text size="copy">{db.modules[moduleIndex].description}</Text>
      <div className="inline-block w-full h-2"></div>
      <div className="inline-block w-full align-top">
        {db.modules[moduleIndex].features.map((feature, it) => {
          return (
            <>
              <div className="inline-block w-full h-2"><IconCheck className="inline-block align-middle" /> <Text format size="lead" className="inline-block align-middle">{feature.title}</Text></div>
              <div className="inline-block w-full h-2"><Text size="copy" color="subtle">{feature.description}</Text></div>
              <div className="inline-block w-full h-2"></div>
            </>)
        })}
      </div>
      <div className="inline-block w-1/2 align-top">
        <Heading as="h3" format size="copy" className="uppercase">Dimensions</Heading>
        <ul>
          <li><Text size="copy" color="subtle">{'Width, ' + db.modules[moduleIndex].dimensions.width + db.modules[moduleIndex].dimensions.widthUnit}</Text></li>
          <li><Text size="copy" color="subtle">{'Mounting Depth, ' + db.modules[moduleIndex].dimensions.depth + db.modules[moduleIndex].dimensions.depthUnit}</Text></li>
        </ul>
      </div>
      <div className="inline-block w-1/2 align-top">
        <Heading as="h3" format size="copy" className="uppercase">Power Consumption</Heading>
        <ul>
          {db.modules[moduleIndex].powerConsumption.map((conn, it) => {
            return <li><Text size="copy" color="subtle">{conn.current + conn.currentUnit + ' @ ' + conn.voltage + conn.voltageUnit}</Text></li>
          })}
        </ul>
      </div>
      <div className="inline-block w-full h-2"></div>
      <Heading as="h3" format size="copy" className="uppercase">VIDEO SYNC</Heading>
      <Text size="copy" color="subtle">{db.modules[moduleIndex].videoSync.length ? "" : "This module does not require any connection to your system's video sync generator."}</Text>
      <div className="inline-block w-full h-2"></div>
      <Heading as="h3" format size="copy" className="uppercase">Inputs & Outputs</Heading>

      {db.modules[moduleIndex].connectors.map((conn, it) => {
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

      {db.modules[moduleIndex].controls.map((ctrl, it) => {
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



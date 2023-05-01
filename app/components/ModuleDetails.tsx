import { db } from '~/lib/db'
import { Heading, Text } from './Text'

export function ModuleDetails({
  moduleIndex
}: {
  moduleIndex: number;
}) {
  return (
    <div>
      {/* <div className="inline-block w-full h-4"></div> */}
      <Text size="copy">{db.modules[moduleIndex].description}</Text>
      <div className="inline-block w-full h-4"></div>
      <div className="inline-block w-1/2 align-top">
        <Heading as="h3" format size="copy">Dimensions</Heading>
          <ul>
            <li><Text size="copy" color="subtle">{'Width, ' + db.modules[moduleIndex].dimensions.width + db.modules[moduleIndex].dimensions.widthUnit}</Text></li>
            <li><Text size="copy" color="subtle">{'Mounting Depth, ' + db.modules[moduleIndex].dimensions.depth + db.modules[moduleIndex].dimensions.depthUnit}</Text></li>
          </ul>
      </div>
      <div className="inline-block w-1/2 align-top">
        <Heading as="h3" format size="copy">Power Consumption</Heading>
          <ul>
          {db.modules[moduleIndex].powerConsumption.map((conn, it) => {
            return <li><Text size="copy" color="subtle">{conn.current + conn.currentUnit + ' @ ' + conn.voltage + conn.voltageUnit}</Text></li>
          })}
          </ul>
      </div>
    </div>
  )
};



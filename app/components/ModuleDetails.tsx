import { Heading, Text } from './Text'
import { ModuleView } from '~/views/module';
import { IconTV } from './Icon';

export function ModuleDetails({
  moduleData
}: {
  moduleData: ModuleView;
}) {
  var it = 0;
  var it2 = 0;

  return (
    <div>
      {/* <div className="inline-block w-full h-4"></div> */}
      <Text size="copy">{moduleData.description}</Text>
      <div className="inline-block w-full h-2"></div>
      <div className="inline-block w-full align-top">
        {moduleData.features.map((feature) => {
          return (
            <>
              <div className="inline-block w-full"><IconTV className="inline-block align-middle"/> <Text size="lead" className="align-middle">{feature.name}</Text></div>
              <div className="inline-block w-full"><Text size="copy" color="subtle">{feature.description}</Text></div>
              <div className="inline-block w-full h-2"></div>
            </>)
        })}
      </div>
      <div className="inline-block w-1/2 align-top">
        <Heading as="h3" format size="copy" className="uppercase">Dimensions</Heading>
        <ul>
          <li><Text size="copy" color="subtle">{'Width, ' + moduleData.hp + 'HP'}</Text></li>
          <li><Text size="copy" color="subtle">{'Mounting Depth, ' + moduleData.mounting_depth_mm + 'mm'}</Text></li>
        </ul>

        <div className="inline-block w-full h-2"></div>
        <Heading as="h3" format size="copy" className="uppercase">Video Sync</Heading>
        <ul>
          {moduleData.has_rear_video_sync_input == true ?
            <li><Text size="copy" color="subtle">Rear RCA Sync Input Jack</Text></li> : ''
          }
          {moduleData.has_rear_video_sync_output == true ?
            <li><Text size="copy" color="subtle">Rear RCA Sync Output Jack</Text></li> : ''
          }
          {moduleData.has_front_video_sync_input == true ?
            <li><Text size="copy" color="subtle">Front RCA Sync Input Jack</Text></li> : ''
          }
          {moduleData.has_front_video_sync_output == true ?
            <li><Text size="copy" color="subtle">Front RCA Sync Output Jack</Text></li> : ''
          }
          {moduleData.has_eurorack_power_sync_input == true ?
            <li><Text size="copy" color="subtle">Rear EuroRack Power Header Sync Input (CV/Gate Bus)</Text></li> : ''
          }
          {moduleData.has_eurorack_power_sync_output == true ?
            <li><Text size="copy" color="subtle">Rear EuroRack Power Header Sync Output (CV/Gate Bus)</Text></li> : ''
          }
          {moduleData.has_rear_14_pin_sync_input == true ?
            <li><Text size="copy" color="subtle">Rear 14 Pin Header Sync Input</Text></li> : ''
          }
          {moduleData.has_rear_14_pin_sync_output == true ?
            <li><Text size="copy" color="subtle">Rear 14 Pin Header Sync Output</Text></li> : ''
          }
        </ul>
        <div className="inline-block w-full h-2"></div>
          {moduleData.is_sync_ref_required == true ?
            <Text size="copy" color="subtle">Connecting the video sync input to a video sync generator module is required to use this module.</Text> :
            <Text size="copy" color="subtle">Video sync connections are not required to use this module.</Text>
          }
      </div>
      <div className="inline-block w-1/2 align-top">
        <Heading as="h3" format size="copy" className="uppercase">Power Consumption</Heading>
        <ul>
          {moduleData.max_pos_12v_ma !== 0 ?
            <li><Text size="copy" color="subtle">{'+12V @ ' + moduleData.max_pos_12v_ma + 'mA'}</Text></li> : ''
          }
          {moduleData.max_neg_12v_ma !== 0 ?
            <li><Text size="copy" color="subtle">{'-12V @ ' + moduleData.max_neg_12v_ma + 'mA'}</Text></li> : ''
          }
        </ul>
        <div className="inline-block w-full h-2"></div>
        <Heading as="h3" format size="copy" className="uppercase">Power Entry</Heading>
        <ul>
          {moduleData.has_dc_barrel_power_entry == true ?
            <li><Text size="copy" color="subtle">Rear DC Barrel Jack</Text></li> : ''
          }
          {moduleData.has_eurorack_power_entry == true ?
            <li><Text size="copy" color="subtle">Rear EuroRack 16 Pin Header</Text></li> : ''
          }
        </ul>

      </div>



      <Heading as="h3" format size="copy" className="uppercase">Connectors</Heading>

      {moduleData.connectors.map((conn, it) => {
        it = it + 1
        return (
          <>
            <div className="w-full inline-block">
              <div className="w-11/12 inline-block">
                <Text color="subtle">
                  {conn.name}
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
              {/* <div className="w-1/12 inline-block">
                <Text color="subtle">
                  P{it2}
                </Text>
              </div> */}
              <div className="w-12/12 inline-block">
                <Text color="subtle">
                  {ctrl.name}
                </Text>
              </div>
            </div>
          </>)
      })}
      <div className="inline-block w-full h-2"></div>
    </div>
  )
};



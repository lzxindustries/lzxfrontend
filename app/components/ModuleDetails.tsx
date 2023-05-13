import { useState } from 'react';
import { ModuleView } from '~/views/module';
import { ModuleLegendPanel } from './ModuleLegendPanel';

export function ModuleDetails({
  children,
  moduleData
}: {
  children?: React.ReactNode;
  moduleData: ModuleView;
}) {
  const [activeRefDes, setActiveRefDes] = useState("")
  var hasMainFeatures = false
  var hasPatchFeatures = false
  var hasSystemFeatures = false
  {
    moduleData.features.map((feature) => {
      feature.topic == "Main" ? hasMainFeatures = true : null
      feature.topic == "Patch" ? hasPatchFeatures = true : null
      feature.topic == "System" ? hasSystemFeatures = true : null
    })
  }
  
  return (
    <div key="ModuleDetails" className="flex flex-wrap flex-row justify-center">
      <div className="basis-[100%] md:basis-1/2 card-image flex flex-row justify-center">
        {/* <div className={"bg-opacity-100 bg-contain bg-center"} style={{backgroundImage: "url('/images/" + moduleData.frontpanel +"')"}}></div> */}
        {/* <div className="p-4 h-[500px]"><img width={frontpanelWidth} height={frontpanelHeight} src={"/images/" + moduleData.frontpanel} /></div> */}
        <div className="px-8 py-4"><img style={{width: "auto", height: "85vh"}} src={"/images/" + moduleData.frontpanel} /></div>
      </div>
      <div className="basis-[100%] md:basis-1/2 md:h-screen hiddenScroll md:overflow-y-scroll">
        <article key="ModuleDetailsArticle" className="prose max-w-none px-8">
          
          <div className="flex flex-row flex-wrap w-full"><div className="w-[1/2]"><h1>{moduleData.name}</h1>
          {/* <h4 className="top-0">{moduleData.subtitle}</h4> */}
          </div>
          <div className="w-[1/2]">{children}</div></div>
          
          <p>{moduleData.description}</p>
          {hasMainFeatures ? moduleData.features.map((feature) => {
            return feature.topic == "Main" ? (
              <div>
                <h3>{feature.name}</h3>
                <p>{feature.description}</p>
              </div>) : ''
          }) : ''}
          
          <div className="flex flex-wrap flex-row">
            <div className="basis-[100%] md:basis-1/2">
              <h3>Dimensions</h3>
              <ul>
                <li>{'Width, ' + moduleData.hp + 'HP'}</li>
                <li>{'Mounting Depth, ' + moduleData.mounting_depth_mm + 'mm'}</li>
              </ul>
            </div>
            {(moduleData.has_rear_video_sync_input !== true &&
              moduleData.has_rear_video_sync_output !== true &&
              moduleData.has_front_video_sync_input !== true &&
              moduleData.has_front_video_sync_output !== true &&
              moduleData.has_eurorack_power_sync_input !== true &&
              moduleData.has_eurorack_power_sync_output !== true &&
              moduleData.has_rear_14_pin_sync_input !== true &&
              moduleData.has_rear_14_pin_sync_output !== true) ? '' :
              <div className="basis-[100%] md:basis-1/2">
                <h3>Video Sync</h3>
                <ul>
                  {moduleData.has_rear_video_sync_input == true ?
                    <li>Rear RCA Sync Input Jack</li> : ''
                  }
                  {moduleData.has_rear_video_sync_output == true ?
                    <li>Rear RCA Sync Output Jack</li> : ''
                  }
                  {moduleData.has_front_video_sync_input == true ?
                    <li>Front RCA Sync Input Jack</li> : ''
                  }
                  {moduleData.has_front_video_sync_output == true ?
                    <li>Front RCA Sync Output Jack</li> : ''
                  }
                  {moduleData.has_eurorack_power_sync_input == true ?
                    <li>Rear EuroRack Power Header Sync Input (CV/Gate Bus)</li> : ''
                  }
                  {moduleData.has_eurorack_power_sync_output == true ?
                    <li>Rear EuroRack Power Header Sync Output (CV/Gate Bus)</li> : ''
                  }
                  {moduleData.has_rear_14_pin_sync_input == true ?
                    <li>Rear 14 Pin Header Sync Input</li> : ''
                  }
                  {moduleData.has_rear_14_pin_sync_output == true ?
                    <li>Rear 14 Pin Header Sync Output</li> : ''
                  }
                </ul>
              </div>}
            {/* {moduleData.is_sync_ref_required == true ?
              <p>Connection to a video sync ref is required to use this module.</p> :
              <p>No video sync connections are required to use this module.</p>
            } */}
            <div className="basis-[100%] md:basis-1/2">
              <h3>Power Consumption</h3>
              <ul>
                {moduleData.max_pos_12v_ma !== 0 ?
                  <li>{'+12V @ ' + moduleData.max_pos_12v_ma + 'mA'}</li> : ''
                }
                {moduleData.max_neg_12v_ma !== 0 ?
                  <li>{'-12V @ ' + moduleData.max_neg_12v_ma + 'mA'}</li> : ''
                }
              </ul>
            </div>
            <div className="basis-[100%] md:basis-1/2">
              <h3>Power Entry</h3>
              <ul>
                {moduleData.has_dc_barrel_power_entry == true ?
                  <li>Rear DC Barrel Jack</li> : ''
                }
                {moduleData.has_eurorack_power_entry == true ?
                  <li>Rear EuroRack 16 Pin Header</li> : ''
                }
              </ul>
            </div>
          {(moduleData.connectors.length == 0 && moduleData.controls.length == 0) ? '' : 
            <div className="basis-[100%] xl:basis-1/2 z-0">
              <h3>Legend</h3>
              <ModuleLegendPanel moduleData={moduleData} setActiveRefDes={setActiveRefDes} activeRefDes={activeRefDes} pixelsPerHP={20} />
            </div>
            }
            {(moduleData.connectors.length == 0 && moduleData.controls.length == 0) ? '' : 
            <div className="basis-[100%] xl:basis-1/2">
              {moduleData.connectors.length > 0 ? <h3>Connectors</h3> : null}
              {moduleData.connectors.length > 0 ? moduleData.connectors.map((conn) => {
                return (
                  
                    <div
                      className={"flex flex-row cursor-pointer " +
                        (activeRefDes == conn.refDes ? " bg-yellow-500 text-black bg-opacity-100" : "bg-black text-primary/50 bg-opacity-0")
                      }
                      onMouseEnter={() => {
                        setActiveRefDes(conn.refDes)
                      }}
                    >
                      
                      <div className="shrink-0 grow-0 w-10">{conn.refDes}</div><div className="">{conn.name} {conn.is_input ? 'Input' : 'Output'}</div>
                    </div>
                  )
              }) : null}
              {moduleData.controls.length > 0 ? <h3>Controls</h3> : null}
              {moduleData.controls.length > 0 ? moduleData.controls.map((conn) => {
                return (
                  
                    <div className={"flex flex-row cursor-pointer " +
                        (activeRefDes == conn.refDes ? " bg-yellow-500 text-black bg-opacity-100" : "bg-black text-primary/50 bg-opacity-0")
                      }
                      onMouseEnter={() => {
                        setActiveRefDes(conn.refDes)
                      }}>
                      <div className="shrink-0 grow-0 w-10">{conn.refDes}</div><div className="">{conn.name}</div>
                    </div>
                  )
              }) : null}
            </div>}
          </div>
          {hasPatchFeatures ?
            <h2>Patching</h2> : ''}
          {hasPatchFeatures ? moduleData.features.map((feature) => {
            return feature.topic == "Patch" ? (
              <div>
                <h3>{feature.name}</h3>
                <p>{feature.description}</p>
              </div>) : ''
          }) : ''}
          {hasSystemFeatures ?
            <h2>System Building</h2> : ''}
          {hasSystemFeatures ? moduleData.features.map((feature) => {
            return feature.topic == "System" ? (
              <div>
                <h3>{feature.name}</h3>
                <p>{feature.description}</p>
              </div>) : ''
          }) : ''}
        </article>
      </div>
    </div>
  )
};



    //   <div className="inline-block w-full h-2"></div>
    
    //   <div className="inline-block w-full h-2"></div>
    //   {hasPatchFeatures ? <><Heading as="h2" className="uppercase">Patching Tips</Heading>
    //     <div className="inline-block w-full align-top">
    //       {moduleData.features.map((feature) => {
    //         return feature.topic == "Patch" ? (
    //           <>
    //             <div className="inline-block w-full"><IconTV className="inline-block align-middle" /> <Text size="lead" className="align-middle">{feature.name}</Text></div>
    //             <div className="inline-block w-full"><Text size="copy" color="subtle">{feature.description}</Text></div>
    //             <div className="inline-block w-full h-2"></div>
    //           </>) : null
    //       })}
    //     </div></> : null
    //   }
    //   {hasSystemFeatures ? <><Heading as="h2" className="uppercase">System Building Tips</Heading>
    //     <div className="inline-block w-full align-top">
    //       {moduleData.features.map((feature, it) => {
    //         return feature.topic == "System" ? (
    //           <>
    //             <div className="inline-block w-full"><IconTV className="inline-block align-middle" /> <Text size="lead" className="align-middle">{feature.name}</Text></div>
    //             <div className="inline-block w-full"><Text size="copy" color="subtle">{feature.description}</Text></div>
    //             <div className="inline-block w-full h-2"></div>
    //           </>) : null
    //       })}
    //     </div></> : null
    //   }
    // </div>



import { ModuleView } from "~/views/module";
import { ModuleInterface } from "~/models/module";
import { ModuleControlInterface } from "~/models/module_control";
import { ModuleConnectorInterface } from "~/models/module_connector";
import { ModuleFeatureInterface } from "~/models/module_feature";
import { CompanyInterface } from "~/models/company";
import { PartInterface } from "~/models/part";
import { getDataCollection, getDataDocument } from "~/lib/db.server";
import { AppLoadContext } from "@shopify/remix-oxygen";
import { ModulePartView } from "~/views/module_part";
import { ModuleVideoInterface } from "~/models/module_video";
import { VideoInterface } from "~/models/video";

export async function getModuleDetails(context: AppLoadContext, id: string) {
    const filters = {id}
    const module_data = await getDataDocument(context, "Module", filters) as ModuleInterface;
    const company_data = await getDataCollection(context, "Company") as CompanyInterface[];
    const module_videos_data = await getDataCollection(context, "ModuleVideo") as ModuleVideoInterface[]
    const videos_data = await getDataCollection(context, "Video") as VideoInterface[]
    const controls_data = await getDataCollection(context, "ModuleControl") as ModuleControlInterface[]
    const connectors_data = await getDataCollection(context, "ModuleConnector") as ModuleConnectorInterface[]
    const features_data = await getDataCollection(context, "ModuleFeature") as ModuleFeatureInterface[]
    const parts_data = await getDataCollection(context, "Part") as PartInterface[]

    const module_view: ModuleView = {
        id: module_data.id,
        name: module_data.name,
        description: module_data.description,
        has_eurorack_power_entry: module_data.has_eurorack_power_entry,
        has_rear_video_sync_input: module_data.has_rear_video_sync_input,
        has_rear_video_sync_output: module_data.has_rear_video_sync_output,
        hp: module_data.hp,
        is_sync_ref_required: module_data.is_sync_ref_required,
        max_neg_12v_ma: module_data.max_neg_12v_ma,
        max_pos_12v_ma: module_data.max_pos_12v_ma,
        mounting_depth_mm: module_data.mounting_depth_mm,
        subtitle: module_data.subtitle,
        frontpanel: module_data.frontpanel,
        legend: module_data.legend,
        has_front_video_sync_output: module_data.has_front_video_sync_output,
        has_front_video_sync_input: module_data.has_front_video_sync_input,
        is_hidden: module_data.is_hidden,
        has_dc_barrel_power_entry: module_data.has_dc_barrel_power_entry,
        has_eurorack_power_sync_input: module_data.has_eurorack_power_sync_input,
        has_eurorack_power_sync_output: module_data.has_eurorack_power_sync_output,
        has_rear_14_pin_sync_input: module_data.has_rear_14_pin_sync_input,
        has_rear_14_pin_sync_output: module_data.has_rear_14_pin_sync_output,
        is_sync_generator: module_data.is_sync_generator,
        external_url: module_data.external_url,
        company:
        {
            name: "Unknown",
            legalName: "Unknown"
        },
        connectors: [],
        features: [],
        controls: [],
        videos: []
    }

    company_data.map((company) => {
        module_data.company == company._id ? module_view.company.name = company.name : null
        module_data.company == company._id ? module_view.company.legalName = company.legalName : null
    })

    // connectors
    connectors_data.map((connector) => {
        const part_view: ModulePartView =
        {
            name: "Unknown",
            image: "None"
        }

        parts_data.map((part) => {
            connector.part == part._id ? part_view.name = part.name : null
            connector.part == part._id ? part_view.image = part.image : null
        })

        connector.module == module_data._id ?
            module_view.connectors.push(
                {
                    is_input: connector.is_input,
                    is_output: connector.is_output,
                    name: connector.name,
                    refDes: connector.refDes,
                    x: connector.x,
                    y: connector.y,
                    part: part_view
                }
            )
            : null
    })

    controls_data.map((control) => {
        const part_view: ModulePartView =
        {
            name: "Unknown",
            image: "None"
        }

        parts_data.map((part) => {
            control.part == part._id ? part_view.name = part.name : null
            control.part == part._id ? part_view.image = part.image : null
        })

        control.module == module_data._id ?
            module_view.controls.push(
                {
                    is_gain: control.is_gain,
                    is_bias: control.is_bias,
                    name: control.name,
                    refDes: control.refDes,
                    x: control.x,
                    y: control.y,
                    part: part_view
                }
            )
            : null
    })

    // features
    features_data.map((feature) => {
        feature.module == module_data._id ?
            module_view.features.push(
                {
                    name: feature.name,
                    description: feature.description,
                    topic: feature.topic
                }
            )
            : null
    })

    // videos
    module_videos_data.map((module_video) => {
        module_video.module == module_data._id ?
            videos_data.map((video) => {
                video._id == module_video.video ? module_view.videos.push(
                    {
                        name: video.name,
                        youtube: video.youtube,
                        gif: video.gif
                    }) : null
            }) : null
    })

    return module_view
}


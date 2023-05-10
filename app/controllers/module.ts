import { ModuleView } from "~/views/module";
import { ModuleControlView } from "~/views/module_control";
import { ModuleConnectorView } from "~/views/module_connector";
import { ModuleFeatureView } from "~/views/module_feature";
import { ModuleInterface } from "~/models/module";
import { ModuleControlInterface } from "~/models/module_control";
import { ModuleConnectorInterface } from "~/models/module_connector";
import { ModuleFeatureInterface } from "~/models/module_feature";
import { CompanyInterface } from "~/models/company";
import { PartInterface } from "~/models/part";
import { getDataCollection, getDataDocument } from "~/lib/db.server";
import { AppLoadContext } from "@shopify/remix-oxygen";

export async function getModuleView(context: AppLoadContext, id: string) {
    const module_data = await getDataDocument(context, "Module", { id }) as ModuleInterface;
    const company_data = await getDataDocument(context, "Company", { id }) as CompanyInterface;
    const controls_data = await getDataCollection(context, "ModuleControl", { module: { id } }) as ModuleControlInterface[]
    const connectors_data = await getDataCollection(context, "ModuleConnector", { module: { id } }) as ModuleConnectorInterface[]
    const features_data = await getDataCollection(context, "ModuleFeature", { module: { id } }) as ModuleFeatureInterface[]
    const parts_data = await getDataCollection(context, "Part", {}) as PartInterface[]

    var module_view = {} as ModuleView
    module_view.description = module_data.description
    module_view.id = module_data.id
    module_view.name = module_data.name
    module_view.description = module_data.description
    module_view.has_eurorack_power_entry = module_data.has_eurorack_power_entry
    module_view.has_rear_video_sync_input = module_data.has_rear_video_sync_input
    module_view.has_rear_video_sync_output = module_data.has_rear_video_sync_output
    module_view.hp = module_data.hp
    module_view.is_sync_ref_required = module_data.is_sync_ref_required
    module_view.max_neg_12v_ma = module_data.max_neg_12v_ma
    module_view.max_pos_12v_ma = module_data.max_pos_12v_ma
    module_view.mounting_depth_mm = module_data.mounting_depth_mm
    module_view.subtitle = module_data.subtitle
    module_view.frontpanel = module_data.frontpanel
    module_view.legend = module_data.legend
    module_view.has_front_video_sync_output = module_data.has_front_video_sync_output
    module_view.has_front_video_sync_input = module_data.has_front_video_sync_input
    module_view.is_hidden = module_data.is_hidden
    module_view.has_dc_barrel_power_entry = module_data.has_dc_barrel_power_entry
    module_view.has_eurorack_power_sync_input = module_data.has_eurorack_power_sync_input
    module_view.has_eurorack_power_sync_output = module_data.has_eurorack_power_sync_output
    module_view.has_rear_14_pin_sync_input = module_data.has_rear_14_pin_sync_input
    module_view.has_rear_14_pin_sync_output = module_data.has_rear_14_pin_sync_output
    module_view.is_sync_generator = module_data.is_sync_generator
    module_view.external_url = module_data.external_url

    // company
    module_view.company.name = company_data.name;
    module_view.company.legalName = company_data.legalName;

    // controls
    controls_data.forEach((control) => {
        var control_view = {} as ModuleControlView
        parts_data.forEach((part) => {
            control.part == part._id ? control_view.part.name = part.name : null
            control.part == part._id ? control_view.part.image = part.image : null
        })
        control_view.is_bias = control.is_bias
        control_view.is_gain = control.is_gain
        control_view.name = control.name
        control_view.refDes = control.refDes
        control_view.x = control.x
        control_view.y = control.y
        module_view.controls.push(control_view)
    })

    // connectors
    connectors_data.forEach((connector) => {
        var connector_view = {} as ModuleConnectorView
        parts_data.forEach((part) => {
            connector.part == part._id ? connector_view.part.name = part.name : null
            connector.part == part._id ? connector_view.part.image = part.image : null
        })
        connector_view.is_input = connector.is_input
        connector_view.is_output = connector.is_output
        connector_view.name = connector.name
        connector_view.refDes = connector.refDes
        connector_view.x = connector.x
        connector_view.y = connector.y
        module_view.connectors.push(connector_view)
    })

    // features
    features_data.forEach((feature) => {
        var feature_view = {} as ModuleFeatureView
        feature_view.name = feature.name
        feature_view.description = feature.description
        module_view.features.push(feature_view)
    })

    return module_view
}


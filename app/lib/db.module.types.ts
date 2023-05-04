import { ID, Unit } from './db.common.types'

export type Module = {
    _id:               ID;
    id?:               string;
    title?:            string;
    description?:      string;
    sku?:              string;
    price?:            string;
    brand?:            string;
    powerConsumption?: ModulePowerConsumption[];
    dimensions?:       ModuleDimensions;
    videoSync?:        ModuleVideoSync;
    releaseDate?:      Date;
    brandId:           ID;
    subtitle:          string;
    connectors:        ModuleConnector[];
    controls:          ModuleControl[];
    features:          ModuleFeature[];
    assemblies:        ModuleAssembly[];
}

export type ModuleAssembly = {
    partNumber: string;
    revisions:  ModuleAssemblyRevision[];
}

export type ModuleAssemblyRevision = {
    tag:   string;
    parts: ModuleAssemblyPart[];
}

export type ModuleAssemblyPart = {
    referenceDesignator: string;
    partNumber:          string;
    resistance:          number;
    footprint:           string;
    mountingType:        ModuleAssemblyPartMountingType;
    tolerance:           number;
    type:                ModuleAssemblyPartType;
    x:                   number;
    y:                   number;
    rotationAngle:       number;
    side:                ModuleAssemblyPartSide;
    xyUnit:              Unit;
}

export enum ModuleAssemblyPartMountingType {
    SMT = "SMT",
}

export enum ModuleAssemblyPartSide {
    Top = "Top",
    Bottom = "Bottom",
}

export enum ModuleAssemblyPartType {
    Resistor = "Resistor",
}

export type ModuleControl = {
    description:         string;
    location:            ModuleLocation;
    type:                ModuleControlType;
    referenceDesignator: string;
    x:                   number;
    y:                   number;
    xyUnit:              Unit;
}

export type ModuleConnector = {
    description:         string;
    location:            ModuleLocation;
    direction:           ModuleConnectorDirection;
    type:                ModuleConnectorType;
    referenceDesignator: string;
    x:                   number;
    y:                   number;
    xyUnit:              Unit;
}

export enum ModuleConnectorDirection {
    Input = "Input",
    Output = "Output",
}

export enum ModuleLocation {
    Front = "Front",
    Rear = "Rear",
}

export enum ModuleControlType {
    VideoKnobOutline = "Video Knob Outline",
    VideoKnobSolid = "Video Knob Solid",
}

export enum ModuleConnectorType {
    The35MmJack = "3.5mm Jack"
}

export type ModuleDimensions = {
    width:     number;
    widthUnit: Unit;
    depth:     number;
    depthUnit: Unit;
}

export type ModuleFeature = {
    title:       string;
    description: string;
    images:      ModuleFeatureImage[];
}

export type ModuleFeatureImage = {
    fileName?:    string;
    description?: string;
}

export type ModulePowerConsumption = {
    voltage:     number;
    voltageUnit: Unit;
    current:     number;
    currentUnit: Unit;
    connectors:  ModulePowerConnector[];
}

export type ModulePowerConnector = {
    type:     ModulePowerConnectorType;
    location: ModuleLocation;
    profile:  ModuleConnectorProfile;
}

export enum ModuleConnectorProfile {
    Horizontal = "Horizontal",
    Vertical = "Vertical",
}

export enum ModulePowerConnectorType {
    DCBarrel21Mm = "DC Barrel 2.1mm",
    EuroRack16Pin = "EuroRack 16 Pin",
}

export type ModuleVideoSync = {
    connectors?: ModuleVideoSyncConnector[];
}

export type ModuleVideoSyncConnector = {
    direction:        ModuleConnectorDirection;
    type:             ModuleVideoSyncConnectorType;
    location:         ModuleLocation;
    profile:          ModuleConnectorProfile;
    terminateSwitch?: boolean;
    syncRef?:         boolean;
    syncGen?:         boolean;
}

export enum ModuleVideoSyncConnectorType {
    Rca = "RCA",
}

export type ModuleCollection = 
{
    documents: Module[]
}

export type ModuleDocument = 
{
    document: Module
}
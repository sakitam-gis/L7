const TYPES = {
  ISceneService: Symbol.for('ISceneService'),
  IGlobalConfigService: Symbol.for('IGlobalConfigService'),
  ICameraService: Symbol.for('ICameraService'),
  ICoordinateSystemService: Symbol.for('ICoordinateSystemService'),
  ILayerService: Symbol.for('ILayerService'),
  ILayerMappingService: Symbol.for('ILayerMappingService'),
  ILayerStyleService: Symbol.for('ILayerStyleService'),
  ILogService: Symbol.for('ILogService'),
  IMapService: Symbol.for('IMapService'),
  IFactoryMapService: Symbol.for('Factory<IMapService>'),
  IRendererService: Symbol.for('IRendererService'),
  IShaderModuleService: Symbol.for('IShaderModuleService'),
  IIconService: Symbol.for('IIconService'),
  IFontService: Symbol.for('IFontService'),
  IInteractionService: Symbol.for('IInteractionService'),
  IControlService: Symbol.for('IControlService'),
  IStyleAttributeService: Symbol.for('IStyleAttributeService'),
  ILayerPlugin: Symbol.for('ILayerPlugin'),
  INewablePostProcessingPass: Symbol.for('Newable<IPostProcessingPass>'),
  IFactoryPostProcessingPass: Symbol.for('Factory<IPostProcessingPass>'),
};

export { TYPES };

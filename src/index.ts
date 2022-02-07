import Engine from "./engine/Engine";
import { EntityOptions, GeometryComponent, FinishingComponent, PriceComponent, ApiEntity, NomenclatureCreatorOptions } from "./types/entity-types";
import { EntityType } from "./utils/entity-units";

const engine = new Engine('CLIENT');

const creator = engine.nomenclatureCreator(); // Как и в прошлой версии, надо создать креатор.

export default Engine;
export {
    NomenclatureCreatorOptions,
    EntityOptions, 
    GeometryComponent, 
    FinishingComponent, 
    PriceComponent, 
    ApiEntity, 
    EntityType,
}




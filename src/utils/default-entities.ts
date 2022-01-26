import { EntityOptions } from "../types/entity-types"
import { EntityType } from "./entity-units"

const defaultFasade: EntityOptions = {
    entity: {
        typeId: EntityType.ENTITY_FASADE
    },
    components: {

    }
}
const defaultPanel: EntityOptions = {
    entity: {
        typeId: EntityType.ENTITY_PANEL
    },
    components: {
        
    }
}

export const defaultEntities = {
    defaultFasade,
    defaultPanel
}


import { EntityOptions } from "../../types/entity-types";
import { Unit } from "../../utils/entity-units";
import { EntityShieldLike } from "../entities/EntityShieldLike";

export class EntityShield extends EntityShieldLike {
    constructor(options: EntityOptions) {
        super(options, Unit.SQUARE_METER)
    }
}
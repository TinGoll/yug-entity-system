import Engine from "../../engine/Engine";
import { EntityOptions, ValidateObject } from "../../types/entity-types";
import { EntityErrors, getError } from "../../utils/api-error";
import Entity from "./Entity";

class EntityUncertain extends Entity {
  constructor(options: EntityOptions) {
    super(options);
  }
 
  validate(): ValidateObject {
    throw getError(EntityErrors.UNSPECIFIED);
  }
}

export default EntityUncertain; 
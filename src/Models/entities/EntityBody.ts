import Engine from "../../engine/Engine";
import { EntityOptions, ValidateObject } from "../../types/entity-types";
import Entity from "./Entity";

class EntityBody extends Entity {
  constructor(options: EntityOptions) {
    super(options);
  }
 
  validate(): ValidateObject {
    const valid: ValidateObject = {
        isValid: true,
        errors: []
    }
    if (!this.elements.length) return {isValid: false, errors: ['Тело заказа - Нет записей.']}
    for (const element of this.getElements()) {
        const elementValid = element.validate();
        if (!elementValid.isValid) {
            valid.isValid = false;
            valid.errors.push(...valid.errors);
        }
    }
    return valid;
  }
}

export default EntityBody;

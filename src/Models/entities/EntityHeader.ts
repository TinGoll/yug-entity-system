
import Engine from "../../engine/Engine";
import { EntityOptions } from "../../types/entity-types";
import Entity from "./Entity";

class EntityHeader extends Entity {
  constructor(options: EntityOptions) {
    super(options);
  }
}

export default EntityHeader;
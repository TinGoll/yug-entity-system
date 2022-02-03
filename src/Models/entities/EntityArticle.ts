import { EntityOptions } from "../../types/entity-types";
import Entity from "./Entity";

export abstract class EntityArticle extends Entity { 
    constructor(options: EntityOptions) {
        super(options);
    }

}
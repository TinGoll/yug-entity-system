import { EntityOptions, Unit } from "../../types/entity-types";
import { getError } from "../../utils/api-error";
import { EntityArticle } from "./EntityArticle";


export class EntityProduct extends EntityArticle {
    constructor(options: EntityOptions) {
        super(options);
    }
}
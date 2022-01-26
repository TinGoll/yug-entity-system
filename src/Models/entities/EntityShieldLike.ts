import { ComponentKeys, EntityOptions } from "../../types/entity-types";
import { getError } from "../../utils/api-error";
import { Unit } from "../../utils/entity-units";
import Entity from "./Entity";
import { EntityProduct } from "./EntityProduct";

export abstract class EntityShieldLike extends EntityProduct {
    protected propertyBlackList = new Map<ComponentKeys, boolean>();

    constructor(options: EntityOptions, unit: Unit) {
        super(options, unit);
    }

    getHeight(): number | null {
        return this.options?.components?.geometryComponent?.height || 0;
    }
    getWidth(): number | null {
        return this.options?.components?.geometryComponent?.width || 0;
    }
    getDepth(): number | null {
        return this.options?.components?.geometryComponent?.depth || 0;
    }
    getAmount(): number | null {
        return this.options?.components?.geometryComponent?.amount || 0;
    }

    getSquare(): number | null {
        const height = this.getHeight();
        const width = this.getWidth();
        const amount = this.getAmount();
        if (height === null || width === null || amount === null) return null;
        return (height / 1000) * (width / 1000) * amount;
    }
    getCubature(): number | null {
        const height = this.getHeight();
        const width = this.getWidth();
        const amount = this.getAmount();
        const depth = this.getDepth();
        if (height === null || width === null || amount === null || depth === null)
            return null;
        return (height / 1000) * (width / 1000) * (depth / 1000) * amount;
    }
    getLinearMeters(): number | null {
        const height = this.getHeight();
        const width = this.getWidth();
        if (height === null || width === null) return null;
        return height * 2 + width * 2;
    }
    getPrice(): number | null {
        return this.options.components?.priceComponent?.price || null;
    }
    getCost(): number | null {
        const price = this.getPrice();
        const weight = this.getWeight();
        if (price === null || weight === null) return null;
        return weight * price;
    }
    getColorId(): number | null {
        return this.options.components?.finishingComponent?.colorId || null;
    }
    getPatinaId(): number | null {
        return this.options.components?.finishingComponent?.patinaId || null;
    }
    getVarnishId(): number | null {
        return this.options.components?.finishingComponent?.varnishId || null;
    }

    /** Установка свойст */
    setHeight(value: number): Entity {
        if (this.propertyBlackList.has('height')) {
            if (!this.propertyBlackList.get('height')) throw getError(2);
        }
        if (typeof this.options.components?.geometryComponent?.height === 'undefined') {
            throw getError(3);
        }
        return this.setComponents({
            geometryComponent: {
                height: value
            }
        });
    }

    setWidth(value: number): Entity {
        if (this.propertyBlackList.has('width')) {
            if (!this.propertyBlackList.get('width')) throw getError(2);
        }
        if (typeof this.options.components?.geometryComponent?.height === 'undefined') {
            throw getError(3);
        }
        return this.setComponents({
            geometryComponent: {
                width: value
            }
        });
    }
    setDepth(value: number): Entity {
        if (this.propertyBlackList.has('depth')) {
            if (!this.propertyBlackList.get('depth')) throw getError(2);
        }
        if (typeof this.options.components?.geometryComponent?.height === 'undefined') {
            throw getError(3);
        }
        return this.setComponents({
            geometryComponent: {
                depth: value
            }
        });
    }
    setAmount(value: number): Entity {
        if (this.propertyBlackList.has('amount')) {
            if (!this.propertyBlackList.get('amount')) throw getError(2);
        }
        if (typeof this.options.components?.geometryComponent?.height === 'undefined') {
            throw getError(3);
        }
        return this.setComponents({
            geometryComponent: {
                amount: value
            }
        });
    }

    setPrice(value: number): Entity {
        if (this.propertyBlackList.has('price')) {
            if (!this.propertyBlackList.get('price')) throw getError(2);
        }
        if (typeof this.options.components?.geometryComponent?.height === 'undefined') {
            throw getError(3);
        }
        return this.setComponents({
            priceComponent: {
                price: value
            }
        });
    }

    setColorId(value: number): Entity {
        if (this.propertyBlackList.has('colorId')) {
            if (!this.propertyBlackList.get('colorId')) throw getError(2);
        }
        if (typeof this.options.components?.geometryComponent?.height === 'undefined') {
            throw getError(3);
        }
        return this.setComponents({
            finishingComponent: {
                colorId: value
            }
        });
    }
    setPatinaId(value: number): Entity {
        if (this.propertyBlackList.has('patinaId')) {
            if (!this.propertyBlackList.get('patinaId')) throw getError(2);
        }
        if (typeof this.options.components?.geometryComponent?.height === 'undefined') {
            throw getError(3);
        }
        return this.setComponents({
            finishingComponent: {
                patinaId: value
            }
        });
    }
    setVarnishId(value: number): Entity {
        if (this.propertyBlackList.has('varnishId')) {
            if (!this.propertyBlackList.get('varnishId')) throw getError(2);
        }
        if (typeof this.options.components?.geometryComponent?.height === 'undefined') {
            throw getError(3);
        }
        return this.setComponents({
            finishingComponent: {
                varnishId: value
            }
        })
    }
}
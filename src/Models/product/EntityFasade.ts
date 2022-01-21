import { ComponentKeys, EntityOptions, FinishingComponent, GeometryComponent, PriceComponent } from "../../types/entity-types";
import { Unit } from "../../utils/entity-units";
import { EntityProduct } from "../entities/EntityProduct";

class EntityFasade extends EntityProduct {
  private propertyBlackList = new Map<ComponentKeys, boolean>();
  constructor(options: EntityOptions) {
    super(options, Unit.SQUARE_METER);
    this.propertyBlackList.set("depth", false);
  }

  getHeight(): number | null {
    return this.options?.components?.geometryComponent?.height || null;
  }
  getWidth(): number | null {
    return this.options?.components?.geometryComponent?.width || null;
  }
  getDepth(): number | null {
    return this.options?.components?.geometryComponent?.depth || null;
  }
  getAmount(): number | null {
    return this.options?.components?.geometryComponent?.amount || null;
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
  getColor(): string | null {
    throw new Error("Method not implemented.");
  }
  getPatina(): string | null {
    throw new Error("Method not implemented.");
  }
  getVarnish(): string | null {
    throw new Error("Method not implemented.");
  }
}
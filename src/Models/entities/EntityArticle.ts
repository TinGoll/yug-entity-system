import { ComponentKeys, EntityOptions } from "../../types/entity-types";
import { Unit } from "../../utils/entity-units";
import Entity from "./Entity";

export abstract class EntityArticle extends Entity { 
    protected propertyBlackList = new Map<ComponentKeys, boolean>();
    private unit: Unit;
    constructor(options: EntityOptions, unit: Unit) {
        super(options);
        this.unit = unit;
    }

    /** @returns имя сущности. */
    getName(): string { 
        return this.options.entity.name || 'Нет названия';
    }
    /** @returns комментарий сущности. */
    getComment(): string | null {
        return this.options.entity.note||null;
    }
    /** @returns дата создания сущности. */
    getCreationDate(): Date {
        return this.options.entity.dateCreation || new Date();
    }
    /** @returns дата последнего изменения сущности. */
    getUpdateDate(): Date {
        return this.options.entity.dateUpdate || new Date();
    }
    /** @returns еденица измерения сущности. */
    getUnit(): Unit {
        return this.unit;
    }
    /** Присваеивает еденицу измерения */
    setUnit(unit: Unit): EntityArticle {
        this.unit = unit;
        return this;
    }


    /** @returns вес сущности. зависит от еденици измерения. */
    getWeight(): number | null {
       switch (this.unit) {
           case Unit.THING:
               return this.getAmount();
           case Unit.SQUARE_METER:
               return this.getSquare()
           case Unit.CUBIC_METER:
               return this.getCubature();
           case Unit.LINEAR_METER:
               return this.getLinearMeters();
           default:
               return this.getAmount()
       }
    }
    
    /** Копонент геометрия */

    /** @returns высота сущности. */
    abstract getHeight () : number|null;
    /** @returns ширина сущности. */
    abstract getWidth(): number | null;
    /** @returns глубина сущности. */
    abstract getDepth(): number | null;
    /** @returns количество сущности. */
    abstract getAmount(): number | null;
    /** @returns площадь сущности. */
    abstract getSquare(): number | null;
    /** @returns кубатура сущности. */
    abstract getCubature(): number | null;
    /** @returns погонные метры сущности. */
    abstract getLinearMeters(): number| null;

    /** Установка высоты сущности. */
    abstract setHeight(value: number): EntityArticle;
    /** Установка ширины сущности. */
    abstract setWidth(value: number): EntityArticle;
    /** Установка глубины сущности. */
    abstract setDepth(value: number): EntityArticle;
    /** Установка кол-ва сущности. */
    abstract setAmount(value: number): EntityArticle;

    /** Компонено Цена */

    /** @returns цена сущности. */
    abstract getPrice(): number| null;
    /** @returns стоимость сущности. */
    abstract getCost(): number | null;

    /** Установка цены сущности. */
    abstract setPrice(value: number): EntityArticle;


    /** Компонент отделка */

    /** @returns копонент отделка - цвет сущности. */
    abstract getColorId(): number | null;
    /** @returns копонент отделка - патина сущности. */
    abstract getPatinaId(): number | null;
    /** @returns копонент отделка - лак сущности. */
    abstract getVarnishId(): number | null;

    /** Установка высоты сущности. */
    abstract setColorId(value: number): EntityArticle;
    /** Установка высоты сущности. */
    abstract setPatinaId(value: number): EntityArticle;
    /** Установка высоты сущности. */
    abstract setVarnishId(value: number): EntityArticle;

}
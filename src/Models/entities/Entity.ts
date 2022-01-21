
import Engine from "../../engine/Engine";
import { EntityComponents, EntityOptions, ValidateObject } from "../../types/entity-types";
import { EntityErrors, getError } from "../../utils/api-error";
import { getKeyValue } from "../../utils/object-utils";
/** Создает новую сущность, на основе передаваемых опций */
abstract class Entity {
  protected options: EntityOptions;
  protected elements: EntityOptions[] = [];
  constructor(options: EntityOptions) {
    this.options = { ...options };
  }

  /** Производит новую сущность, на основе передаваемых опций, передавая ей свои параметры компонентов, 
   * если таковые определены в передаваемой сущности. Так же новоя сущность становиться дочерней сущностью текущей.
   * @returns Новая сущность.*/
  produce(options: EntityOptions): Entity {
    const entity = Engine.create(Engine.integration(options, this.options));
    this.add(entity.getOptions());
    return entity;
  }
  /** Принимает существующую сущность передавая ей свои параметры компонентов,
   * если таковые определены в передаваемой сущности. 
   * @returns rhis*/
  override(entity: Entity): Entity {
    return entity.setOption(Engine.integration(entity.getOptions(), this.options));
  }

  /** ------------------------------Отношение сущностей------------------------------ */

  /** Уникальный ключь */
  get key(): string | null {
    return this.options.key || null;
  }
  /** Уникальный ключь родительского объекта. */
  get parentKey(): string | null {
    return this.options.parentKey || null;
  }
  set parentKey(key: string|null) {
    this.options.parentKey = key||undefined
  }
  /** Определить родительский объект  @returns - Возвращает контекст this; */
  setParent(parent: Entity): Entity {
    if (!parent.key) throw getError(EntityErrors.UNSPECIFIED);
    this.options.parentKey = parent.key;
    return this;
  }

  /** ------------------------------------------------------------------------------- */

  /** @returns Компоненты сущности. */
  getComponents(): EntityComponents | null {
    return this.options.components || null;
  }
  
  /** Устанавливает компоненты для сущности, заменяет новыми, не указанные остаются неизмененными.
   * @returns this
   */
  setComponents(conponents: EntityComponents): Entity {
    this.options.components = {
      finishingComponent: {
        ...this.options.components?.finishingComponent,
        ...conponents.finishingComponent
      },
      geometryComponent: {
        ...this.options.components?.geometryComponent,
        ...conponents.geometryComponent,
      },
      priceComponent: {
        ...this.options.components?.priceComponent,
        ...conponents.priceComponent
      }
    }
    return this;
  }


  /** Добавление существующей сущности, как дочерний объект. */
  add(options: EntityOptions): EntityOptions {
    if (!this.key) throw getError(EntityErrors.UNSPECIFIED);
    options.parentKey = this.key;
    this.elements.push(options);
    return options;
  }
  
  /** @returns - Возвращает dto сущности. */
  getOptions(): EntityOptions {
    return this.options;
  }

  /** Определяет новые опции для сущности
   * @returns this;
   */
  setOption(options: EntityOptions): Entity {
    const key = this.options.key;
    const parentKey = this.options.parentKey;
    this.options = {
      ...this.options,
      entity: {
        ...this.options.entity,
        ...options.entity
      },
      components: {
        ...this.options.components,
        ...options.components
      }
    }
    this.options.key = key;
    this.options.parentKey = parentKey;
    return this;
  }
 
  /** ------------------------------------------------------------------------------- */

  /** Вовращает массив объектов сущностей. */
  getElements(): Entity[] {
    return this.elements.map((e) => Engine.create(e));
  }
  /** ------------------------------------------------------------------------------- */

  /** Метод проврки данных сущьности, переопределить в дочерних классах, при необходимости. */
  validate(): ValidateObject {
    const valid: ValidateObject = {
      isValid: true,
      errors: []
    }
    for (const componentKey in this.options.components) {
      if (Object.prototype.hasOwnProperty.call(this.options.components, componentKey)) {
        const component = getKeyValue<EntityComponents, keyof EntityComponents>(this.options.components, componentKey as keyof EntityComponents);
        if (typeof component !== "undefined") {
          for (const key in component) {
            if (Object.prototype.hasOwnProperty.call(component, key)) {
              const element = getKeyValue<Partial<typeof component>, keyof Partial<typeof component>>(component, key as keyof Partial<typeof component>);
              if (!element) {
                valid.isValid = false;
                valid.errors.push(`${this.options.entity.name} - поле ${key} компонента ${typeof component} является обязательным.`)
              }
            }
          }
        }
      }
    }
    for (const element of this.getElements()) {
      const elementValid = element.validate();
      if (!elementValid.isValid) {
        valid.errors.push(...elementValid.errors);
      }
    }
    return valid;
  }
  /** ------------------------------------------------------------------------------- */
}

export default Entity;

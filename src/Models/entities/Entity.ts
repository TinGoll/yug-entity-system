
import Engine from "../../engine/Engine";
import { ApiComponent, Components, CreateOptions, EntityComponent, EntityComponentProperty, EntityOptions, ApiEntityOptions, EntitySnapshot, EntityState, IGetable, PropertyAttributes, PropertyValue } from "../../types/entity-types";
import Component from "../components/Component";


/** Создает новую сущность, на основе передаваемых опций */
abstract class Entity implements IGetable {
  protected options: EntityOptions;
  constructor(options: EntityOptions) {
    this.options = { ...options, signature: { ...options.signature }, components: [...options.components]};
  }

  /** ----------------------------------------------------------------- */
  /**
   * Возвращает массив объектов класса Component - независимый объект. не путать с объектом компонента сущьности.
   * @returns Массив компонентов, каждый из которых, является instance класса Component. Который создается креатором.
   */
  produceComponents(): Component[] {
    const components: Component[] = [];
    const componentNames = [...new Set(this.options.components.map(c => c.componentName))]
    for (const name of componentNames) {
      const probs = this.options.components.filter(c => c.componentName === name).map(c => {
        c.id = undefined;
        c.entityId = undefined;
        return c;
      });
      const component = Component.setComponent(probs);
      components.push(component);
    }
    return [...components];
  }

 /**
  * Добавляет новый компонет, со всеми полями. Если такой комопнент уже существует, новые поля заменят старые значения. 
  * @param comps Объект с влложенными комопнентами
  * @returns Сущьность
  */
  addComponent(component: Component): Entity {
    this.saveComponent(component.build())
    return this;
  }

  /** @returns Все компоненты сущьности */
  getComponents<T extends any = string> (): Components<T> {
    return <Components<T>> Engine.componentConverterArrayToObject(this.options.components);
  }

  /**
   * Перезаписывает значения всех переданных компонентов, если они существуют (Устарело). Можно передавать комопненты из других сущностей.
   * Метод позволяем переопределить название комопнента, если есть такая необходимость
   * (New) Изменил подход. Теперь добавляються компоненты, которых нет в текущей сущности.
   * Метод setComponent - основной метод редактирования комопнентов для Админа.
   * @param components - Компоненты  ввиде объекта
   * @returns сущность
   */
  setComponent(components: { [key: string]: EntityComponent }): Entity {
    const comps = this.getComponents();
    for (const key in components) {
      this.saveComponent(Engine.componentConverterObjectToArray(
        {
          ...components,
          [key]: { ...components[key] }
        }
      ))
      // Удалена проверка на наличие компонента в сущности.
      //if (Object.prototype.hasOwnProperty.call(comps, key)) {} else {}
    }
    return this;
  }
  /**
   * Установить комопнент, с помощью данных, сформированнх методом build(), или данными полученными по API
   * @param components - Массив данных сформированных методом build();
   * @returns Возвращает Entity;
   */
  setComponentToBuildData (components: ApiComponent[]): Entity {
    this.saveComponent(components)
    return this;
  }

  /** Присваивает значение свойству определенного комопнента. В случае неудачи генерирует событие ошибки. */
  setProperty(componentName: string, propertyName: string, value: PropertyValue): Entity {
    try {
      const componentsApi = this.options.components;
      const componentApi = componentsApi.find(c => c.componentName === componentName && c.propertyName === propertyName);
      if (componentApi) {
        if (componentApi.propertyType == 'date' && !(value instanceof Date))
          throw new Error('Попытка присвоить значение, которое не является датой.');
        if (componentApi.propertyType == 'number' && !isNaN((value as number)))
          throw new Error('Попытка присвоить значение, которое не является числом.');
        /** Определяем какие установлены атрибуты */
        const atributes: PropertyAttributes[] = <PropertyAttributes[]> componentApi.attributes?.replace(/\s+/g, '')?.split(';') || [];
        if (atributes.includes('readonly')) 
          throw new Error('Попытка присвоить значение, свойству которое помечено как "только для чтения"');
        /** присвоение  */
        //* Сохраняем прежнее значение.
        const oldValue = componentApi.propertyValue;
        // * Записываем новое значение.
        componentApi.propertyValue = value;
        // * Разворачиваем копоненты, что бы избежать мутации.
        this.options.components = [...componentsApi];
        /** событие на изменение */
      } else {
        throw new Error(`Свойство ${propertyName} не найдено в компоненте ${componentName}`)
      }
      return this;
    } catch (e) {
      /** Реализовать событие ошибки */
      const error = e as Error;
      Engine.emit('on-entity-error', {
        entity: this,
        err: {
          message: error.message,
          errors: []
        }
      })
      return this;
    }
  }
  
  /**
   * Получаем объект определенного свойства определенного комонента.
   * Использование дженерика заранее определенных копонентов, позволит использовать автокоплит.
   * @param componentName Название копонента , на английском
   * @param propertyName Название свойства на английском
   */
  getProperty<T extends any = string>(
    componentName: T extends string ? string : keyof T, 
    propertyName: T extends string ? string : keyof T[keyof T]
  ): EntityComponentProperty | null {
    try {
      const componentsApi = this.options.components;
      const componentApi = componentsApi.find(c => c.componentName && c.propertyName);
      if (!componentApi) return null;
      const compObject = Engine.componentConverterArrayToObject([componentApi]);
      if (Object.prototype.hasOwnProperty.call(compObject, componentName)) 
        throw new Error(`Сущьность не содержит копонент "${componentName}"`);

      if (Object.prototype.hasOwnProperty.call(compObject[componentName as string], propertyName))
        throw new Error(`Копонент "${componentName}" не содержит свойство "${propertyName}"`);
      return compObject[componentName as string][propertyName as string];
    } catch (e) {
      const error = e as Error;
      Engine.emit('on-entity-error', {
        entity: this,
        err: {
          message: error.message,
          errors: []
        }
      })
      return null;
    }
  }
  /**
   * 
   * @param componentName Название копонента , на английском
   * @param propertyName Название свойства на английском
   * @returns Текст, число или дата, определяется дженериком <string>
   */
  getPropertyValue<T extends PropertyValue = string, U extends any = string>(
    componentName: U extends string ? string : keyof U,
    propertyName: U extends string ? string : keyof U[keyof U]): T | null {
    try {
      const property = this.getProperty<U>(componentName, propertyName);
      if (!property) throw new Error(`Копонент "${componentName}" не содержит свойство "${propertyName}"`);
      return <T> property.propertyValue || null;
    } catch (e) {
      const error = e as Error;
      Engine.emit('on-entity-error', {
        entity: this,
        err: {
          message: error.message,
          errors: []
        }
      })
      return null;
    }
  }

  /** Приватный сервисный метод, для разворачивания комопнента (устарело)
   *  Изменил принцип действия. Теперь в качестве аргумента, надо передавать массив ApiComponent[]
   */
  private saveComponent(components: ApiComponent[]) {
    const comps = [...this.options.components];

    for (const component of components) {
      const index = comps.findIndex(c => c.componentName === component.componentName && c.propertyName === component.propertyName);
      if (index > -1) comps[index] = {...component}
      else comps.push({ ...component});
    }
    this.options.components = [...comps];
  }

  /** ----------------------------------------------------------------- */

  /** Построение состояния родительской сущности и всех дочерних. */
  public build(): ApiEntityOptions {
    const children = Engine.getChildrenOptionsToParentKey(this.options.key!)
      .map(e => Engine.create(e)?.build());
    return {
      ...this.options,
      сhildEntities: [
        ...children
      ]
    }
  }

  /** Установка состояния родительской сущности и всех дочерних. */
  public setState(state: EntityState): Entity {
    return this;
  }

  /** ----------------------------------------------------------------- */

  /** Производит новую сущность, на основе передаваемых опций, передавая ей свои параметры компонентов, 
   * если таковые определены в передаваемой сущности. Так же новоя сущность становиться дочерней сущностью текущей.
   * @returns Новая сущность.*/
  produce(options: CreateOptions) {
    const opt: EntityOptions = {
      ...options,
      signature: {...options.signature},
      components: [...options.components || []]
    };

    const entity = Engine.create(Engine.integration(opt, this.options));
    this.add(entity);
    return entity;
  }

  /** Принимает существующую сущность передавая ей свои параметры компонентов,
   * если таковые определены в передаваемой сущности. 
   * @returns Возвращает модифицированную сущность, с интегированными компонентами*/
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
  /**----------------------------------------------------------------------------------- */

  /** Получить имя сущности. */
  getName(): string {
    return this.options.signature.name||'Без имени';
  }
  /** Определить имя сущности */
  public setName(name: string): Entity {
    this.options.signature.name = name;
    return this;
  }

  /**----------------------------------------------------------------------------------- */

  /** ------------------------------------------------------------------------------- */

  /** Добавление существующей сущности, как дочерний объект. */
  add(entity: Entity): Entity {
    const options =  Engine.getEntityOptionsToKey(entity.key!)

    if (options && this.key) {
      options.parentKey = this.key
    }
    return entity;
  }
  /** Добавляет дочерние сущности списком. */
  addAll(arr: Entity[]): Entity {
    for (const entity of arr) {
      this.add(entity)
    }
    return this;
  }

  /** @returns - Возвращает dto сущности. */
  getOptions(): EntityOptions {
    return this.options;
  }

  /** Определяет новые опции для сущности
   * @returns this;
   */
  setOption(options: EntityOptions): Entity {
    this.options = {...options}
    return this;
  }
  /** ------------------------------------------------------------------------------- */
  /** Вовращает массив объектов сущностей. */
  getChildren(): Entity[] {
    const children = Engine.getChildrenOptionsToParentKey(this.options.key!).map(opt => {
      return Engine.create(opt);
    });
    return children;
  }
  /** ------------------------------------------------------------------------------- */
  /** ------------------------------------------------------------------------------- */
  /** Получаем "снимок сущности, без методов, с комопнентами в виде объекта. " */
  public get(): Readonly<EntitySnapshot> {
    const entitySnapshot: EntitySnapshot = {
      components: Engine.componentConverterArrayToObject(this.options.components),
      signature: this.options.signature,
      key: this.options.key,
      parentKey: this.options.parentKey
    }
    return {...entitySnapshot};
  }
}

export default Entity;

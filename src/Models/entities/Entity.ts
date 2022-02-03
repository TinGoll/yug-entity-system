
import Engine from "../../engine/Engine";
import { Components, EntityComponent, EntityComponentProperty, EntityOptions, EntityOptionsApi, EntityState, PropertyAttributes, PropertyValue } from "../../types/entity-types";


/** Создает новую сущность, на основе передаваемых опций */
abstract class Entity {
  protected options: EntityOptions;
  constructor(options: EntityOptions) {
    this.options = {...options};
  }

  /**
   * 
    // Events
    on(event: "close", listener: (this: WebSocket, code: number, reason: Buffer) => void): this;
    on(event: "error", listener: (this: WebSocket, err: Error) => void): this;
    on(event: "upgrade", listener: (this: WebSocket, request: IncomingMessage) => void): this;
    on(event: "message", listener: (this: WebSocket, data: WebSocket.RawData, isBinary: boolean) => void): this;
    on(event: "open", listener: (this: WebSocket) => void): this;
    on(event: "ping" | "pong", listener: (this: WebSocket, data: Buffer) => void): this;
   */

  /** ----------------------------------------------------------------- */
 /**
  * Добавляет новый компонет, со всеми полями. Если такой комопнент уже существует, новые поля заменят старые значения. 
  * Отличие от setComponent - в том, что setComponent не создает а только меняет существующий копонент.
  * @param comps Объект с влложенными комопнентами
  * @returns Возвращает все компоненты в сущности.
  */
  addComponent(comps: {[key: string]: EntityComponent}): Components {
    this.saveComponent(comps);
    return this.getComponents();
  }

  /** @returns Все компоненты сущьности */
  getComponents (): Components {
    return Engine.componentConverterArrayToObject(this.options.components);
  }

  /** Устанавливает комопнент, перезаписывая прежние своства, либо создает если компонента не существует
   * @param comps Объект с влложенными комопнентами
   * @returns this
   */
  setComponent(comps: { [key: string]: EntityComponent }): Entity {
    const components = this.getComponents();
    for (const key in comps) {
      if (Object.prototype.hasOwnProperty.call(components, key)) {
        this.saveComponent({
          ...components,
          [key]: {...comps[key]}
        })
      } else {
        this.addComponent( {[key]: comps[key]})
      }
    }
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
      }
      return this;
    } catch (e) {
      /** Реализовать событие ошибки */
      const error = e as Error;
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
      if (!property) return null;
      return <T> property.propertyValue || null;
    } catch (e) {
      return null;
    }
  }

  /** Приватный сервисный метод, для разворачивания комопнента */
  private saveComponent(comps: { [key: string]: EntityComponent }) {
    const components = this.getComponents();
    this.options.components = [...Engine.componentConverterObjectToArray({
      ...components,
      ...comps
    })]
  }

  /** ----------------------------------------------------------------- */

  /** Построение состояния родительской сущности и всех дочерних. */
  public build(): EntityOptionsApi {
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
  produce (options: EntityOptions) {
    const entity = Engine.create(Engine.integration(options, this.options));
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
    
    return entity;
  }
  /** Добавляет дочерние сущности списком. */
  addAll(arr: Entity[]) {
   
  }

  /** @returns - Возвращает dto сущности. */
  getOptions(): EntityOptions {
    return this.options;
  }

  /** Определяет новые опции для сущности
   * @returns this;
   */
  setOption(options: EntityOptions): Entity {
    return this;
  }
  /** ------------------------------------------------------------------------------- */
  /** Вовращает массив объектов сущностей. */
  getElements(): Entity[] {
    return [];
  }
  /** ------------------------------------------------------------------------------- */
  /** ------------------------------------------------------------------------------- */
}

export default Entity;

import { EntityShell, PropertyValue } from "../@engine-types";
import { Engine } from "../Engine";
import Entity from "../Entity";
import RoomController from "./RoomController";
import { Subscriber } from "./Subscriber";

/**
 * Абстрактный Класс комнаты, требует реализации.
 */
export default abstract class Room<
  T extends any = string,
  U extends Subscriber<T> = Subscriber<T>
> {
  protected roomController: RoomController;
  protected subscribers: Map<T, U>;
  protected engine: Engine;
  protected _entity: Entity | null;
  protected _key: T;

  protected _currentLvl: number = 0;

  constructor(key: T, engine: Engine, entity?: Entity) {
    this._key = key;
    this.subscribers = new Map<T, U>();
    this.engine = engine;
    this.roomController = engine.roomController;
    this._entity = entity || null;
  }

  /****************************************************************** */
  /****************************************************************** */
  /****************************************************************** */

  // Абстрактные методы команты.

  /** Подписка */
  abstract subscribe(subscriber: Subscriber<T>, ...args: any[]): this;
  /** Отписка */
  abstract unsubscribe(subscriber: Subscriber<T>): this;
  /** Пересчет сущности / сущностей комнаты. */
  abstract recalculation(): Promise<any>;
  /** Сохранение изменений. */
  abstract applyChanges(): Promise<any>;

  // Методы для работы с сущностями.

  /**
   * Добавление сущности (вложение), в указанную, по ключу.
   * @param key Ключ сущности, в которую необходимо вложить новую сущность
   * @param addedKey Ключ шаблона (должен существовать).
   * @param args дополнительно можно любые аргументы.
   */
  abstract addEntityByKey(
    key: string,
    addedKey: string,
    ...args: any[]
  ): Promise<any>;

  /**
   * Добавление нового свойства в сущность, по ключу шаблона компонента.
   * @param key Ключ сущности, в которую необходимо вложить новые компоненты.
   * @param propertyKeys ключи шаблонов компонентов.
   * @param args дополнительно можно любые аргументы.
   */
  abstract addPropertyToKey(
    key: string,
    propertyKeys: string[],
    ...args: any[]
  ): Promise<any>;

  /**
   * Удаление сущности по ключу, если сущность является главной, то после удаления комната будет уничтожена.
   * @param keys ключ удаляемой сущности.
   * @param args дополнительно можно любые аргументы.
   */
  abstract deleteEntityByKey<D extends any = any, K extends any = string[]>(keys: K, ...args: any[]): Promise<D>;

  /**
   * Изменение свойств сущности, по ключу.
   * @param key ключ сущности.
   * @param propertyKey ключ изменяемого свойства.
   * @param value новое значение.
   * @param args дополнительно можно любые аргументы.
   */
  abstract editEntityToKey(
    key: string,
    propertyKey: string,
    value: PropertyValue,
    ...args: any[]
  ): Promise<any>;

  /**
   * Метод сборки данных комнаты. Собирает в нужном формате сущности, по нужному фильтру. Для отправки клиенту.
   * @param args Можно передать любые аргументы.
   */
  abstract build<D extends any = any>(...args: any[]): Promise<D>;

  /**
   * Уведомление других комнат, если в текущей были какие - то глобальные изменения.
   */
  abstract notifyRooms(...args: any[]): Promise<any>;

  /**
   * Отправка сообщений для подписчиков текущей комнаты.
   * @param args
   */
  abstract sendNotificationToSubscribers(...args: any[]): void;

  /**
   * Отправка сообщения одному подписчику.
   * @param subscriber Подписчик. (Должен быть подписан на данную комнату.)
   * @param args Можно передать любые аргументы.
   */
  abstract sendToOneSubscriber(subscriber: Subscriber, ...args: any[]): void;

  /**
   * Метод логирования ошибок.
   * @param args Можно передать любые аргументы.
   */
  abstract errorLoger(...args: any[]): any;

  /****************************************************************** */
  /****************************************************************** */
  /****************************************************************** */

  /**
   * Удаление сущностей, принадлежащих текущей комнате.
   * @param keys Массив ключей.
   * @returns массив, массивов. Кортеж, первым элементом являеться массив ключей удаляемых сущностей, вторым массив ключей, зависимых сущностей
   * которые так жу бедут удалены.
   */
  async deleteEntity(keys?: string[]): Promise<[string[], string[]]> {
    try {
      if (this._entity) {
        if (!keys) {
          // Полное удаление всех сущностей комнаты.
          const allKeys = await this.engine.deleteEntityShell([
            this._entity.key,
          ]);
          return allKeys;
        } else {
          const deletedCandidates: string[] = [];
          for (const key of keys) {
            if (await this.existsEntityKey(key)) {
              deletedCandidates.push(key);
            }
          }
          if (!deletedCandidates.length) return [[], []];
          const deletedKey = await this.engine.deleteEntityShell(
            deletedCandidates
          );
          return deletedKey;
        }
      }
      return [[], []];
    } catch (e) {
      throw e;
    }
  }

  /**
   * Получаем список оболочек сущностей в комнате.
   * @returns EntityShell[].
   */
  async getEntityShells(): Promise<EntityShell[]> {
    if (!this._entity || !this._entity?.key) return [];
    const shells = await this.engine.find(this._entity?.key, "all offspring");
    // this._entity.getShell()
    return [...shells];
  }

  /**
   * Поиск и получение сущности в виде instance класса Entity.
   * @param key ключ сущности..
   */
  async getRoomEntity(key: string): Promise<Entity | null> {
    try {
      if (!this._entity) return null;
      const shells = await this.engine.findDynasty(this._entity.key);
      const candidateShell = shells.find((sh) => sh.options.key === key);
      if (!candidateShell) return null;
      return this.engine.creator.shellToEntity(candidateShell);
    } catch (e) {
      throw e;
    }
  }

  /**
   * Получить главную сущность комнаты.
   * @returns Entity или null
   */
  getEntity(): Entity | null {
    return this._entity;
  }
  /**
   * Присвоить новую главную сущность комнаты.
   * @param entity
   * @returns
   */
  /**
   * Установка новой сущности в качестве главной.
   * @param entity главная сущность комнаты.
   * @returns this.
   */
  setEntity(entity: Entity | null): this {
    this._entity = entity || null;
    this.recalculation();
    this.applyChanges();
    return this;
  }
  /**
   * Существет ли ключ сущности в данной комнате
   * @param key ключ
   * @returns boolean
   */
  async existsEntityKey(key: string): Promise<boolean> {
    const keys = await this.getEntityKeys();
    return Boolean(keys.find((k) => k === key));
  }

  /** Получить главную сущность комнаты */
  get entity() {
    return this.getEntity();
  }
  /**
   * Присвоение новой главной сущности.
   */
  set entity(entity: Entity | null) {
    this.setEntity(entity);
  }

  /**
   * Получение ключей сущностей, находящихся в текущей комнате.
   * @returns массив ключей.
   */
  async getEntityKeys(): Promise<string[]> {
    if (!this._entity) return [];
    const shells = await this.engine.findDynasty(this._entity.key);
    return shells.map((sh) => sh.options.key);
  }

  /**
   * Находится ли в комнате один или более подписчиков.
   * @returns
   */
  isEmpty(): boolean {
    return !this.subscribers.size;
  }

  /** метод удаления комнаты. */
  destroy(): void {
    for (const iterator of this.subscribers.values()) {
      iterator.data.rooms = [
        ...iterator.data.rooms.filter((r) => r !== this.key),
      ];
    }
    if (this._entity) {
      this.roomController
        .isEntityOpen(this._entity?.key, <any>this.key)
        .then((flag) => {
          if (!flag) {
            this.engine.unloadToKey(this._entity!.key);
          }
        });
    }
    this.subscribers.clear();
  }

  /** Получить ключ комнаты */
  getKey(): T {
    return this._key;
  }

  /** Получить ключ комнаты */
  get key(): T {
    return this.getKey();
  }

  /** Метод обновления комнатыю */
  async update(dt: number): Promise<void> {
    // Обновление комнаты
  }

  /** Итератор, итерируемый объект Subscriber */
  [Symbol.iterator] = (): IterableIterator<U> => {
    return this.subscribers.values();
  };
}

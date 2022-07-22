import { Engine } from "../Engine";
import Entity from "../Entity";
import DefaultRoom from "./DefaultRoom";
import Room from "./Room";

export default abstract class RoomControllerHeart<
  T extends any = string,
  U extends Room = Room
> {
  protected engine: Engine;
  protected rooms: Map<T, U>;

  constructor(engine: Engine) {
    this.engine = engine;
    this.rooms = new Map<T, U>();
  }

  protected roomEvents() {
    const timers = this.engine.timers;
    timers.create("Checking for empty rooms", 60, this.сheckingRooms);
  }

  /**
   * Открывает текущую или создает новую комнату.
   * приниает в качестве аргумента ключ комнаты, и две callback функции
   * @param key ключ комнаты
   * @param finall функция, аргументы которой являються ошибка, в случае неудачи, и второй аргумент, комната.
   * @param createRoom В случае, если необходимо создать нестандартный объект комнаты. В качестве аргументов, принимает набор для создания Room
   */
  openRoom<R extends U>(
    key: T,
    finall: (err: Error | null, room: R | null) => void,
    createRoom?: (...args: [key: T, engine: Engine, entity: Entity]) => R
  ): void {
    try {
      const loadedRoom = this.getRoomToKey(key);
      if (!loadedRoom) {
        this.engine.creator.open(<string>key).then((entity) => {
          if (!entity)
            return finall(
              new Error(`Сущность с ключем "${key}" не существует.`),
              null
            );
          if (createRoom && typeof createRoom === "function") {
            return finall(
              null,
              this.add(key, createRoom(key, this.engine, entity))
            );
          } else {
            return finall(
              null,
              this.add<R>(
                key,
                <R>(<unknown>new DefaultRoom(<string>key, this.engine, entity))
              )
            );
          }
        });
      } else {
        finall(null, <R>loadedRoom);
      }
    } catch (e) {
      throw e;
    }
  }

  /**
   * Поиск первой комнаты, в которой открыта сущность.
   * @param key ключ сущности.
   * @returns Комната или null
   */
  async findRoomToEntityKey(key: string): Promise<U | null> {
    let result: U | null = null;
    for (const room of this.rooms.values()) {
      const findedKey = (await room.getEntityKeys()).find((k) => k === key);
      if (findedKey) {
        result = room;
        break;
      }
    }
    return result;
  }

  /**
   * Получение комнаты по ключу
   * @param key ключ комнаты
   * @returns комната или null
   */
  getRoomToKey(key: T): U | null {
    if (!this.rooms.has(key)) return null;
    return this.rooms.get(key) || null;
  }

  /** Обновление такта для всех комнат. */
  async update(dt: number): Promise<void> {
    this.rooms.forEach((room) => room.update(dt));
  }

  /**
   * Проверка комнат, на наличие подписчиков. В случае если комната пуста, она будет удалена.
   */
  async сheckingRooms(
    stop: true,
    currentTime: number,
    next: (time: number) => void
  ) {
    try {
      for (const room of this.rooms.values()) {
        if (room.isEmpty()) {
          this.remove(<T>room.key);
        }
      }
    } catch (e) {
      throw e;
    }
  }

  /**
   * Удаление комнаты
   * @param roomKey ключ комнаты
   * @returns boolean
   */
  remove(roomKey: T): boolean {
    this.rooms.get(roomKey)?.destroy();
    return this.rooms.delete(roomKey);
  }
  /**
   * Добавление комнаты
   * @param roomKey ключ комнаты.
   * @param room комната.
   * @returns this
   */
  add<R extends U>(roomKey: T, room: R): R {
    this.rooms.set(roomKey, room);
    return room;
  }
  /**
   * Количество комнат.
   * @returns number
   */
  count(): number {
    return this.rooms.size;
  }
  /** Очистка, удаление всех комнат, с вызовом метода destroy */
  clear(): this {
    this.rooms.forEach((room) => room.destroy());
    this.rooms.clear();
    return this;
  }
  /** Получить списк (массив) комнат */
  entries(): U[] {
    return [...this.rooms.values()];
  }

  async isEntityOpen(
    entityKey: string,
    excludeRoomKey?: string
  ): Promise<boolean> {
    let result: boolean = false;
    for (const iterator of this.rooms.values()) {
      if (excludeRoomKey && iterator.key === excludeRoomKey) {
        continue;
      }
      const candidate = (await iterator.getEntityKeys()).find(
        (key) => key === entityKey
      );
      if (candidate) {
        result = true;
        break;
      }
    }
    return result;
  }
  /**
   * Уведомление комнат
   * @param args аргументы
   */
  abstract notify(...args: any[]): void;

  /**
   * Итератор по умолчанию.
   * @returns итерируемый объект комнат
   */
  [Symbol.iterator] = (): IterableIterator<U> => {
    return this.rooms.values();
  };
}

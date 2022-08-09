import Engine, { Entity, Room } from "..";

export type SystemNext = (...args: any[]) => void;

export abstract class EntitySysyem {
  public index: number = 0;
  protected entities: Entity[] = [];

  protected isProcessing: boolean = true;
  private _room?: Room;
  private _engine: Engine | undefined;

  constructor(...args: any[]) {}

  public setRoom(room: Room) {
    this._room = room;
    this._engine = room.getEngine();
  }

  /**
   * Функция вызывается автоматически, один раз, после добавления системы в комнату.
   * @param engine
   */
  public abstract addedToEngine(engine: Engine): void;
  /**
   * Функция вызывается автоматичеески один раз, после удаления системы из комнаты.
   * @param engine
   */
  public abstract removedFromEngine(engine: Engine): void;
  /**
   * Функция вызывается автоматически, каждый такт, передавая в качестве аргумента deltatime
   * @param deltaTime
   */
  public abstract update(deltaTime: number): Promise<void>;
  /**
   * возвращает флаг isProcessing
   */
  public abstract checkProcessing(): boolean;
  /**
   * Задает флаг, для пропуска/активации системы.
   * @param isProcessing - boolean;
   */
  public abstract setProcessing(isProcessing: boolean): void;
  /**
   * Функция processing вызывается автомастически, после запуска систем.
   * Для продолжения, необходимо использовать функцию next (calback)
   * @param next - calback функция.
   * @param args - Любые параметры, передаются по средствам функции next
   */
  public abstract processing(next: SystemNext, ...args: any[]): Promise<void>;
  /**
   * Получить инстанс двигателя.
   */
  public get engine(): Engine {
    return this._engine!;
  }
  /**
   * Получить инстанс комнаты.
   */
  public get room(): Room {
    return this._room!;
  }
}

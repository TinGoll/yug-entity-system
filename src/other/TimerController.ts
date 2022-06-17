interface ITimer<T extends any = string> {
    key: T;
    time: number;
    current: number;
    callback?: (stop: true, currentTime: number, next: (time: number) => void) => void | boolean;
    looping: boolean;
}

export default class TimerController<T extends any = string> extends Map<T, ITimer<T>> {
    /**
     * Конструктор
     * @param entries массив таймеров, опционально.
     */
    constructor(entries?: readonly (readonly [T, ITimer<T>])[] | null) {
        super(entries);
    }

    /**
     * Создать новый таймер
     * Таймер принимает функцию, которая будет вызвана по окончанию времени, указанного
     * во втором аргументе. В функцию будут переданы три аргумента. 
     * @param stop - return stop в нутри функции, что бы остановить и удалить таймер
     * @param currentTime  текущее время сработки таймера, в секундах
     * @param next  Функция, принимающая новое время для таймера.
     * 
     * @param name имя таймера, если повториться, будет перезаписан
     * @param time количество секунд
     * @param callback функция, которая выполниться при достижении времени
     * @param looping будет ли повторяться таймер
     * @returns this
     */
    create(name: T, time: number = 0, callback: (stop: true, currentTime: number, next: (time: number) => void) => void, looping: boolean = true,): this {
        this.set(name, {
            key: name,
            current: 0,
            time,
            callback,
            looping
        })
        return this;
    }

    /**
     * Функция обновления таймеров.
     * @param dt время прошедшее между тактами в секундах.
     */
    async update(dt: number): Promise<void> {
        this.forEach(val => {
            if (val.time > 0) {
                val.current = val.current ? val.current += dt : dt;
                if (val.current >= val.time) {
                    const taktTime = val.current;
                    val.current = 0;
                    if (val.callback && typeof val.callback === "function") {
                        const stop = val.callback(true, val.time, (time) => {
                            val.time = time;
                        });
                        if (stop) val.looping = false;
                    }
                    if (!val.looping) this.delete(val.key);
                }
            }
        })
    }
}

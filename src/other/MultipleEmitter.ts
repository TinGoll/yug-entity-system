interface MultipleEvent { [key: string | symbol]: Array<(...args: any[]) => Promise<any>> }
type EventListener = (...args: any[]) => Promise<any>;
type UnsubscribeFunction = () => void;

export default class MultipleEmitter {
    private singleEvents: MultipleEvent;
    constructor() {
        this.singleEvents = {};
    }
    /**
     * Прослушивание событий. 
     * @param eventName Название события
     * @param listener Функция, может возвращать данные (Массив данных, от каждой реализации).
     * @returns Функция для удаления подписки.
     */
    on(eventName: string, listener: EventListener): UnsubscribeFunction {
        if (!this.singleEvents[eventName]) {
            this.singleEvents[eventName] = [];
        }
        this.singleEvents[eventName].push(listener);
        return () => this.singleEvents[eventName] = this.singleEvents[eventName].filter(eventFn => listener !== eventFn);;
    }

    /**
     * Инициация события.
     * @param eventName Название события
     * @param args Список аргументов, которые нужно передать исполнителю.
     * @returns Результат выполнения функции - подписчика.
     */
    async emit(eventName: string, ...args: any[]): Promise<any> {
        const events = this.singleEvents[eventName];
        if (events && Array.isArray(events) && events.length) {
            return Promise.all( events.map(async (e) => {
                if (e && typeof e === "function") {
                    return e.call(null, ...args);
                } 
                return;
            }));
        }
    }
    
    /**
     * Количество подписок.
     * @returns Число
     */
    count(): number {
        return Object.entries(this.singleEvents).reduce<number>((acc, e) => {
            return acc += ( e[1]?.length || 0 );
        }, 0)    
    }
}
interface SingleEvent { [key: string | symbol]: ((...args: any[]) => Promise<any>) | undefined }
type EventListener = (...args: any[]) => Promise<any>;
type UnsubscribeFunction = () => void;

export default class SingleEmitter {
    private events: SingleEvent;
    constructor() {
        this.events = {};
    }
    /**
     * Прослушивание событий. 
     * @param eventName Название события
     * @param listener Функция, может возвращать данные.
     * @returns Функция для удаления подписки.
     */
    on(eventName: string, listener: EventListener): UnsubscribeFunction {
        if (this.events[eventName]) {
            console.group(`Single Event On <${new Date().toLocaleTimeString()}> warning:`);
            console.log(`Событие: ${eventName}, может содержать только одну подписку вызова.`);
            console.log(`Предыдущая функция, была заменена на новую.`);
            console.log(`Чтобы оставить контроль над этим событием, объявите только одну подписку с таким именем.`);
            console.log(`********************************************`);
            console.groupEnd();
        }
        this.events[eventName] = listener;
        return () => this.events[eventName] = undefined;
    }

    /**
     * Инициация события.
     * @param eventName Название события
     * @param args Список аргументов, которые нужно передать исполнителю.
     * @returns Результат выполнения функции - подписчика.
     */
    async emit(eventName: string, ...args: any[]): Promise<any> {
        try {
            const event = this.events[eventName];
            if (event && typeof event === "function") {
                return event.call(null, ...args);
            }
            console.group(`Single Event Emmit <${new Date().toLocaleTimeString()}> warning:`);
            console.log(`Событие: ${eventName}, не содержит реализации.`);
            console.log(`Чтобы данная процедура имела смысл, реализуйте прослушивание события`);
            console.log(`********************************************`);
            console.groupEnd();
        } catch (error) {
            throw error;
        }
    }
    /**
     * Удаление события.
     * @param eventName Название события
     * @returns правда / ложь
     */
    remove(eventName: string): boolean {
        if (this.events[eventName]) {
            console.group(`Single Event Remove <${new Date().toLocaleTimeString()}> info:`);
            console.log(`Событие: ${eventName}, удалено`);
            console.log(`********************************************`);
            console.groupEnd();
            this.events[eventName] = undefined;
            return true;
        }
        return false;
    }
    /**
     * Количество подписок.
     * @returns Число
     */
    count (): number {
        return Object.entries(this.events).filter(e => typeof e[1] === "boolean").length
    }

    /**
     * Очистка всех подписок
     */
    clear () {
        this.events = {}
    }
}
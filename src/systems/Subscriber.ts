export interface Subscriber<K extends any = string, 
        U extends object | null = {}> {
    /**
     * id подписчика
     */
    id: any;
    /**
     * Если живой
     */
    isAlive: boolean;
    /**
     * Авторизован
     */
    isAuth: boolean;
    /**
     * ip отправителя (клиента)
     */
    ip: string;
    /**
     * Токен доступа
     */
    token?: string;
    /**
     * Ключ подпискичка
     */
    key: string;
    /**
     * Список комнат комнат
     */
    rooms: Array<K>
    /**
     * Объект пользователя.
     */
    user: U;
}
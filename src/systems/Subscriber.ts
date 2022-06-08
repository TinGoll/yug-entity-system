export interface Subscriber<K extends any = string, 
        U extends any | null = any> {
    data: SubscriberData<K, U>
}

export interface SubscriberData<K extends any = string,
    U extends any | null = any> {
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
    key: K;
    /**
     * Список комнат комнат
     */
    rooms: Array<K>
    /**
     * Объект пользователя.
     */
    user: U;
}
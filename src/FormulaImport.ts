
/**
 * Класс для создания и подготовки к отправке импортов для формул.
 * Работает не только со строковыми импортами, но и с импортами в виде объектов.
 * v 1.0.5
 */
export class FormulaImport<T extends object | string = string> extends Set {
    public static separator: string = ' /*~*/\n';
    constructor(values?: readonly T[]) {
        super(values)
    }

    loadStringData (txt?: string): FormulaImport<T> {
        if (!txt || typeof txt !== "string") return this;
        if (this.size) {
            const it = this.values().next();
            if (typeof it.value !== "string") 
                throw new Error("Коллекция содержит объекты, загрузка строковых данных невозможна.")
        }
        const arr = txt.split(FormulaImport.separator);
        for (const iterator of arr) {
            this.add(iterator)
        }
        return this;
    }

    /**
     * Добавление значения в импорт.
     * @param value строковое значение или объект, определяеться дженериком.
     * @returns возвращает FormulaImport;
     */
    push (value?: T): FormulaImport<T> {
        if (!value || this.exist(value)) return this;
        this.add(value);
        return this;
    }
    /**
     * Очистка импорта
     */
    reset (): void {
        this.clear();
    }
    /**
     * Удаление конкретного импорта
     * @param value строковое значение или объект, определяеться дженериком.
     * @returns bool значение.
     */
    remove(value?: T | null, callback?: (value: T) => boolean | any): boolean {
        if (callback && typeof callback === "function") {
            this.forEach((val, val2, set) => {
                if (!!callback(val)) {
                    this.delete(val);
                }
            })
        }
        if (!value) return false;
        return this.delete(value)
    }
    /**
     * Формирует строку импорта для отправки на сервер.
     * @param callback Каллбэк функция, в случае, если используеться объект, определенного типа. Опционально.
     * @returns строка.
     */
    build (callback?: (element: T) => string | undefined): string {

        if (callback && typeof callback === "function") {
            let str: string = '';
            for (const iterator of this.entries()) {
                const item = `${callback(iterator[1])}`.trim();
                str += `${item}\n`;
            }
            return str;
        } else {
            const formulaIterator = this.values();
            const next = formulaIterator.next()
            if (next.done) return '';
            if (typeof next.value === "undefined") return '';
            if (typeof next.value === "string") {
                return (<Array<string>>[...this]).join(FormulaImport.separator);
            }else {
                throw new Error("Тип объекта, переданный в FormulaImport, не является строкой, используй callback");
            }
        }
    }
    /**
     * Объеденение двух импортов формул
     * @param fi Импорт формул, который необходимо слить с текущим.
     * @returns FormulaImport
     */
    union(fi: FormulaImport): FormulaImport<T> {
        const iteratorA = this.values();
        const iteratorB = fi.values();
        if (iteratorB.next().done) return this;
        const valA = iteratorA.next().value;
        const valB = iteratorB.next().value;
        if (typeof valA !== typeof valB) throw new Error("Импорты должны быть одного типа.");
        for (const iterator of fi) {
            if (!this.exist(iterator)) {
                this.add(iterator)
            }
        }
        return this;
    }

    /**
     * Существует ли елемент в коллекции.
     * @param value 
     * @returns 
     */
    exist (value: T): boolean {
        if (typeof value === "object") {
            for (const iterator of this) {
                if (this.isEqual(value, iterator)) return true;
            }
        } else if (typeof value === "string") {
            return this.has(value);
        } else {
            for (const iterator of this) {
                if (iterator === value) return true;
            }
        }
        return false;
    }

    /**
     * Глубокое сравнение объектов.
     * @param objA Первыфй объект.
     * @param objB второй объект.
     * @returns bool
     */
    private isEqual(objA: any, objB: any) {
        const props1 = Object.getOwnPropertyNames(objA);
        const props2 = Object.getOwnPropertyNames(objB);
        if (props1.length !== props2.length) {
            return false;
        }
        for (let i = 0; i < props1.length; i += 1) {
            const prop = props1[i];
            const bothAreObjects = typeof (objA[prop]) === 'object' && typeof (objB[prop]) === 'object';
            if ((!bothAreObjects && (objA[prop] !== objB[prop]))
                || (bothAreObjects && !this.isEqual(objA[prop], objB[prop]))) {
                return false;
            }
        }
        return true;
    }
}




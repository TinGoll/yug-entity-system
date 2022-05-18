
/**
 * Класс для создания и подготовки к отправке импортов для формул.
 * Работает не только со строковыми импортами, но и с импортами в виде объектов.
 */
export class FormulaImport<T extends object | string = string> extends Set {
    constructor(values?: readonly T[]) {
        super(values)
    }
    /**
     * Добавление значения в импорт.
     * @param value строковое значение или объект, определяеться дженериком.
     * @returns возвращает FormulaImport;
     */
    push (value: T): FormulaImport<T> {
        if (this.exist(value)) return this;
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
    remove(value: T): boolean {
        return this.delete(value)
    }
    /**
     * Формирует строку импорта для отправки на сервер.
     * @param callback Каллбэк функция, в случае, если используеться объект, определенного типа. Опционально.
     * @returns строка.
     */
    build (callback?: (element: T) => string): string {
        if (callback && typeof callback === "function") {
            let str: string = '';
            for (const iterator of this.entries()) {
                const item = `${callback(iterator[1])}`.trim();
                str += `${item}\n`;
            }
            return str;
        } else {
            const formulaIterator = this.values();
            if (formulaIterator.next().done) return '';
  
            if (typeof formulaIterator.next().value === "string") {
                return (<Array<string>>[...this]).join(`\n`);
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

    exist (value: T): boolean {
        if (typeof value === "object") {
            for (const iterator of this) {
                if (this.isEqual(value, iterator)) return true;
            }
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




import { ApiComponent, PropertyType, PropertyValue } from "./@engine-types";
import Entity from "./Entity";

/** Интерфейс кнопок, для отображения в редакторе формул. */
interface FormulaButton {
    group: string;
    components: Array<{
        componentName: string,
        buttons: Array<{ name: string, value: string }>
        setters: Array<{ name: string, value: string }>
    }>;
}

// Интерфейс аккумулятора.
interface AccomulatorOptions {
    me?: boolean;
    categories?: Array<string>;
    names?: Array<string>;
    valueCondition?: (value: PropertyValue) => boolean;
    entityCondition?: (ent: Entity) => boolean;
}

// Ключ значение
interface IKeysMap {
    [index: string]: string;
}

type ThisIs = "me" | "father" | "grand_father" | undefined;

interface FormulaExecutor {
    KEY: string;
    ENTITY_NAME: string
    COMPONENT_NAME: string;
    COMPONENT_DESC: string;
    PROPERTY_NAME: string;
    PROPERTY_DESC: string;
    GETTER_NAME: string;
    SETTER_NAME: string;
    ENTITY_NOTE: string;
    PROPERTY_TYPE: PropertyType;
    IS_CURRENT_PROPERTY: boolean;
    CODE: string;
}

/** ***************************************************** */
// Нормализация значние
function normalizeValue(value: PropertyValue | null, type?: PropertyType): PropertyValue | null {
    let tempValue;
    if (value === null) return value;
    switch (type) {
        case 'string': tempValue = String(value);
            break;
        case 'boolean': tempValue = Boolean(value);
            break;
        case 'number': tempValue = Number(value);
            break;
        case 'date': tempValue = new Date(<string>value);
            break;
        default: tempValue = String(value);
    }
    return tempValue;
}
/** ***************************************************** */

// TODO
// Переписать с использованием класса.
class FormulaExecutor {
    constructor() {
        
    }
}

export async function formulaExecutor(this: Entity, 
    { componentName, propertyName, propertyValue, key, propertyType, ...other }: ApiComponent, 
    code: string = '', type: 'execution' | 'preparation' = 'execution', onError?: (err: Error) => void) {
    try {
        const me = this;
        const father = await me.getParent();            // Родительская сущность
        const childs = await me.getChildren();          // Дочерние сущности
        const brothers = await me.getBrothers();        // Братские сущности
        const grand_father = await me.getOverEntity();  // Родительская сущность
        const entities = await me.getDynasty();         // Все зависимые сущности
    
        const EXECUTORS = new Map<string, FormulaExecutor>();
    
        // Получение значения комопнента текущей сущности
        const ME = async (cmpName: string, probName: string): Promise<PropertyValue | null> => {
            try {return me.getValue(cmpName, probName);
            } catch (e) { console.log('Formula => ME', (e as Error).message); return null; }
        }
        // присвоение значения комопненту текущей сущности.
        const S_ME = (cmpName: string, probName: string, value: PropertyValue): void => {
            try { me.setValue(cmpName, probName, value, true); return}
            catch (e) {console.log('Formula => S_ME', (e as Error).message);}
        }
        // Получение значения комопнента родительской сущности
        const FATHER = async (cmpName: string, probName: string): Promise<PropertyValue | null> => {
            try {return father?.getValue(cmpName, probName) || null;
            } catch (e) { console.log('Formula => FATHER', (e as Error).message); return null; }
        }
        // присвоение значения комопненту родительской сущности.
        const S_FATHER = (cmpName: string, probName: string, value: PropertyValue): void => {
            try { me.setValue(cmpName, probName, value, true); }
            catch (e) { console.log('Formula => S_FATHER', (e as Error).message); }
        }
        // Получение значения комопнента высшей сущности
        const GRAND_FATHER = async (cmpName: string, probName: string): Promise<PropertyValue | null> => {
            try {return grand_father?.getValue(cmpName, probName) || null;
            } catch (e) { console.log('Formula => GRAND_FATHER', (e as Error).message); return null; }
        }
        // присвоение значения комопненту высшей сущности.
        const S_GRAND_FATHER = (cmpName: string, probName: string, value: PropertyValue): void => {
            try { if (!grand_father) throw new Error("Родительский объект не существует."); me.setValue(cmpName, probName, value, true); }
            catch (e) { console.log('Formula => S_GRAND_FATHER', (e as Error).message);}
        }
        // Получить значение комопнента дочерней сущности.
        const CHILDS = async (entityName: string, note: string | undefined = undefined, cmpName: string, probName: string): Promise<PropertyValue | null> => {
            try {
                const index = childs.findIndex(b => b.name.toUpperCase() === entityName.toUpperCase()
                    && b.note.toUpperCase() === (note || '').toUpperCase());
                if (index === -1) return null;
                return await childs[index].getValue(cmpName, probName);
            } catch (e) {
                console.log('Formula => CHILDS', (e as Error).message);
                return null;
            }
        }
        // Присвоить значение комопнента дочерней сущности.
        const S_CHILDS = (entityName: string, note: string | undefined = undefined, cmpName: string, probName: string, value: string): void => {
            try {
                const index = childs.findIndex(b => b.name.toUpperCase() === entityName.toUpperCase()
                    && b.note.toUpperCase() === (note || '').toUpperCase());
                if (index === -1) return;
                childs[index].setValue(cmpName, probName, value, false);
            } catch (e) {
                console.log('Formula => S_CHILDS', (e as Error).message);
            }
        }

        const BROTHERS = async (entityName: string, note: string | undefined = undefined, cmpName: string, probName: string): Promise<PropertyValue | null> => {
            try {
                const index = brothers.findIndex(b => b.name.toUpperCase() === entityName.toUpperCase()
                    && (b.note || "").toUpperCase() === (note || '').toUpperCase());
                if (index === -1) return null;
                return brothers[index].getValue(cmpName, probName);
            } catch (e) {
                console.log('Formula => BROTHERS', (e as Error).message);
                return null;
            }
        }
    
        /** ************************************** */
        /** ************* Функции **************** */
        function ROUND(number: number = 0, fixed: number = 0) {
            return Number(number).toFixed(fixed)
        }
    
        function RUB(number: string = '0') {
            const num = number.replace(/[^0-9,.]/g, '');
            return Number(num).toLocaleString('ru-RU', { style: 'currency', currency: 'RUB' });
        }
    
        function COSINUS(number: number = 0) {
            return Math.cos(Number(number) * Math.PI / 180);
        }
    
        // Текущее значение свойства компонента.
        const THIS = normalizeValue(propertyValue, propertyType);
    
        // Определение комопнентов для ME
        for (const cmp of me.getComponents()) {
            const KEY = `me-${cmp.componentName}-${cmp.propertyName}`.toLocaleLowerCase(); // +
            const IS_CURRENT_PROPERTY = (key === cmp.key); // +
            const ENTITY_NAME = me.name; // Название сущности.  // +
            const ENTITY_NOTE = me.note; // note :) // +
            const COMPONENT_NAME = cmp.componentName; // Название компонента. // +
            const COMPONENT_DESC = cmp.componentDescription; // Название на русском. // +
            const PROPERTY_NAME = cmp.propertyName; // Название свойства. // +
            const PROPERTY_DESC = cmp.propertyDescription; // Название свойства на русском.  // +
            const PROPERTY_TYPE = cmp.propertyType || "string"; // Тип свойства.  // +
    
            const GETTER_NAME = IS_CURRENT_PROPERTY ? `THIS` : `(await ME("${COMPONENT_NAME}", "${PROPERTY_NAME}"))`;
            const SETTER_NAME = `S_ME("${COMPONENT_NAME}", "${PROPERTY_NAME}", /*(${cmp.propertyType})*/ )`;
            const CODE = '';
            EXECUTORS.set(KEY, {
                KEY, ENTITY_NAME, COMPONENT_NAME, COMPONENT_DESC,
                PROPERTY_NAME, PROPERTY_DESC, GETTER_NAME, SETTER_NAME,
                ENTITY_NOTE, IS_CURRENT_PROPERTY, PROPERTY_TYPE, CODE
            })
        }
    
        // Определение комопнентов для FATHER
        for (const cmp of father?.getComponents() || []) {
            const KEY = `father-${cmp.componentName}-${cmp.propertyName}`.toLocaleLowerCase(); // +
            const IS_CURRENT_PROPERTY = (key === cmp.key); // +
            const ENTITY_NAME = me.name; // Название сущности.  // +
            const ENTITY_NOTE = me.note; // note :) // +
            const COMPONENT_NAME = cmp.componentName; // Название компонента. // +
            const COMPONENT_DESC = cmp.componentDescription; // Название на русском. // +
            const PROPERTY_NAME = cmp.propertyName; // Название свойства. // +
            const PROPERTY_DESC = cmp.propertyDescription; // Название свойства на русском.  // +
            const PROPERTY_TYPE = cmp.propertyType || "string"; // Тип свойства.  // +
    
            const GETTER_NAME = `(await FATHER("${COMPONENT_NAME}", "${PROPERTY_NAME}"))`;
            const SETTER_NAME = `S_FATHER("${COMPONENT_NAME}", "${PROPERTY_NAME}", /*(${cmp.propertyType})*/ )`;
            const CODE = '';
            EXECUTORS.set(KEY, {
                KEY, ENTITY_NAME, COMPONENT_NAME, COMPONENT_DESC,
                PROPERTY_NAME, PROPERTY_DESC, GETTER_NAME, SETTER_NAME,
                ENTITY_NOTE, IS_CURRENT_PROPERTY, PROPERTY_TYPE, CODE
            })
        }
    
        // Определение комопнентов для GRAND_FATHER
        for (const cmp of grand_father?.getComponents() || []) {
            const KEY = `grand_father-${cmp.componentName}-${cmp.propertyName}`.toLocaleLowerCase(); // +
            const IS_CURRENT_PROPERTY = (key === cmp.key); // +
            const ENTITY_NAME = me.name; // Название сущности.  // +
            const ENTITY_NOTE = me.note; // note :) // +
            const COMPONENT_NAME = cmp.componentName; // Название компонента. // +
            const COMPONENT_DESC = cmp.componentDescription; // Название на русском. // +
            const PROPERTY_NAME = cmp.propertyName; // Название свойства. // +
            const PROPERTY_DESC = cmp.propertyDescription; // Название свойства на русском.  // +
            const PROPERTY_TYPE = cmp.propertyType || "string"; // Тип свойства.  // +
    
            const GETTER_NAME = `(await GRAND_FATHER("${COMPONENT_NAME}", "${PROPERTY_NAME}"))`;
            const SETTER_NAME = `S_GRAND_FATHER("${COMPONENT_NAME}", "${PROPERTY_NAME}", /*(${cmp.propertyType})*/ )`;
            const CODE = '';
            EXECUTORS.set(KEY, {
                KEY, ENTITY_NAME, COMPONENT_NAME, COMPONENT_DESC,
                PROPERTY_NAME, PROPERTY_DESC, GETTER_NAME, SETTER_NAME,
                ENTITY_NOTE, IS_CURRENT_PROPERTY, PROPERTY_TYPE, CODE
            })
        }
        // Формирование кода.
        const trainedVariables = 'Q,W,E,R,T,Y,U,I,O,P,A,S,D,F,G,H,J,K,L,X,C,V,B,N,M'
        const VARIABLES = [...new Set( trainedVariables
        .split(',').reduce<string[]>((acc, item, index, arr) => 
            [...acc, ...arr.map(v => `${v}${item}`)], []))]
            .filter(v => v !== 'PI' && v !== 'ME').join(',')
        const baseCode = `
            const executor = async () => {
                    let ${trainedVariables};
                    let ${VARIABLES};
                    let PI = Math.PI;
                    let RESULT = THIS;
                    ${String(code)}
                    return RESULT;
            }
    
            executor();`;
        console.log("baseCode", baseCode);
        
        if (type === 'execution') return eval(baseCode);
            
        // Конец выполнения.

        const clientButtons: FormulaButton[] = [];
        const executorArr = [...EXECUTORS].map(e => e[1]);

        // Формирвоание уникальных групп
        const groupSet = [...new Set(executorArr.map(e => (e.ENTITY_NAME + '~' + e.ENTITY_NOTE)))]
            .map(g => g.split("~")).map(g => ({ name: g[0], note: g[1] || '' }));

        for (const group of groupSet) {
            const componentNames = [...new Set(executorArr.filter(e => e.ENTITY_NAME === group.name && e.ENTITY_NOTE === group.note).map(e => e.COMPONENT_NAME))];
            const components: Array<{
                componentName: string,
                buttons: Array<{ name: string, value: string, }>
                setters: Array<{ name: string, value: string, }>
            }> = [];
            for (const componentName of componentNames) {

                const buttons: Array<{ name: string, value: string, }> = [];
                const setters: Array<{ name: string, value: string, }> = [];
                // Кнопки получения данных
                buttons.push(...executorArr.filter(e => e.ENTITY_NAME === group.name && e.ENTITY_NOTE === group.note && e.COMPONENT_NAME === componentName)
                    .map(e => ({ name: e.PROPERTY_DESC, value: ` = ${e.GETTER_NAME}; // ${e.PROPERTY_TYPE}` })));

                // Кнопки присвоения данных
                setters.push(...executorArr.filter(e => e.ENTITY_NAME === group.name && e.ENTITY_NOTE === group.note && e.COMPONENT_NAME === componentName)
                    .map(e => ({ name: e.PROPERTY_DESC, value: e.IS_CURRENT_PROPERTY ? '/* Используйте RESULT */' : `${e.SETTER_NAME};` })));
                buttons.push({ name: 'РЕЗУЛЬТАТ', value: 'RESULT = ' });
                components.push({
                    componentName,
                    buttons,
                    setters
                });
            }
            clientButtons.push({
                group: `${group.name}${(!group.note || group.note === '') ? '' : ' (' + group.note + ')'}`,
                components
            });
        }

        clientButtons.unshift({
            group: "Окружение",
            components: [
                {
                    componentName: "Функции окружения",
                    buttons: [
                        { name: "Текущая сущность", value: 'ME("Компонент", "Свойство") ' },
                        { name: "Родительская сущность", value: father ? 'FATHER("Компонент", "Свойство") ' : '/*FATHER("Компонент", "Свойство") - undefined :p */' },
                        { name: "Высшая сущность", value: grand_father ? 'GRAND_FATHER("Компонент", "Свойство") ' : '/*GRAND_FATHER("Компонент", "Свойство") - undefined :p */' },
                        { name: "Братья", value: 'BROTHERS("Название сущности", "Заметка", "Компонент", "Свойство") ' },
                        { name: "Дочерние сущности", value: 'CHILDS("Название сущности", "Заметка", "Компонент", "Свойство") ' },
                        { name: "Округление", value: 'ROUND(0, 3)' },
                        { name: "Результат", value: 'RESULT = ' },
                    ],
                    setters: [
                        { name: "Текущая сущность", value: 'S_ME("Компонент", "Свойство", "Значение") ' },
                        { name: "Родительская сущность", value: 'S_FATHER("Компонент", "Свойство", "Значение") ' },
                        { name: "Высшая сущность", value: 'S_GRAND_FATHER("Компонент", "Свойство", "Значение") ' },
                        { name: "Братья", value: 'S_BROTHERS("Название сущности", "Заметка", "Компонент", "Свойство", "Значение") ' },
                        { name: "Дочерние сущности", value: 'S_CHILDS("Название сущности", "Заметка", "Компонент", "Свойство", "Значение") ' },
                        { name: "Результат", value: 'RESULT = ' },
                    ],
                },
            ]

        });

        let startCode = '';
        startCode += `/*************************************************************/\n`;
        startCode += `/*  RESULT - в эту переменную внесите результат.             */\n`;
        startCode += `/*  Переменные окружения, позволяют получить доступ к        */\n`;
        startCode += `/*  свойствам компонентов по названию.                       */\n`;
        startCode += `/*  me, father, childs, brothers, grand_father -             */\n`;
        startCode += `/*  прямой доступ к сущностям                                */\n`;
        startCode += `/*  THIS - текущее свойство, для получения значения, писать  */\n`;
        startCode += `/*  скобки не нужно. (RESULT = THIS).                        */\n`;
        startCode += `/*  Остальное в кнопках на панели. Писать в верхнем регистре.*/\n`;
        startCode += `/*************************************************************/\n`;
        startCode += `// Тут пишите ваш код, удачи!\n\n`;

        return { clientButtons, startCode }
    } catch (e) {
        if (onError && typeof onError === "function") onError(e as Error)
        console.log("FORMULA ERROR", (e as Error).message);
        return null;
    }
} 


/** ***************************************************** */
/** ***************** Функция транслита ***************** */
/** ***************************************************** */
function strtr(str: string): string {
    let txt = str.toLowerCase();
    let re = /[ |)|(]/gi;
    const trans: IKeysMap = {
        'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd',
        'е': 'e', 'ё': 'e', 'ж': 'zh', 'з': 'z', 'и': 'i',
        'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n',
        'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't',
        'у': 'u', 'ф': 'f', 'х': 'h', 'ц': 'c', 'ч': 'ch',
        'ш': 'sh', 'щ': 'sch', 'ь': '', 'ы': 'y', 'ъ': '',
        'э': 'e', 'ю': 'yu', 'я': 'ya'
    };
    for (var i = 0; i < txt.length; i++) {
        var f = txt.charAt(i),
            r = trans[f];
        if (r) {
            txt = txt.replace(new RegExp(f, 'g'), r);
        }
    }
    return txt.replace(/[\s.,%]/g, '').replace(re, '_').toUpperCase();
}
/** ***************************************************** */
/** ***************************************************** */
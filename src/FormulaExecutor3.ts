import Entity from "./Entity";
import { ApiComponent, PropertyTypes, PropertyValue } from "./types/engine-types";


interface FormulaComponentOptions extends Partial<ApiComponent> {
    key: string;
}
interface IKeysMap {
    [index: string]: string;
}

type FormulaGetters = () => PropertyValue | null;
type FormulaSetters = (value: PropertyValue) => void;

interface FormulaExecutor {
    KEY: string;
    GETTER: FormulaGetters;
    SETTER: FormulaSetters;
    ENTITY_NAME: string
    COMPONENT_NAME: string;
    COMPONENT_DESC: string;
    PROPERTY_NAME: string;
    PROPERTY_DESC: string;
    GETTER_NAME: string;
    SETTER_NAME: string;
    ENTITY_NOTE: string;
    IS_CURRENT_PROPERTY: boolean;
    CODE: string;
}

/** Интерфейс кнопок, для отображения в редакторе формул. */
interface FormulaButton {
    group: string;
    components: Array<{
        componentName: string,
        buttons: Array<{ name: string, value: string }>
        setters: Array<{ name: string, value: string }>
    }>;
}

type ThisIs = "me" | "father" | "grand_father" | undefined;

/** ***************************************************** */
/** ***************************************************** */
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


export function formulaExecutor3(this: Entity, { componentName, propertyName, propertyValue, key }: FormulaComponentOptions, code: string = '', type: 'execution' | 'preparation' = 'execution') {
    try {
        /** **************************************** */
        /** ********** Текущие значения ************ */
        const currentPropertyValue = propertyValue || null;
        const currentEntity = this;
        /** **************************************** */
        /** ****** Дополнительные переменные ******* */



        const me = currentEntity;
        const name = me.getName();
        const father = me.getParent();
        const childs = me.getChildren() || [];
        const brothers = father?.getChildren() || [];
        const grand_father = me.getGrandFather();

        /** **************************************** */
        const entities = grand_father?.getDynasty() || me.getDynasty();

        const EXECUTORS = new Map<string, FormulaExecutor>();

        const DUMMY_GET = () => null; // Пустышка геттер
        const DUMMY_SET = (value: string) => console.log('Недоступное свойство.'); // Пустышка сеттер.

        /** **************************************** */
        /** *********** Функции окружения ********** */
        /** **************************************** */
        
        const ME = (cmpName: string, probName: string): PropertyValue|null => {
            try {return me.getPropertyValue<PropertyValue, string>(cmpName, probName);
            } catch (e) {console.log(e); return null;}
        }
        const S_ME = (cmpName: string, probName: string, value: PropertyValue): void => {
            try {me.setPropertyValue<PropertyValue, string>(cmpName, probName, value);} 
            catch (e) {console.log(e);}
        }
        const FATHER = (cmpName: string, probName: string): PropertyValue | null => {
            try {return father?.getPropertyValue<PropertyValue, string>(cmpName, probName)||null;
            } catch (e) { console.log(e); return null; }
        }
        const S_FATHER = (cmpName: string, probName: string, value: PropertyValue): void => {
            try { if(!father) throw new Error("Родительский объект не существует."); me.setPropertyValue<PropertyValue, string>(cmpName, probName, value); }
            catch (e) { console.log(e); }
        }

        const GRAND_FATHER = (cmpName: string, probName: string): PropertyValue | null => {
            try {return grand_father?.getPropertyValue<PropertyValue, string>(cmpName, probName) || null;
            } catch (e) { console.log(e); return null; }
        }
        const S_GRAND_FATHER = (cmpName: string, probName: string, value: PropertyValue): void => {
            try { if (!grand_father) throw new Error("Родительский объект не существует."); me.setPropertyValue<PropertyValue, string>(cmpName, probName, value); }
            catch (e) { console.log(e); }
        }

        const BROTHERS = (entityName: string, note: string | undefined = undefined, cmpName: string, probName: string): PropertyValue|null => {
            try {
                const index = brothers.findIndex(b => b.name.toUpperCase() === entityName.toUpperCase() 
                        && b.note.toUpperCase() === (note || '').toUpperCase());
                if (index === -1) return null;
                return brothers[index].getPropertyValue<PropertyValue, string>(cmpName, probName);
            } catch (e) {
                console.log(e);
                return null;
            }
        }

        const S_BROTHERS = (entityName: string, note: string | undefined = undefined, cmpName: string, probName: string, value: string): void => {
            try {
                const index = brothers.findIndex(b => b.name.toUpperCase() === entityName.toUpperCase()
                    && b.note.toUpperCase() === (note || '').toUpperCase());
                if (index === -1) return;
                brothers[index].setPropertyValue<PropertyValue, string>(cmpName, probName, value);
            } catch (e) {
                console.log(e);
            }
        }
        const CHILDS = (entityName: string, note: string | undefined = undefined, cmpName: string, probName: string): PropertyValue | null => {
            try {
                const index = childs.findIndex(b => b.name.toUpperCase() === entityName.toUpperCase()
                    && b.note.toUpperCase() === (note || '').toUpperCase());
                if (index === -1) return null;
                return childs[index].getPropertyValue<PropertyValue, string>(cmpName, probName);
            } catch (e) {
                console.log(e);
                return null;
            }
        }

        const S_CHILDS = (entityName: string, note: string | undefined = undefined, cmpName: string, probName: string, value: string): void => {
            try {
                const index = childs.findIndex(b => b.name.toUpperCase() === entityName.toUpperCase()
                    && b.note.toUpperCase() === (note || '').toUpperCase());
                if (index === -1) return;
                childs[index].setPropertyValue<PropertyValue, string>(cmpName, probName, value);
            } catch (e) {
                console.log(e);
            }
        }

        /** **************************************** */
        /** **************************************** */
        /** **************************************** */

        const getNameExcutor = (thisIs: ThisIs, entity: Entity, cmp: ApiComponent): string => {
            if (thisIs === "me") return `ME_${cmp.propertyName}`;
            if (thisIs === "father") return `F_${cmp.propertyName}`;
            if (thisIs === "grand_father") return `GF_${cmp.propertyName}`;
            return `${strtr(entity.name)}_${strtr(entity.note)}_${cmp.propertyName}`;
        }

        //Executors
        for (const entity of entities) {
            for (const cmp of entity.getApiComponents()) {

                let THIS_IS: ThisIs = undefined;
                if (me.key === entity.key) THIS_IS = "me";
                if (father?.key === entity.key) THIS_IS = "father";
                if (grand_father?.key === entity.key) THIS_IS = "grand_father";
                const KEY = `Entity ${entity.name} Cmp ${cmp.componentName} Prob ${cmp.propertyName} Id ${cmp.id}`;
                const IS_CURRENT_PROPERTY = key === cmp.key;
            
                const PROPERTY_VALUE = cmp.propertyValue;
                const GETTER = entity.getterExecutor(cmp.componentName, cmp.propertyName);
                const SETTER = entity.setterExecutor(cmp.componentName, cmp.propertyName);
                const ENTITY_NAME = entity.name; // Название сущности.
                const ENTITY_NOTE = entity.note; // note :)
                const COMPONENT_NAME = cmp.componentName; // Название компонента.
                const COMPONENT_DESC = cmp.componentDescription; // Название на русском.
                const PROPERTY_NAME = `${getNameExcutor(THIS_IS, entity, cmp)}`; // Название свойства.
                const PROPERTY_DESC = cmp.propertyDescription; // Название свойства на русском.
                const GETTER_NAME = IS_CURRENT_PROPERTY ? `THIS` : `${PROPERTY_NAME.toUpperCase()}`;
                const SETTER_NAME = IS_CURRENT_PROPERTY ? `/* Используйте RESULT */` : `S_${PROPERTY_NAME.toUpperCase()}`; 
                const CODE = IS_CURRENT_PROPERTY
                    ? `const ${GETTER_NAME} = ${PROPERTY_VALUE}; const ${SETTER_NAME} = EXECUTORS.get("${KEY}")?.SETTER || DUMMY_GET;`
                    : `const ${GETTER_NAME} = EXECUTORS.get("${KEY}")?.GETTER || DUMMY_GET; const ${SETTER_NAME} = EXECUTORS.get("${KEY}")?.SETTER || DUMMY_SET;`
                EXECUTORS.set(KEY, {
                    KEY,
                    GETTER,
                    SETTER,
                    ENTITY_NAME,
                    COMPONENT_NAME,
                    COMPONENT_DESC,
                    PROPERTY_NAME,
                    PROPERTY_DESC,
                    GETTER_NAME,
                    SETTER_NAME,
                    ENTITY_NOTE,
                    IS_CURRENT_PROPERTY,
                    CODE
                })
            }
        }

        /** **************************************** */
        /** ************* Функции **************** */
        function ROUND(number: number, fixed: number) {
            return number.toFixed(fixed)
        }
        function RUB(number: number) {
            return number.toLocaleString('ru-RU', { style: 'currency', currency: 'RUB' });
        }
        function COSINUS(number: number) {
            return Math.cos(number * Math.PI / 180);
        }
        /** **************************************** */
        /** **************************************** */

        const arrCode: string[] = [];
        for (const EXCT of EXECUTORS.values()) {
            arrCode.push(EXCT.CODE)
        }

        const baseCode = `
        const executor = () => {
                ${arrCode.join('\n')}
                let Q,W,E,R,T,Y,U,I,O,P,A,S,D,F,G,H,J,K,L,X,C,V,B,N,M;
                let PI = Math.PI;
                let RESULT = currentPropertyValue; // Результат
                ${code}
                return RESULT;
        }
        executor();`;
        if (type === 'execution') return eval(baseCode);
        const clientButtons: FormulaButton[] = [];
        const executorArr = [...EXECUTORS].map(e => e[1]);
        const groupSet = [...new Set(executorArr.map(e => (e.ENTITY_NAME + '~' + e.ENTITY_NOTE)))]
            .map(g => g.split("~")).map(g => ({ name: g[0], note: g[1] || '' }));
        for (const group of groupSet) {
            const componentNames = [...new Set(executorArr.filter(e => e.ENTITY_NAME === group.name && e.ENTITY_NOTE === group.note).map(e => e.COMPONENT_NAME))];
            const components: Array<{
                componentName: string,
                buttons: Array<{ name: string, value: string }>
                setters: Array<{ name: string, value: string }>
            }> = [];
            for (const componentName of componentNames) {
                const buttons: Array<{ name: string, value: string }> = [];
                const setters: Array<{ name: string, value: string }> = [];
                buttons.push(...executorArr.filter(e => e.ENTITY_NAME === group.name && e.ENTITY_NOTE === group.note && e.COMPONENT_NAME === componentName)
                    .map(e => ({ name: e.PROPERTY_DESC, value: `${e.GETTER_NAME}${e.IS_CURRENT_PROPERTY ? ' ' : "() "}` })));

                setters.push(...executorArr.filter(e => e.ENTITY_NAME === group.name && e.ENTITY_NOTE === group.note && e.COMPONENT_NAME === componentName)
                    .map(e => ({ name: e.PROPERTY_DESC, value: e.IS_CURRENT_PROPERTY ?  e.SETTER_NAME : `${e.SETTER_NAME}( /*ЗНАЧЕНИЕ*/ ) `})));
                buttons.push({ name: 'РЕЗУЛЬТАТ', value: 'RESULT = ' })

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
                {componentName: "Функции окружения",
                    buttons: [
                        { name: "Текущая сущность", value: 'ME( /* "Название компонента", "Название свойства" */) ' },
                        { name: "Родительская сущность", value: 'FATHER( /* "Название компонента", "Название свойства" */) ' },
                        { name: "Высшая сущность", value: 'GRAND_FATHER( /* "Название компонента", "Название свойства" */) ' },
                        { name: "Братья", value: 'BROTHERS( /* "Название сущности", "Заметка", "Название компонента", "Название свойства" */) ' },
                        { name: "Дочерние сущности", value: 'CHILDS( /* "Название сущности", "Заметка", "Название компонента", "Название свойства" */) ' },
                    ],
                    setters: [
                        { name: "Текущая сущность", value: 'S_ME( /* "Название компонента", "Название свойства", "значение" */) ' },
                        { name: "Родительская сущность", value: 'S_FATHER( /* "Название компонента", "Название свойства", "значение" */) ' },
                        { name: "Высшая сущность", value: 'S_GRAND_FATHER( /* "Название компонента", "Название свойства", "значение" */) ' },
                        { name: "Братья", value: 'S_BROTHERS( /* "Название сущности", "Заметка", "Название компонента", "Название свойства", "значение" */) ' },
                        { name: "Дочерние сущности", value: 'S_CHILDS( /* "Название сущности", "Заметка", "Название компонента", "Название свойства", "значение" */) ' },
                    ],
                },
            ]

        })

        let startCode = '';
        startCode += `/*************************************************************/\n`;
        startCode += `/*  ME - Текущий объект, FATHER - родитель,                  */\n`;
        startCode += `/*  CHILDS - детки, BROTHERS - братья, GRAND_FATHER - дед    */\n`;
        startCode += `/*  RESULT - в эту переменную внесите результат.             */\n`;
        startCode += `/*  Остальное в кнопках на панели. Писать в верхнем регистре.*/\n`;
        startCode += `/*************************************************************/\n`;
        startCode += `// Тут пишите ваш код, удачи!\n\n\n\n\n`;
        return { clientButtons, startCode }

    } catch (e) {
        console.log(e);
        return null;
    }
}




export interface IHistory {
    index: number
    entityKey?: string;
    componentKey?: string
    action: string;
    importance: "low" | "high" | "error";
    ts: Date;
}
export class History extends Map<number, IHistory> {
    private index: number = 0;
    constructor() {
        super();
    }

    addHistory(...history: IHistory[]) {
        for (const hs of history) {
            this.push(hs.action, { entityKey: hs.entityKey, componentKey: hs.componentKey }, hs.importance)
        }
    }

    push(action: string, keys?: {entityKey?: string; componentKey?: string}, importance: "low" | "high" | "error" = "high") {
        const index = ++ this.index;
        const historyItem = {
            index,
            action,
            importance,
            ts: new Date (),
            ...keys,
        }
        this.set(index, historyItem);
        return this;
    }

    getActions (): IHistory[] {
        return [...this.values()];
    }

    getActionsAndClear(): IHistory[] {
        const actions = this.getActions();
        this.clear();
        return actions;
    }

    getLastAction () {
        const actions = this.getActions();
        return this.get(actions[actions.length - 1].index);
    }

    clearActions () {
        this.clear();
    }

}
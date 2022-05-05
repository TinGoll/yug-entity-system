
interface IHistory {
    index: number
    action: string;
    importance: "low" | "high";
    ts: Date;
}
export class History extends Map<number, IHistory> {
    private index: number = 0;
    constructor() {
        super();
    }

    push(action: string, importance: "low" | "high" = "high") {
        const index = ++ this.index;
        const historyItem = {
            index,
            action,
            importance,
            ts: new Date ()
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
import { Engine } from "../Engine";
import RoomControllerHeart from "./RoomControllerHeart";

export default class RoomController extends RoomControllerHeart {

    notify(entityKey: string, action: string, ...args: any[]): void {
        for (const iterator of this) {
            iterator.getEntityKeys()
                .then(keys => {
                    if (keys.find(k => k === entityKey)) {
                        iterator.sendNotificationToSubscribers(action, ...args)
                    }
                })
        }
    }
    constructor(engine: Engine) {
        super(engine);
    }

    
}
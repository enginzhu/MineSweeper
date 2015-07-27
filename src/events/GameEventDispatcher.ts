/**
 *
 * @author Shane Chu
 *
 * 事件派发者
 */
class GameEventDispatcher extends egret.EventDispatcher {
    
    private static _instance: GameEventDispatcher;
    
	public constructor() {
    	super();
	}
	
	public static getInstance():GameEventDispatcher {
	    if (null == GameEventDispatcher._instance) {
            GameEventDispatcher._instance = new GameEventDispatcher();
	    }
	    return GameEventDispatcher._instance;
	}
}

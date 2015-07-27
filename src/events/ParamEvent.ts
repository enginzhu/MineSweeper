/**
 *
 * @author Shane Chu
 * 
 * 带参数事件
 */
class ParamEvent extends egret.Event {
    
    public param: any;
    
	public constructor(type:string, param:any=null) {
        this.param = param;    
        super(type);
	}
}

/**
 *
 * @author Shane Chu
 *
 */
class Grid extends egret.DisplayObjectContainer {
    
    private border: egret.Sprite;
    private surface: egret.Sprite;
    private content: egret.TextField;
    
    public row:number;
    public column: number;
    
	public constructor(row:number, column:number) {
        super();
        this.row = row;
        this.column = column;
        this.initializeUI();
        this.addEvents();
	}
	
    private initializeUI(): void { 
        var border: egret.Sprite = new egret.Sprite();
        border.graphics.lineStyle(1,0x0);
        border.graphics.drawRect(0,0,20,20);
        border.graphics.endFill();
        this.addChild(border);
        this.border = border;
                
        var surface:egret.Sprite = new egret.Sprite();
        surface.touchEnabled = true;
        surface.graphics.beginFill(0x3333cc);
        surface.graphics.drawRect(1,1,18,18);
        surface.graphics.endFill();
        this.addChild(surface);
        this.surface = surface;
                
        var content: egret.TextField = new egret.TextField();
        content.width = 20;
        content.height = 20;
        content.textAlign = egret.HorizontalAlign.CENTER;
        content.x = 2;
        content.y = 2;
        content.size = 16;
        this.addChild(content);
        this.content = content;
        
        this.reset();
    }
    
    private addEvents(): void {
        this.surface.addEventListener(egret.TouchEvent.TOUCH_TAP,this.onTouchTapHandler,this);
    }
    
    
    public hasClicked: Boolean;
    
    /**
     * 格子重置为未点击的状态
     */ 
    public reset():void {
        this.surface.graphics.beginFill(0x3333cc);
        this.surface.graphics.drawRect(1,1,18,18);
        this.surface.graphics.endFill();
        
        this.hasClicked = false;
        this.isMine = false;
        this.hasMineNearby = false;
        this.content.visible = false;
    }
    
    
    private onTouchTapHandler(e:egret.TouchEvent):void {
        this.clickGrid();
        if (this.isMine) {
            GameEventDispatcher.getInstance().dispatchEvent(new ParamEvent(EventName.GAME_OVER));
            return;
        }
        if (!this.hasMineNearby) {
            GameEventDispatcher.getInstance().dispatchEvent(new ParamEvent(EventName.GRID_SAFETY_CLICKED,this));
        }
        GameEventDispatcher.getInstance().dispatchEvent(new ParamEvent(EventName.CHECK_IS_GAME_WIN,this));
    }
    
    
    public clickGrid():void {
        this.surface.graphics.beginFill(0x666666);
        this.surface.graphics.drawRect(1,1,18,18);
        this.surface.graphics.endFill();
                
        this.hasClicked = true;
        this.content.visible = true;
    }
    
    
    
    public isMine: Boolean;
    public hasMineNearby: Boolean;
    
    public setMineState(isMine:Boolean):void {
        this.isMine = isMine;
        this.content.text = (isMine) ? "雷" : "";
    }
    
    
    public setPromptNumber(number:number):void {
        if(this.isMine) return;
        this.hasMineNearby = (number > 0);
        this.content.text = (number > 0) ? number.toString() : "";
    }
}

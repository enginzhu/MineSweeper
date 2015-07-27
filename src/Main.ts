//////////////////////////////////////////////////////////////////////////////////////
//
//  Copyright (c) 2014-2015, Egret Technology Inc.
//  All rights reserved.
//  Redistribution and use in source and binary forms, with or without
//  modification, are permitted provided that the following conditions are met:
//
//     * Redistributions of source code must retain the above copyright
//       notice, this list of conditions and the following disclaimer.
//     * Redistributions in binary form must reproduce the above copyright
//       notice, this list of conditions and the following disclaimer in the
//       documentation and/or other materials provided with the distribution.
//     * Neither the name of the Egret nor the
//       names of its contributors may be used to endorse or promote products
//       derived from this software without specific prior written permission.
//
//  THIS SOFTWARE IS PROVIDED BY EGRET AND CONTRIBUTORS "AS IS" AND ANY EXPRESS
//  OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
//  OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
//  IN NO EVENT SHALL EGRET AND CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT,
//  INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
//  LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;LOSS OF USE, DATA,
//  OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
//  LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
//  NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
//  EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
//
//////////////////////////////////////////////////////////////////////////////////////

class Main extends egret.DisplayObjectContainer {

    /**
     * 加载进度界面
     * Process interface loading
     */
    private loadingView:LoadingUI;

    public constructor() {
        super();
        this.addEventListener(egret.Event.ADDED_TO_STAGE, this.onAddToStage, this);
    }

    private onAddToStage(event:egret.Event) {
        //inject the custom material parser
        //注入自定义的素材解析器
        egret.Injector.mapClass("egret.gui.IAssetAdapter", AssetAdapter);
        // load skin theme configuration file, you can manually modify the file. And replace the default skin.
        //加载皮肤主题配置文件,可以手动修改这个文件。替换默认皮肤。
        egret.gui.Theme.load("resource/theme.thm");
        //设置加载进度界面
        //Config to load process interface
        this.loadingView = new LoadingUI();
        this.stage.addChild(this.loadingView);
        //初始化Resource资源加载库
        //initiate Resource loading library
        RES.addEventListener(RES.ResourceEvent.CONFIG_COMPLETE, this.onConfigComplete, this);
        RES.loadConfig("resource/resource.json", "resource/");
    }

    /**
     * 配置文件加载完成,开始预加载preload资源组。
     * configuration file loading is completed, start to pre-load the preload resource group
     */
    private onConfigComplete(event:RES.ResourceEvent):void {
        RES.removeEventListener(RES.ResourceEvent.CONFIG_COMPLETE, this.onConfigComplete, this);
        RES.addEventListener(RES.ResourceEvent.GROUP_COMPLETE, this.onResourceLoadComplete, this);
        RES.addEventListener(RES.ResourceEvent.GROUP_LOAD_ERROR, this.onResourceLoadError, this);
        RES.addEventListener(RES.ResourceEvent.GROUP_PROGRESS, this.onResourceProgress, this);
        RES.loadGroup("preload");
    }

    /**
     * preload资源组加载完成
     * Preload resource group is loaded
     */
    private onResourceLoadComplete(event:RES.ResourceEvent):void {
        if (event.groupName == "preload") {
            this.stage.removeChild(this.loadingView);
            RES.removeEventListener(RES.ResourceEvent.GROUP_COMPLETE, this.onResourceLoadComplete, this);
            RES.removeEventListener(RES.ResourceEvent.GROUP_LOAD_ERROR, this.onResourceLoadError, this);
            RES.removeEventListener(RES.ResourceEvent.GROUP_PROGRESS, this.onResourceProgress, this);
            this.createGameScene();
        }
    }

    /**
     * 资源组加载出错
     *  The resource group loading failed
     */
    private onResourceLoadError(event:RES.ResourceEvent):void {
        //TODO
        console.warn("Group:" + event.groupName + " has failed to load");
        //忽略加载失败的项目
        //Ignore the loading failed projects
        this.onResourceLoadComplete(event);
    }

    /**
     * preload资源组加载进度
     * Loading process of preload resource group
     */
    private onResourceProgress(event:RES.ResourceEvent):void {
        if (event.groupName == "preload") {
            this.loadingView.setProgress(event.itemsLoaded, event.itemsTotal);
        }
    }
    
    private mineBoard: MineBoard;
    private guiLayer: egret.gui.UIStage;
    private btnNew: egret.gui.Button;
    private promptLabel: egret.gui.Label;
    
    /**
     * 创建游戏场景
     * Create a game scene
     */
    private createGameScene():void {
        this.mineBoard = new MineBoard(this.stage);
        this.addChild(this.mineBoard);
        
        this.guiLayer = new egret.gui.UIStage();
        this.addChild(this.guiLayer);
        
        this.btnNew = new egret.gui.Button();
        this.btnNew.x = this.mineBoard.x + 170;
        this.btnNew.y = this.mineBoard.y + 350;
        this.btnNew.label = "新一局";
        this.guiLayer.addElement(this.btnNew);
        
        this.promptLabel = new egret.gui.Label();
        this.promptLabel.x = 150;
        this.promptLabel.y = 430;
        this.promptLabel.textColor = 0xff0000;
        this.promptLabel.textAlign = egret.HorizontalAlign.CENTER;
        this.guiLayer.addElement(this.promptLabel);
        
        this.addEvents();
    }
    
    
    private addEvents():void {
        this.btnNew.addEventListener(egret.TouchEvent.TOUCH_TAP,this.newGameHandler,this);
        GameEventDispatcher.getInstance().addEventListener(EventName.GAME_OVER,this.onGameOverHandler,this);
        GameEventDispatcher.getInstance().addEventListener(EventName.GRID_SAFETY_CLICKED,this.onClickSafeGridHandler,this);
        GameEventDispatcher.getInstance().addEventListener(EventName.CHECK_IS_GAME_WIN,this.onCheckWinHandler,this);
    }
    
    
    /**
     * 游戏结束
     */ 
    private onGameOverHandler(e:ParamEvent):void {
        egret.gui.Alert.show("游戏结束", "提示");
    }
    
    
    /**
     * 新开一局游戏
     */ 
    private newGameHandler(e:egret.TouchEvent):void {
        this.newGame();
    }
    
    
    private newGame():void {
        this.mineBoard.initializeMineMapData();
        this.promptLabel.text = "";
    }
    
    
    /**
     * 检查游戏是否胜利
     */ 
    private onCheckWinHandler(e:ParamEvent):void {
        var isWin: Boolean = this.mineBoard.checkWin();
        if (isWin) {
            this.promptLabel.text = "恭喜你获胜了！";
        }
    }
    
    /**
    * 点击到附近无雷的空白格子
    */
    private onClickSafeGridHandler(e:ParamEvent):void {
        var grid: Grid = e.param;
        this.mineBoard.clickSafeGrid(grid);
    }
    
}



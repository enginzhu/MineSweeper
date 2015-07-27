/**
 *
 * @author Shane Chu
 * 
 * 棋盘
 */
class MineBoard extends egret.DisplayObjectContainer {
    
    /**
    * 二值化扫雷棋盘数据
    * 0 无雷
    * 1 有雷
    */ 
    private mineMap: Array<Array<number>>;
        
    /**
    * 棋盘对象数组
    */ 
    private grids: Array<Array<Grid>>;
    
    private gameStage: egret.Stage;
    private gridContainer: egret.Sprite;
    
    private static MAP_ROW: number = 9;
    private static MAP_COLUMN: number = 9;
    private static MINE_COUNT: number = 10;
    
    
	public constructor(stage:egret.Stage) {
        super();
        this.gameStage = stage;
        this.initializeMapGrids();
        this.initializeMineMapData();
	}
    
        
    /**
    * 初始化游戏棋盘显示对象(不生成具体棋局)
    */ 
    private initializeMapGrids():void {
        this.gridContainer = new egret.Sprite();
        this.addChild(this.gridContainer);
                
        this.grids = [];
        for (var i: number = 0;i < MineBoard.MAP_ROW;i++) { 
            this.grids[i] = [];
            for(var j: number = 0;j < MineBoard.MAP_COLUMN;j++) { 
                var grid:Grid = new Grid(i ,j);
                grid.x = i * 20;
                grid.y = j * 20;
                this.gridContainer.addChild(grid);
                this.grids[i][j] = grid;
            }
        }
                
        this.gridContainer.x = (this.gameStage.stageWidth - this.gridContainer.width) >> 1;
        this.gridContainer.y = (this.gameStage.stageWidth - this.gridContainer.height) >> 1;
    }
    
    
        
    /**
    * 生成一局新的游戏数据，并渲染棋盘
    */ 
    public initializeMineMapData():void {
        this.mineMap = [];
        for (var i: number = 0;i < MineBoard.MAP_ROW;i++) { 
            this.mineMap[i] = [];
            for(var j: number = 0;j < MineBoard.MAP_COLUMN;j++) { 
                this.mineMap[i][j] = 0;
            }
        }
        this.generateMines();
        this.initializeGridState();
    }
        
        
    /**
    * 随机生成10个地雷
    */ 
    private generateMines():void {
        var i: number = 0;
        while (i < MineBoard.MINE_COUNT) {
            var r: number = Math.floor(Math.random() * MineBoard.MAP_ROW);
            var c: number = Math.floor(Math.random() * MineBoard.MAP_COLUMN);
            if (this.mineMap[r][c] == 1) {
                continue;
            }
            else {
                this.mineMap[r][c] = 1;
                i += 1;
            }
        }
    }
                
                
    /**
    * 为棋局格子赋值邻近地雷数提示
    */ 
    private initializeGridState():void {
        var grid: Grid;
        var isMine: Boolean;
        for(var r: number = 0;r < MineBoard.MAP_ROW;r++) {
            for(var c: number = 0;c < MineBoard.MAP_COLUMN;c++) {
                grid = this.grids[r][c];
                grid.reset();
                isMine = (this.mineMap[r][c] == 1);
                grid.setMineState(isMine);
                if (!isMine) {
                    var adjacentMineNumber: number = this.getAdjacentMineNumber(r,c);
                    grid.setPromptNumber(adjacentMineNumber);
                }
            }
        }
    }
            
            
    /**
    * 根据棋盘坐标获取附近八个格子的藏雷数
    */ 
    private getAdjacentMineNumber(originRow:number, originColumn:number):number {
        var mineNumber: number = 0;
        // 邻近8个格子对应的坐标偏移数据
        var adjacentOffsets:Array<Array<number>> = 
        [
            [-1, -1], [0, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [0, 1], [1, 1]
        ];
        for(var index: number = 0;index < adjacentOffsets.length; index++) {
            var offset: Array<number> = adjacentOffsets[index];
            var r: number = originRow + offset[0];
            var c: number = originColumn + offset[1];
            if (r >= 0 && r < MineBoard.MAP_ROW  && c >= 0 && c < MineBoard.MAP_COLUMN) {
                if (this.mineMap[r][c] == 1) {
                    mineNumber += 1;
                }
            }
        }
        return mineNumber;
    }
            
            
    /**
    * 等待检查的格子列表
    */ 
    private openList: Array<Grid>;
        
    /**
    * 已检查过的格子列表
    */ 
    private closeList: Array<Grid>;
    
    /**
    * 点击到附近无雷的空白格子，广度优先搜索邻近的无雷格子
    */
    public clickSafeGrid(grid:Grid):void {
        this.openList = [];
        this.closeList = [];
        
        this.openList.push(grid);
        while(this.openList.length) {
            this.searchCheckList();
        }
    }
        
        
    /**
    * 1.从openList中取出第一个格子，如果该格子已经存在于closeList，则跳过检查
    * 2.如果该格子带有数字提示(附近有雷)，则跳过检查
    * 3.将格子加入closeList，遍历该格子的上下左右四个格子(需要作越界判断)，其中如果是空白格子，则加入到openList等待检查
    */ 
    private searchCheckList():void {
        var grid: Grid = this.openList.shift();
        if(this.closeList.indexOf(grid) != -1) return;
        this.closeList.push(grid);
        if(grid.hasMineNearby) return;
                
        var checkGrid: Grid;
        //左方格子
        if (grid.column - 1 >= 0) {
            checkGrid = this.grids[grid.row][grid.column - 1];
            checkGrid.clickGrid();
            this.openList.push(checkGrid);
        }
        //右方格子
        if (grid.column + 1 < MineBoard.MAP_COLUMN) {
            checkGrid = this.grids[grid.row][grid.column + 1];
            checkGrid.clickGrid();
            this.openList.push(checkGrid);
        }
        //上方格子
        if (grid.row - 1 >= 0) {
            checkGrid = this.grids[grid.row - 1][grid.column];
            checkGrid.clickGrid();
            this.openList.push(checkGrid);
        }
        //下方格子
        if (grid.row + 1 < MineBoard.MAP_ROW) {
            checkGrid = this.grids[grid.row + 1][grid.column];
            checkGrid.clickGrid();
            this.openList.push(checkGrid);
        }
    }
    
    
    /**
     * 检查游戏是否胜利
     */ 
    public checkWin():Boolean {
        var isWin: Boolean = true;
        var grid: Grid;
        for(var r: number = 0;r < MineBoard.MAP_ROW; r++) {
            for(var c: number = 0;c < MineBoard.MAP_COLUMN; c++) {
                grid = this.grids[r][c];
                if (!grid.isMine && !grid.hasClicked) {
                    isWin = false;
                    break;
                }
            }
        }
        return isWin;
    }
}

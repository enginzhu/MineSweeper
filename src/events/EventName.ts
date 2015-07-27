/**
 *
 * @author Shane Chu
 *
 * 事件名常量
 */
class EventName {
    
    /**
     * 游戏结束
     */ 
	public static GAME_OVER:string = "game_over";
	
	/**
	 * 点到附近无雷的格子
	 */ 
    public static GRID_SAFETY_CLICKED: string = "grid_safety_clicked";
    
    /**
     * 检查所有无雷区是否都已被标识出来
     */
    public static CHECK_IS_GAME_WIN: string = "check_is_game_win";
}

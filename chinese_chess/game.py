from board import Board
from piece import Color

class ChineseChessGame:
    def __init__(self):
        self.board = Board()
        self.current_player = Color.RED
    
    def switch_player(self):
        self.current_player = Color.BLACK if self.current_player == Color.RED else Color.RED
    
    def play(self):
        print("欢迎来到中国象棋游戏！")
        print("输入格式：起始位置 目标位置 (例如: 6 4 5 4)")
        print("输入 'q' 退出游戏\n")
        
        while True:
            self.board.display()
            print(f"当前玩家: {'红方' if self.current_player == Color.RED else '黑方'}")
            
            user_input = input("请输入移动: ").strip()
            if user_input.lower() == 'q':
                print("游戏结束！")
                break
            
            try:
                parts = user_input.split()
                if len(parts) != 4:
                    print("输入格式错误！请使用格式: 起始x 起始y 目标x 目标y")
                    continue
                
                fx, fy, tx, ty = map(int, parts)
                from_pos = (fx, fy)
                to_pos = (tx, ty)
                
                piece = self.board.get_piece(from_pos)
                if piece is None:
                    print("起始位置没有棋子！")
                    continue
                
                if piece.color != self.current_player:
                    print("不能移动对方的棋子！")
                    continue
                
                if self.board.move_piece(from_pos, to_pos):
                    print("移动成功！")
                    self.switch_player()
                else:
                    print("移动失败！该移动不符合规则。")
            
            except ValueError:
                print("输入格式错误！请输入数字。")
            except Exception as e:
                print(f"发生错误: {e}")

if __name__ == "__main__":
    game = ChineseChessGame()
    game.play()

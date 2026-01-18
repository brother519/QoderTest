#!/usr/bin/env python3

import copy
import sys

class Piece:
    def __init__(self, ptype, color, row, col):
        self.ptype = ptype
        self.color = color
        self.row = row
        self.col = col
    
    def __repr__(self):
        return f"{self.color}_{self.ptype}"

class Board:
    def __init__(self):
        self.board = [[None for _ in range(9)] for _ in range(10)]
        self.current_player = 'red'
        self.init_board()
    
    def init_board(self):
        pieces_layout = {
            'black': [
                ('车', 0, 0), ('马', 0, 1), ('象', 0, 2), ('士', 0, 3), ('将', 0, 4),
                ('士', 0, 5), ('象', 0, 6), ('马', 0, 7), ('车', 0, 8),
                ('炮', 2, 1), ('炮', 2, 7),
                ('卒', 3, 0), ('卒', 3, 2), ('卒', 3, 4), ('卒', 3, 6), ('卒', 3, 8)
            ],
            'red': [
                ('车', 9, 0), ('马', 9, 1), ('相', 9, 2), ('仕', 9, 3), ('帅', 9, 4),
                ('仕', 9, 5), ('相', 9, 6), ('马', 9, 7), ('车', 9, 8),
                ('炮', 7, 1), ('炮', 7, 7),
                ('兵', 6, 0), ('兵', 6, 2), ('兵', 6, 4), ('兵', 6, 6), ('兵', 6, 8)
            ]
        }
        
        for color, pieces in pieces_layout.items():
            for ptype, row, col in pieces:
                self.board[row][col] = Piece(ptype, color, row, col)
    
    def get_piece(self, row, col):
        if 0 <= row < 10 and 0 <= col < 9:
            return self.board[row][col]
        return None
    
    def set_piece(self, row, col, piece):
        if 0 <= row < 10 and 0 <= col < 9:
            self.board[row][col] = piece
            if piece:
                piece.row = row
                piece.col = col
    
    def display(self):
        print("\n  0 1 2 3 4 5 6 7 8")
        for i, row in enumerate(self.board):
            print(f"{i} ", end="")
            for cell in row:
                if cell:
                    symbol = cell.ptype
                    print(symbol, end=" ")
                else:
                    print("·", end=" ")
            print()
        print(f"\n当前玩家: {'红方' if self.current_player == 'red' else '黑方'}\n")
    
    def is_valid_move(self, from_row, from_col, to_row, to_col):
        piece = self.get_piece(from_row, from_col)
        if not piece or piece.color != self.current_player:
            return False
        
        if not (0 <= to_row < 10 and 0 <= to_col < 9):
            return False
        
        target = self.get_piece(to_row, to_col)
        if target and target.color == piece.color:
            return False
        
        ptype = piece.ptype
        
        if ptype in ['帅', '将']:
            if not ((3 <= to_row <= 5 and piece.color == 'black') or 
                    (7 <= to_row <= 9 and piece.color == 'red')):
                return False
            if not (3 <= to_col <= 5):
                return False
            if abs(to_row - from_row) + abs(to_col - from_col) != 1:
                return False
            
            if self.is_face_to_face(to_row, to_col):
                return False
        
        elif ptype in ['仕', '士']:
            if not ((0 <= to_row <= 2 and piece.color == 'black') or 
                    (7 <= to_row <= 9 and piece.color == 'red')):
                return False
            if not (3 <= to_col <= 5):
                return False
            if abs(to_row - from_row) != 1 or abs(to_col - from_col) != 1:
                return False
        
        elif ptype in ['相', '象']:
            if piece.color == 'red' and to_row <= 4:
                return False
            if piece.color == 'black' and to_row >= 5:
                return False
            if abs(to_row - from_row) != 2 or abs(to_col - from_col) != 2:
                return False
            
            block_row = (from_row + to_row) // 2
            block_col = (from_col + to_col) // 2
            if self.get_piece(block_row, block_col):
                return False
        
        elif ptype == '马':
            if abs(to_row - from_row) + abs(to_col - from_col) != 3:
                return False
            if abs(to_row - from_row) == 2 and abs(to_col - from_col) == 1:
                block_row = (from_row + to_row) // 2
                if self.get_piece(block_row, from_col):
                    return False
            elif abs(to_row - from_row) == 1 and abs(to_col - from_col) == 2:
                block_col = (from_col + to_col) // 2
                if self.get_piece(from_row, block_col):
                    return False
            else:
                return False
        
        elif ptype == '车':
            if from_row != to_row and from_col != to_col:
                return False
            if from_row == to_row:
                start, end = min(from_col, to_col), max(from_col, to_col)
                for c in range(start + 1, end):
                    if self.get_piece(from_row, c):
                        return False
            else:
                start, end = min(from_row, to_row), max(from_row, to_row)
                for r in range(start + 1, end):
                    if self.get_piece(r, from_col):
                        return False
        
        elif ptype == '炮':
            if from_row != to_row and from_col != to_col:
                return False
            
            count = 0
            if from_row == to_row:
                start, end = min(from_col, to_col), max(from_col, to_col)
                for c in range(start + 1, end):
                    if self.get_piece(from_row, c):
                        count += 1
            else:
                start, end = min(from_row, to_row), max(from_row, to_row)
                for r in range(start + 1, end):
                    if self.get_piece(r, from_col):
                        count += 1
            
            if target:
                if count != 1:
                    return False
            else:
                if count != 0:
                    return False
        
        elif ptype in ['兵', '卒']:
            if piece.color == 'red':
                if from_row > to_row:
                    return False
                if from_row >= 5:
                    if to_row != from_row - 1 or to_col != from_col:
                        return False
                else:
                    if abs(to_row - from_row) + abs(to_col - from_col) != 1:
                        return False
            else:
                if from_row < to_row:
                    return False
                if from_row <= 4:
                    if to_row != from_row + 1 or to_col != from_col:
                        return False
                else:
                    if abs(to_row - from_row) + abs(to_col - from_col) != 1:
                        return False
        
        return True
    
    def is_face_to_face(self, new_row, new_col):
        kings = []
        for row in range(10):
            for col in range(9):
                piece = self.board[row][col]
                if piece and piece.ptype in ['帅', '将']:
                    kings.append((row, col))
        
        temp_piece = self.board[new_row][new_col]
        test_board = copy.deepcopy(self.board)
        
        if len(kings) == 2:
            if kings[0][1] == kings[1][1]:
                start_row = min(kings[0][0], kings[1][0])
                end_row = max(kings[0][0], kings[1][0])
                blocking = False
                for r in range(start_row + 1, end_row):
                    if test_board[r][kings[0][1]]:
                        blocking = True
                        break
                if not blocking:
                    return True
        
        return False
    
    def move(self, from_row, from_col, to_row, to_col):
        if not self.is_valid_move(from_row, from_col, to_row, to_col):
            return False
        
        piece = self.get_piece(from_row, from_col)
        self.set_piece(to_row, to_col, piece)
        self.set_piece(from_row, from_col, None)
        
        self.current_player = 'black' if self.current_player == 'red' else 'red'
        return True
    
    def is_game_over(self):
        red_king = False
        black_king = False
        
        for row in range(10):
            for col in range(9):
                piece = self.get_piece(row, col)
                if piece and piece.ptype == '帅':
                    red_king = True
                if piece and piece.ptype == '将':
                    black_king = True
        
        if not red_king:
            return 'black'
        if not black_king:
            return 'red'
        return None
    
    def get_all_moves(self, color):
        moves = []
        for row in range(10):
            for col in range(9):
                piece = self.get_piece(row, col)
                if piece and piece.color == color:
                    for to_row in range(10):
                        for to_col in range(9):
                            old_player = self.current_player
                            self.current_player = color
                            if self.is_valid_move(row, col, to_row, to_col):
                                moves.append((row, col, to_row, to_col))
                            self.current_player = old_player
        return moves

class AI:
    def __init__(self, board, color, depth=2):
        self.board = board
        self.color = color
        self.depth = depth
        
        self.piece_values = {
            '帅': 10000, '将': 10000,
            '车': 600,
            '马': 300,
            '炮': 300,
            '相': 200, '象': 200,
            '仕': 200, '士': 200,
            '兵': 100, '卒': 100
        }
    
    def evaluate(self):
        score = 0
        for row in range(10):
            for col in range(9):
                piece = self.board.get_piece(row, col)
                if piece:
                    value = self.piece_values.get(piece.ptype, 0)
                    if piece.color == self.color:
                        score += value
                    else:
                        score -= value
        return score
    
    def minimax(self, depth, alpha, beta, maximizing):
        winner = self.board.is_game_over()
        if winner == self.color:
            return 100000
        elif winner:
            return -100000
        
        if depth == 0:
            return self.evaluate()
        
        if maximizing:
            max_eval = float('-inf')
            moves = self.board.get_all_moves(self.color)
            for move in moves:
                from_row, from_col, to_row, to_col = move
                temp_board = copy.deepcopy(self.board)
                temp_piece = temp_board.get_piece(from_row, from_col)
                temp_target = temp_board.get_piece(to_row, to_col)
                temp_player = temp_board.current_player
                
                temp_board.current_player = self.color
                temp_board.move(from_row, from_col, to_row, to_col)
                
                eval_score = self.minimax(depth - 1, alpha, beta, False)
                
                self.board.board = temp_board.board
                self.board.set_piece(from_row, from_col, temp_piece)
                self.board.set_piece(to_row, to_col, temp_target)
                self.board.current_player = temp_player
                
                max_eval = max(max_eval, eval_score)
                alpha = max(alpha, eval_score)
                if beta <= alpha:
                    break
            return max_eval
        else:
            min_eval = float('inf')
            opponent = 'red' if self.color == 'black' else 'black'
            moves = self.board.get_all_moves(opponent)
            for move in moves:
                from_row, from_col, to_row, to_col = move
                temp_board = copy.deepcopy(self.board)
                temp_piece = temp_board.get_piece(from_row, from_col)
                temp_target = temp_board.get_piece(to_row, to_col)
                temp_player = temp_board.current_player
                
                temp_board.current_player = opponent
                temp_board.move(from_row, from_col, to_row, to_col)
                
                eval_score = self.minimax(depth - 1, alpha, beta, True)
                
                self.board.board = temp_board.board
                self.board.set_piece(from_row, from_col, temp_piece)
                self.board.set_piece(to_row, to_col, temp_target)
                self.board.current_player = temp_player
                
                min_eval = min(min_eval, eval_score)
                beta = min(beta, eval_score)
                if beta <= alpha:
                    break
            return min_eval
    
    def get_best_move(self):
        best_move = None
        best_value = float('-inf')
        
        moves = self.board.get_all_moves(self.color)
        for move in moves:
            from_row, from_col, to_row, to_col = move
            
            temp_board = copy.deepcopy(self.board)
            temp_piece = temp_board.get_piece(from_row, from_col)
            temp_target = temp_board.get_piece(to_row, to_col)
            temp_player = temp_board.current_player
            
            temp_board.current_player = self.color
            temp_board.move(from_row, from_col, to_row, to_col)
            
            move_value = self.minimax(self.depth - 1, float('-inf'), float('inf'), False)
            
            self.board.board = temp_board.board
            self.board.set_piece(from_row, from_col, temp_piece)
            self.board.set_piece(to_row, to_col, temp_target)
            self.board.current_player = temp_player
            
            if move_value > best_value:
                best_value = move_value
                best_move = move
        
        return best_move

def main():
    board = Board()
    ai = AI(board, 'black', depth=2)
    
    print("中国象棋 - 人机对战")
    print("红方玩家 vs 黑方AI")
    print("输入格式: 起始行 起始列 目标行 目标列 (例如: 9 1 7 2)")
    print("输入 'quit' 退出游戏\n")
    
    while True:
        board.display()
        
        winner = board.is_game_over()
        if winner:
            print(f"游戏结束! {'红方' if winner == 'red' else '黑方'}获胜!")
            break
        
        if board.current_player == 'red':
            user_input = input("请输入移动 (起始行 起始列 目标行 目标列): ").strip()
            
            if user_input.lower() == 'quit':
                print("退出游戏")
                break
            
            try:
                from_row, from_col, to_row, to_col = map(int, user_input.split())
                
                if board.move(from_row, from_col, to_row, to_col):
                    print("移动成功!")
                else:
                    print("非法移动，请重试")
                    continue
            except Exception as e:
                print(f"输入错误: {e}")
                continue
        else:
            print("AI思考中...")
            best_move = ai.get_best_move()
            
            if best_move:
                from_row, from_col, to_row, to_col = best_move
                board.move(from_row, from_col, to_row, to_col)
                print(f"AI移动: ({from_row},{from_col}) -> ({to_row},{to_col})")
            else:
                print("AI无法移动，游戏结束")
                break

if __name__ == "__main__":
    main()

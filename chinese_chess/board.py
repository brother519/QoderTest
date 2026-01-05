from typing import Optional
from piece import Piece, Color, PieceType
from move_rules import *

class Board:
    def __init__(self):
        self.board: list[list[Optional[Piece]]] = [[None for _ in range(9)] for _ in range(10)]
        self._init_pieces()
    
    def _init_pieces(self):
        base_spec = InBoardSpec().and_(NotSameColorSpec())
        
        self.board[0][4] = Piece(PieceType.KING, Color.BLACK, base_spec.and_(KingMoveSpec()))
        self.board[9][4] = Piece(PieceType.KING, Color.RED, base_spec.and_(KingMoveSpec()))
        
        for y in [3, 5]:
            self.board[0][y] = Piece(PieceType.ADVISOR, Color.BLACK, base_spec.and_(AdvisorMoveSpec()))
            self.board[9][y] = Piece(PieceType.ADVISOR, Color.RED, base_spec.and_(AdvisorMoveSpec()))
        
        for y in [2, 6]:
            self.board[0][y] = Piece(PieceType.ELEPHANT, Color.BLACK, base_spec.and_(ElephantMoveSpec()))
            self.board[9][y] = Piece(PieceType.ELEPHANT, Color.RED, base_spec.and_(ElephantMoveSpec()))
        
        for y in [1, 7]:
            self.board[0][y] = Piece(PieceType.HORSE, Color.BLACK, base_spec.and_(HorseMoveSpec()))
            self.board[9][y] = Piece(PieceType.HORSE, Color.RED, base_spec.and_(HorseMoveSpec()))
        
        for y in [0, 8]:
            self.board[0][y] = Piece(PieceType.CHARIOT, Color.BLACK, base_spec.and_(ChariotMoveSpec()))
            self.board[9][y] = Piece(PieceType.CHARIOT, Color.RED, base_spec.and_(ChariotMoveSpec()))
        
        for y in [1, 7]:
            self.board[2][y] = Piece(PieceType.CANNON, Color.BLACK, base_spec.and_(CannonMoveSpec()))
            self.board[7][y] = Piece(PieceType.CANNON, Color.RED, base_spec.and_(CannonMoveSpec()))
        
        for y in [0, 2, 4, 6, 8]:
            self.board[3][y] = Piece(PieceType.PAWN, Color.BLACK, base_spec.and_(PawnMoveSpec()))
            self.board[6][y] = Piece(PieceType.PAWN, Color.RED, base_spec.and_(PawnMoveSpec()))
    
    def get_piece(self, pos: tuple[int, int]) -> Optional[Piece]:
        x, y = pos
        if 0 <= x <= 9 and 0 <= y <= 8:
            return self.board[x][y]
        return None
    
    def move_piece(self, from_pos: tuple[int, int], to_pos: tuple[int, int]) -> bool:
        piece = self.get_piece(from_pos)
        if piece is None:
            return False
        
        if piece.can_move(from_pos, to_pos, self):
            fx, fy = from_pos
            tx, ty = to_pos
            self.board[tx][ty] = piece
            self.board[fx][fy] = None
            return True
        return False
    
    def display(self):
        print("  0 1 2 3 4 5 6 7 8")
        for i in range(10):
            row_str = f"{i} "
            for j in range(9):
                piece = self.board[i][j]
                if piece is None:
                    row_str += "· "
                else:
                    row_str += str(piece) + " "
            print(row_str)
        print()

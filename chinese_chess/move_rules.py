from specification import Specification
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from piece import Piece, Color
    from board import Board

class KingMoveSpec(Specification):
    def is_satisfied_by(self, piece: 'Piece', from_pos: tuple[int, int], to_pos: tuple[int, int], board: 'Board') -> bool:
        fx, fy = from_pos
        tx, ty = to_pos
        
        if abs(tx - fx) + abs(ty - fy) != 1:
            return False
        
        from piece import Color
        if piece.color == Color.RED:
            return 7 <= tx <= 9 and 3 <= ty <= 5
        else:
            return 0 <= tx <= 2 and 3 <= ty <= 5

class AdvisorMoveSpec(Specification):
    def is_satisfied_by(self, piece: 'Piece', from_pos: tuple[int, int], to_pos: tuple[int, int], board: 'Board') -> bool:
        fx, fy = from_pos
        tx, ty = to_pos
        
        if abs(tx - fx) != 1 or abs(ty - fy) != 1:
            return False
        
        from piece import Color
        if piece.color == Color.RED:
            return 7 <= tx <= 9 and 3 <= ty <= 5
        else:
            return 0 <= tx <= 2 and 3 <= ty <= 5

class ElephantMoveSpec(Specification):
    def is_satisfied_by(self, piece: 'Piece', from_pos: tuple[int, int], to_pos: tuple[int, int], board: 'Board') -> bool:
        fx, fy = from_pos
        tx, ty = to_pos
        
        if abs(tx - fx) != 2 or abs(ty - fy) != 2:
            return False
        
        eye_x = (fx + tx) // 2
        eye_y = (fy + ty) // 2
        if board.get_piece((eye_x, eye_y)) is not None:
            return False
        
        from piece import Color
        if piece.color == Color.RED:
            return tx >= 5
        else:
            return tx <= 4

class HorseMoveSpec(Specification):
    def is_satisfied_by(self, piece: 'Piece', from_pos: tuple[int, int], to_pos: tuple[int, int], board: 'Board') -> bool:
        fx, fy = from_pos
        tx, ty = to_pos
        
        dx, dy = abs(tx - fx), abs(ty - fy)
        if not ((dx == 2 and dy == 1) or (dx == 1 and dy == 2)):
            return False
        
        if dx == 2:
            block_x = fx + (1 if tx > fx else -1)
            block_y = fy
        else:
            block_x = fx
            block_y = fy + (1 if ty > fy else -1)
        
        return board.get_piece((block_x, block_y)) is None

class ChariotMoveSpec(Specification):
    def is_satisfied_by(self, piece: 'Piece', from_pos: tuple[int, int], to_pos: tuple[int, int], board: 'Board') -> bool:
        fx, fy = from_pos
        tx, ty = to_pos
        
        if fx != tx and fy != ty:
            return False
        
        if fx == tx:
            step = 1 if ty > fy else -1
            for y in range(fy + step, ty, step):
                if board.get_piece((fx, y)) is not None:
                    return False
        else:
            step = 1 if tx > fx else -1
            for x in range(fx + step, tx, step):
                if board.get_piece((x, fy)) is not None:
                    return False
        
        return True

class CannonMoveSpec(Specification):
    def is_satisfied_by(self, piece: 'Piece', from_pos: tuple[int, int], to_pos: tuple[int, int], board: 'Board') -> bool:
        fx, fy = from_pos
        tx, ty = to_pos
        
        if fx != tx and fy != ty:
            return False
        
        target_piece = board.get_piece(to_pos)
        pieces_between = 0
        
        if fx == tx:
            step = 1 if ty > fy else -1
            for y in range(fy + step, ty, step):
                if board.get_piece((fx, y)) is not None:
                    pieces_between += 1
        else:
            step = 1 if tx > fx else -1
            for x in range(fx + step, tx, step):
                if board.get_piece((x, fy)) is not None:
                    pieces_between += 1
        
        if target_piece is None:
            return pieces_between == 0
        else:
            return pieces_between == 1

class PawnMoveSpec(Specification):
    def is_satisfied_by(self, piece: 'Piece', from_pos: tuple[int, int], to_pos: tuple[int, int], board: 'Board') -> bool:
        fx, fy = from_pos
        tx, ty = to_pos
        
        if abs(tx - fx) + abs(ty - fy) != 1:
            return False
        
        from piece import Color
        if piece.color == Color.RED:
            if fx >= 5:
                return tx < fx and ty == fy
            else:
                return (tx < fx and ty == fy) or (tx == fx and abs(ty - fy) == 1)
        else:
            if fx <= 4:
                return tx > fx and ty == fy
            else:
                return (tx > fx and ty == fy) or (tx == fx and abs(ty - fy) == 1)

class NotSameColorSpec(Specification):
    def is_satisfied_by(self, piece: 'Piece', from_pos: tuple[int, int], to_pos: tuple[int, int], board: 'Board') -> bool:
        target_piece = board.get_piece(to_pos)
        if target_piece is None:
            return True
        return target_piece.color != piece.color

class InBoardSpec(Specification):
    def is_satisfied_by(self, piece: 'Piece', from_pos: tuple[int, int], to_pos: tuple[int, int], board: 'Board') -> bool:
        tx, ty = to_pos
        return 0 <= tx <= 9 and 0 <= ty <= 8

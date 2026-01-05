from enum import Enum
from specification import Specification

class Color(Enum):
    RED = "红"
    BLACK = "黑"

class PieceType(Enum):
    KING = "将/帅"
    ADVISOR = "士"
    ELEPHANT = "象"
    HORSE = "马"
    CHARIOT = "车"
    CANNON = "炮"
    PAWN = "兵/卒"

class Piece:
    def __init__(self, piece_type: PieceType, color: Color, move_spec: Specification):
        self.piece_type = piece_type
        self.color = color
        self.move_spec = move_spec
    
    def can_move(self, from_pos: tuple[int, int], to_pos: tuple[int, int], board) -> bool:
        return self.move_spec.is_satisfied_by(self, from_pos, to_pos, board)
    
    def __str__(self):
        color_str = "红" if self.color == Color.RED else "黑"
        type_map = {
            PieceType.KING: "帅" if self.color == Color.RED else "将",
            PieceType.ADVISOR: "仕" if self.color == Color.RED else "士",
            PieceType.ELEPHANT: "相" if self.color == Color.RED else "象",
            PieceType.HORSE: "马",
            PieceType.CHARIOT: "车",
            PieceType.CANNON: "炮",
            PieceType.PAWN: "兵" if self.color == Color.RED else "卒"
        }
        return f"{color_str}{type_map[self.piece_type]}"

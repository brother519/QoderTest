from abc import ABC, abstractmethod
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from piece import Piece
    from board import Board

class Specification(ABC):
    @abstractmethod
    def is_satisfied_by(self, piece: 'Piece', from_pos: tuple[int, int], to_pos: tuple[int, int], board: 'Board') -> bool:
        pass
    
    def and_(self, other: 'Specification') -> 'Specification':
        return AndSpecification(self, other)
    
    def or_(self, other: 'Specification') -> 'Specification':
        return OrSpecification(self, other)
    
    def not_(self) -> 'Specification':
        return NotSpecification(self)

class AndSpecification(Specification):
    def __init__(self, spec1: Specification, spec2: Specification):
        self.spec1 = spec1
        self.spec2 = spec2
    
    def is_satisfied_by(self, piece: 'Piece', from_pos: tuple[int, int], to_pos: tuple[int, int], board: 'Board') -> bool:
        return self.spec1.is_satisfied_by(piece, from_pos, to_pos, board) and \
               self.spec2.is_satisfied_by(piece, from_pos, to_pos, board)

class OrSpecification(Specification):
    def __init__(self, spec1: Specification, spec2: Specification):
        self.spec1 = spec1
        self.spec2 = spec2
    
    def is_satisfied_by(self, piece: 'Piece', from_pos: tuple[int, int], to_pos: tuple[int, int], board: 'Board') -> bool:
        return self.spec1.is_satisfied_by(piece, from_pos, to_pos, board) or \
               self.spec2.is_satisfied_by(piece, from_pos, to_pos, board)

class NotSpecification(Specification):
    def __init__(self, spec: Specification):
        self.spec = spec
    
    def is_satisfied_by(self, piece: 'Piece', from_pos: tuple[int, int], to_pos: tuple[int, int], board: 'Board') -> bool:
        return not self.spec.is_satisfied_by(piece, from_pos, to_pos, board)

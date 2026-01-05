from board import Board
from piece import Color, PieceType

def test_basic_moves():
    board = Board()
    
    print("=== 测试1: 红方兵前进 ===")
    print("移动前:")
    board.display()
    
    result = board.move_piece((6, 0), (5, 0))
    print(f"移动 (6,0) -> (5,0): {'成功' if result else '失败'}")
    print("移动后:")
    board.display()
    
    print("=== 测试2: 黑方炮移动 ===")
    result = board.move_piece((2, 1), (2, 4))
    print(f"移动 (2,1) -> (2,4): {'成功' if result else '失败'}")
    board.display()
    
    print("=== 测试3: 红方马跳跃 ===")
    result = board.move_piece((9, 1), (7, 2))
    print(f"移动 (9,1) -> (7,2): {'成功' if result else '失败'}")
    board.display()
    
    print("=== 测试4: 非法移动 - 兵后退 ===")
    result = board.move_piece((5, 0), (6, 0))
    print(f"移动 (5,0) -> (6,0): {'成功' if result else '失败'}")
    
    print("=== 测试5: 红方车前进 ===")
    result = board.move_piece((9, 0), (6, 0))
    print(f"移动 (9,0) -> (6,0): {'成功' if result else '失败'}")
    board.display()

def test_specification_pattern():
    from move_rules import ChariotMoveSpec, InBoardSpec, NotSameColorSpec
    from piece import Piece
    
    print("=== 测试规约模式组合 ===")
    board = Board()
    
    base_spec = InBoardSpec()
    not_same_color = NotSameColorSpec()
    chariot_move = ChariotMoveSpec()
    
    combined_spec = base_spec.and_(not_same_color).and_(chariot_move)
    
    piece = Piece(PieceType.CHARIOT, Color.RED, combined_spec)
    
    print(f"车从 (9,0) 到 (6,0): {piece.can_move((9,0), (6,0), board)}")
    print(f"车从 (9,0) 到 (9,4): {piece.can_move((9,0), (9,4), board)}")
    print(f"车从 (9,0) 到 (8,1) (斜线): {piece.can_move((9,0), (8,1), board)}")

if __name__ == "__main__":
    print("中国象棋 - 规约模式实现测试\n")
    test_basic_moves()
    print("\n" + "="*50 + "\n")
    test_specification_pattern()

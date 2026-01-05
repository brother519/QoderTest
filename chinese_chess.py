import pygame
import sys

pygame.init()

WIDTH = 600
HEIGHT = 660
BOARD_SIZE = 9
CELL_SIZE = 60
OFFSET_X = 60
OFFSET_Y = 60

WHITE = (255, 255, 255)
BLACK = (0, 0, 0)
RED = (255, 0, 0)
BLUE = (0, 0, 255)
GRAY = (200, 200, 200)
YELLOW = (255, 255, 0)

screen = pygame.display.set_mode((WIDTH, HEIGHT))
pygame.display.set_caption("中国象棋")

class Piece:
    def __init__(self, name, color, x, y):
        self.name = name
        self.color = color
        self.x = x
        self.y = y
        self.selected = False
    
    def draw(self, screen):
        px = OFFSET_X + self.x * CELL_SIZE
        py = OFFSET_Y + self.y * CELL_SIZE
        
        color = RED if self.color == 'red' else BLACK
        if self.selected:
            pygame.draw.circle(screen, YELLOW, (px, py), 28)
        
        pygame.draw.circle(screen, WHITE, (px, py), 25)
        pygame.draw.circle(screen, color, (px, py), 25, 3)
        
        font = pygame.font.Font(None, 30)
        text = font.render(self.name, True, color)
        text_rect = text.get_rect(center=(px, py))
        screen.blit(text, text_rect)

class Board:
    def __init__(self):
        self.pieces = []
        self.selected_piece = None
        self.current_turn = 'red'
        self.init_pieces()
    
    def init_pieces(self):
        piece_setup = [
            ('R', 'black', 0, 0), ('R', 'black', 8, 0),
            ('N', 'black', 1, 0), ('N', 'black', 7, 0),
            ('B', 'black', 2, 0), ('B', 'black', 6, 0),
            ('A', 'black', 3, 0), ('A', 'black', 5, 0),
            ('K', 'black', 4, 0),
            ('C', 'black', 1, 2), ('C', 'black', 7, 2),
            ('P', 'black', 0, 3), ('P', 'black', 2, 3),
            ('P', 'black', 4, 3), ('P', 'black', 6, 3), ('P', 'black', 8, 3),
            
            ('R', 'red', 0, 9), ('R', 'red', 8, 9),
            ('N', 'red', 1, 9), ('N', 'red', 7, 9),
            ('B', 'red', 2, 9), ('B', 'red', 6, 9),
            ('A', 'red', 3, 9), ('A', 'red', 5, 9),
            ('K', 'red', 4, 9),
            ('C', 'red', 1, 7), ('C', 'red', 7, 7),
            ('P', 'red', 0, 6), ('P', 'red', 2, 6),
            ('P', 'red', 4, 6), ('P', 'red', 6, 6), ('P', 'red', 8, 6),
        ]
        
        for name, color, x, y in piece_setup:
            self.pieces.append(Piece(name, color, x, y))
    
    def draw(self, screen):
        screen.fill(WHITE)
        
        for i in range(10):
            y = OFFSET_Y + i * CELL_SIZE
            if i == 0 or i == 9:
                pygame.draw.line(screen, BLACK, (OFFSET_X, y), (OFFSET_X + 8 * CELL_SIZE, y), 3)
            else:
                pygame.draw.line(screen, BLACK, (OFFSET_X, y), (OFFSET_X + 8 * CELL_SIZE, y), 2)
        
        for i in range(9):
            x = OFFSET_X + i * CELL_SIZE
            if i == 0 or i == 8:
                pygame.draw.line(screen, BLACK, (x, OFFSET_Y), (x, OFFSET_Y + 9 * CELL_SIZE), 3)
            else:
                pygame.draw.line(screen, BLACK, (x, OFFSET_Y), (x, OFFSET_Y + 4 * CELL_SIZE), 2)
                pygame.draw.line(screen, BLACK, (x, OFFSET_Y + 5 * CELL_SIZE), (x, OFFSET_Y + 9 * CELL_SIZE), 2)
        
        palace_lines = [
            ((3, 0), (5, 2)), ((5, 0), (3, 2)),
            ((3, 7), (5, 9)), ((5, 7), (3, 9))
        ]
        for start, end in palace_lines:
            pygame.draw.line(screen, BLACK, 
                           (OFFSET_X + start[0] * CELL_SIZE, OFFSET_Y + start[1] * CELL_SIZE),
                           (OFFSET_X + end[0] * CELL_SIZE, OFFSET_Y + end[1] * CELL_SIZE), 2)
        
        font = pygame.font.Font(None, 36)
        turn_text = f"Current Turn: {'Red' if self.current_turn == 'red' else 'Black'}"
        text = font.render(turn_text, True, RED if self.current_turn == 'red' else BLACK)
        screen.blit(text, (10, 10))
        
        for piece in self.pieces:
            piece.draw(screen)
    
    def get_piece_at(self, x, y):
        for piece in self.pieces:
            if piece.x == x and piece.y == y:
                return piece
        return None
    
    def is_valid_move(self, piece, to_x, to_y):
        if to_x < 0 or to_x > 8 or to_y < 0 or to_y > 9:
            return False
        
        target = self.get_piece_at(to_x, to_y)
        if target and target.color == piece.color:
            return False
        
        if piece.name == 'K':
            if not (3 <= to_x <= 5):
                return False
            if piece.color == 'red' and not (7 <= to_y <= 9):
                return False
            if piece.color == 'black' and not (0 <= to_y <= 2):
                return False
            if abs(to_x - piece.x) + abs(to_y - piece.y) != 1:
                return False
        
        elif piece.name == 'A':
            if not (3 <= to_x <= 5):
                return False
            if piece.color == 'red' and not (7 <= to_y <= 9):
                return False
            if piece.color == 'black' and not (0 <= to_y <= 2):
                return False
            if abs(to_x - piece.x) != 1 or abs(to_y - piece.y) != 1:
                return False
        
        elif piece.name == 'B':
            if piece.color == 'red' and to_y < 5:
                return False
            if piece.color == 'black' and to_y > 4:
                return False
            if abs(to_x - piece.x) != 2 or abs(to_y - piece.y) != 2:
                return False
            mid_x = (piece.x + to_x) // 2
            mid_y = (piece.y + to_y) // 2
            if self.get_piece_at(mid_x, mid_y):
                return False
        
        elif piece.name == 'N':
            dx = to_x - piece.x
            dy = to_y - piece.y
            if abs(dx) == 2 and abs(dy) == 1:
                if self.get_piece_at(piece.x + dx // 2, piece.y):
                    return False
            elif abs(dx) == 1 and abs(dy) == 2:
                if self.get_piece_at(piece.x, piece.y + dy // 2):
                    return False
            else:
                return False
        
        elif piece.name == 'R':
            if piece.x != to_x and piece.y != to_y:
                return False
            count = 0
            if piece.x == to_x:
                start = min(piece.y, to_y) + 1
                end = max(piece.y, to_y)
                for y in range(start, end):
                    if self.get_piece_at(piece.x, y):
                        count += 1
            else:
                start = min(piece.x, to_x) + 1
                end = max(piece.x, to_x)
                for x in range(start, end):
                    if self.get_piece_at(x, piece.y):
                        count += 1
            if count > 0:
                return False
        
        elif piece.name == 'C':
            if piece.x != to_x and piece.y != to_y:
                return False
            count = 0
            if piece.x == to_x:
                start = min(piece.y, to_y) + 1
                end = max(piece.y, to_y)
                for y in range(start, end):
                    if self.get_piece_at(piece.x, y):
                        count += 1
            else:
                start = min(piece.x, to_x) + 1
                end = max(piece.x, to_x)
                for x in range(start, end):
                    if self.get_piece_at(x, piece.y):
                        count += 1
            if target:
                if count != 1:
                    return False
            else:
                if count != 0:
                    return False
        
        elif piece.name == 'P':
            if piece.color == 'red':
                if piece.y > 4:
                    if to_y != piece.y - 1 or to_x != piece.x:
                        return False
                else:
                    if to_y == piece.y - 1 and to_x == piece.x:
                        pass
                    elif to_y == piece.y and abs(to_x - piece.x) == 1:
                        pass
                    else:
                        return False
            else:
                if piece.y < 5:
                    if to_y != piece.y + 1 or to_x != piece.x:
                        return False
                else:
                    if to_y == piece.y + 1 and to_x == piece.x:
                        pass
                    elif to_y == piece.y and abs(to_x - piece.x) == 1:
                        pass
                    else:
                        return False
        
        return True
    
    def move_piece(self, piece, to_x, to_y):
        target = self.get_piece_at(to_x, to_y)
        if target:
            self.pieces.remove(target)
        
        piece.x = to_x
        piece.y = to_y
        self.current_turn = 'black' if self.current_turn == 'red' else 'red'
    
    def handle_click(self, pos):
        x = (pos[0] - OFFSET_X + CELL_SIZE // 2) // CELL_SIZE
        y = (pos[1] - OFFSET_Y + CELL_SIZE // 2) // CELL_SIZE
        
        if x < 0 or x > 8 or y < 0 or y > 9:
            return
        
        if self.selected_piece:
            if self.is_valid_move(self.selected_piece, x, y):
                self.move_piece(self.selected_piece, x, y)
                self.selected_piece.selected = False
                self.selected_piece = None
            else:
                self.selected_piece.selected = False
                self.selected_piece = None
        else:
            piece = self.get_piece_at(x, y)
            if piece and piece.color == self.current_turn:
                piece.selected = True
                self.selected_piece = piece

def main():
    clock = pygame.time.Clock()
    board = Board()
    
    while True:
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                pygame.quit()
                sys.exit()
            elif event.type == pygame.MOUSEBUTTONDOWN:
                board.handle_click(event.pos)
        
        board.draw(screen)
        pygame.display.flip()
        clock.tick(60)

if __name__ == "__main__":
    main()

package main

import (
	"fmt"
	"math/rand"
	"os"
	"os/exec"
	"time"

	"github.com/eiannone/keyboard"
)

const (
	width  = 40
	height = 20
)

type Point struct {
	X, Y int
}

type Direction struct {
	X, Y int
}

var (
	Up    = Direction{0, -1}
	Down  = Direction{0, 1}
	Left  = Direction{-1, 0}
	Right = Direction{1, 0}
)

type Game struct {
	snake     []Point
	direction Direction
	food      Point
	score     int
	gameOver  bool
}

func NewGame() *Game {
	g := &Game{
		snake:     []Point{{width / 2, height / 2}},
		direction: Right,
		score:     0,
		gameOver:  false,
	}
	g.generateFood()
	return g
}

func (g *Game) generateFood() {
	for {
		food := Point{rand.Intn(width-2) + 1, rand.Intn(height-2) + 1}
		if !g.isOnSnake(food) {
			g.food = food
			return
		}
	}
}

func (g *Game) isOnSnake(p Point) bool {
	for _, segment := range g.snake {
		if segment == p {
			return true
		}
	}
	return false
}

func (g *Game) changeDirection(newDir Direction) {
	// 不能反向移动
	if g.direction.X*-1 == newDir.X && g.direction.Y*-1 == newDir.Y {
		return
	}
	g.direction = newDir
}

func (g *Game) move() {
	if g.gameOver {
		return
	}

	head := g.snake[0]
	newHead := Point{head.X + g.direction.X, head.Y + g.direction.Y}

	// 检查是否撞墙
	if newHead.X <= 0 || newHead.X >= width-1 || newHead.Y <= 0 || newHead.Y >= height-1 {
		g.gameOver = true
		return
	}

	// 检查是否撞到自己
	if g.isOnSnake(newHead) {
		g.gameOver = true
		return
	}

	// 添加新头部
	g.snake = append([]Point{newHead}, g.snake...)

	// 检查是否吃到食物
	if newHead == g.food {
		g.score += 10
		g.generateFood()
	} else {
		// 移除尾部
		g.snake = g.snake[:len(g.snake)-1]
	}
}

func (g *Game) draw() {
	clearScreen()
	
	// 创建游戏区域
	board := make([][]rune, height)
	for i := range board {
		board[i] = make([]rune, width)
		for j := range board[i] {
			board[i][j] = ' '
		}
	}

	// 绘制边框
	for i := 0; i < height; i++ {
		for j := 0; j < width; j++ {
			if i == 0 || i == height-1 || j == 0 || j == width-1 {
				board[i][j] = '#'
			}
		}
	}

	// 绘制蛇
	for idx, segment := range g.snake {
		if idx == 0 {
			board[segment.Y][segment.X] = '@' // 蛇头
		} else {
			board[segment.Y][segment.X] = 'o' // 蛇身
		}
	}

	// 绘制食物
	board[g.food.Y][g.food.X] = '*'

	// 输出游戏区域
	for _, row := range board {
		fmt.Println(string(row))
	}

	// 显示分数和提示
	fmt.Printf("Score: %d\n", g.score)
	fmt.Println("Use Arrow Keys to move | Q to quit")

	if g.gameOver {
		fmt.Println("\n*** GAME OVER! Press R to restart or Q to quit ***")
	}
}

func clearScreen() {
	cmd := exec.Command("clear")
	cmd.Stdout = os.Stdout
	cmd.Run()
}

func main() {
	rand.Seed(time.Now().UnixNano())

	// 初始化键盘监听
	if err := keyboard.Open(); err != nil {
		fmt.Println("无法初始化键盘:", err)
		fmt.Println("请先安装依赖: go get github.com/eiannone/keyboard")
		return
	}
	defer keyboard.Close()

	game := NewGame()

	// 用于处理键盘输入的通道
	keyEvents := make(chan keyboard.KeyEvent)
	go func() {
		for {
			char, key, err := keyboard.GetKey()
			if err != nil {
				return
			}
			keyEvents <- keyboard.KeyEvent{Rune: char, Key: key}
		}
	}()

	// 游戏主循环
	ticker := time.NewTicker(150 * time.Millisecond)
	defer ticker.Stop()

	game.draw()

	for {
		select {
		case <-ticker.C:
			if !game.gameOver {
				game.move()
				game.draw()
			}

		case event := <-keyEvents:
			switch event.Key {
			case keyboard.KeyArrowUp:
				game.changeDirection(Up)
			case keyboard.KeyArrowDown:
				game.changeDirection(Down)
			case keyboard.KeyArrowLeft:
				game.changeDirection(Left)
			case keyboard.KeyArrowRight:
				game.changeDirection(Right)
			}

			switch event.Rune {
			case 'q', 'Q':
				fmt.Println("\n游戏已退出")
				return
			case 'r', 'R':
				if game.gameOver {
					game = NewGame()
					game.draw()
				}
			}
		}
	}
}

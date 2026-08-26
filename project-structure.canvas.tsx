import { Card, CardBody, CardHeader, Grid, H1, H2, H3, Stack, Text, useHostTheme, ZoomableViewport } from 'qoder/canvas';
import type { CSSProperties } from 'react';

const games = [
  { id: 'link-match', name: '连连看', render: 'DOM' },
  { id: 'snake', name: '贪吃蛇', render: 'Canvas' },
  { id: 'tetris', name: '俄罗斯方块', render: 'Canvas' },
  { id: 'tank-battle', name: '坦克大战', render: 'Canvas' },
  { id: 'whack-a-mole', name: '打地鼠', render: 'DOM' },
  { id: 'minesweeper', name: '扫雷', render: 'DOM' },
  { id: 'monopoly', name: '大富翁', render: 'DOM' },
  { id: 'aircraft-battle', name: '飞机大战', render: 'Canvas' },
  { id: 'match-three', name: '消消乐', render: 'DOM' },
  { id: 'puzzle-2048', name: '2048', render: 'DOM' },
  { id: 'klotski', name: '华容道', render: 'DOM' },
  { id: 'hanoi', name: '汉诺塔', render: 'DOM' },
  { id: 'sokoban', name: '推箱子', render: 'DOM' },
  { id: 'lights-out', name: '点灯游戏', render: 'DOM' },
  { id: 'sudoku', name: '数独', render: 'DOM' },
  { id: 'tic-tac-toe', name: '井字棋', render: 'DOM' },
  { id: 'sliding-puzzle', name: '滑动拼图', render: 'DOM' },
  { id: 'color-sort', name: '颜色排序', render: 'DOM' },
  { id: 'memory-card', name: '记忆翻牌', render: 'DOM' },
  { id: 'nonogram', name: '数织', render: 'DOM' },
  { id: 'pipe-puzzle', name: '接水管', render: 'DOM' },
  { id: 'guess-number', name: '猜数字', render: 'DOM' },
  { id: 'gomoku', name: '五子棋', render: 'DOM' },
  { id: 'one-stroke', name: '一笔画', render: 'DOM' },
  { id: 'rubiks-cube', name: '魔方', render: 'DOM' },
  { id: 'maze', name: '迷宫', render: 'DOM' },
  { id: 'flow-free', name: '连线游戏', render: 'DOM' },
  { id: 'hanzi-wordle', name: '汉字连连猜', render: 'DOM' },
  { id: 'hanzi-riddle', name: '汉字猜谜', render: 'DOM' },
  { id: 'tangram', name: '七巧板', render: 'DOM' },
  { id: 'reversi', name: '黑白棋', render: 'DOM' },
];

const configs = [
  'package.json',
  'next.config.js',
  'tsconfig.json',
  'tailwind.config.ts',
  'postcss.config.js',
  'eslint.config.js',
  '.prettierrc',
  'jest.config.js',
  'jest.setup.ts',
];

const sharedLib = [
  { group: 'types', items: ['registry.ts (GameMeta)', 'game.ts (BaseGameStatus, Position...)'] },
  { group: 'components', items: ['GameLayout.tsx', 'GameOverlay.tsx', 'GamePageHeader.tsx', 'ControlHints.tsx'] },
  { group: 'hooks', items: ['useHighScore.ts', 'useKeyboard.ts', 'useIntervalLoop.ts', 'useGameFrame.ts'] },
  { group: 'utils', items: ['format.ts', 'collision.ts'] },
];

const gameModuleFiles = [
  'meta.ts',
  'page.tsx',
  'types/game.ts',
  'constants/config.ts',
  'hooks/use<Game>.ts',
  'components/*.tsx',
  '__tests__/*.test.ts',
];

export default function ProjectStructureCanvas() {
  const { tokens } = useHostTheme();

  const pageStyle: CSSProperties = {
    background: tokens.bg.editor,
    color: tokens.text.primary,
    minHeight: '100%',
    padding: 32,
  };

  const sectionCardStyle: CSSProperties = {
    background: tokens.bg.elevated,
    border: `1px solid ${tokens.stroke.tertiary}`,
  };

  const itemStyle: CSSProperties = {
    background: tokens.fill.tertiary,
    borderRadius: tokens.radius.md,
    padding: '8px 12px',
  };

  const arrowStyle: CSSProperties = {
    color: tokens.accent.control,
    fontWeight: 'bold',
    fontSize: 20,
  };

  const renderBadge = (text: string) => (
    <span
      style={{
        fontSize: 10,
        padding: '2px 6px',
        borderRadius: tokens.radius.full,
        background: tokens.accent.control,
        color: tokens.text.onAccent,
        marginLeft: 8,
      }}
    >
      {text}
    </span>
  );

  return (
    <ZoomableViewport initialZoom={0.85} minZoom={0.5} maxZoom={2} wheelZoom="ctrlOrMeta">
      <Stack gap={8} style={pageStyle}>
        <H1 style={{ textAlign: 'center', margin: 0 }}>QoderTest 项目结构图</H1>
        <Text tone="secondary" style={{ textAlign: 'center' }}>
          Next.js 14 App Router · 浏览器小游戏中心 · 31 款游戏
        </Text>

        {/* 配置层 */}
        <Card style={sectionCardStyle}>
          <CardHeader title={<H2 style={{ margin: 0 }}>配置层</H2>} />
          <CardBody>
            <Grid columns={3} gap={3}>
              {configs.map((cfg) => (
                <div key={cfg} style={itemStyle}>
                  <Text>{cfg}</Text>
                </div>
              ))}
            </Grid>
          </CardBody>
        </Card>

        {/* 入口与注册流 */}
        <Card style={sectionCardStyle}>
          <CardHeader title={<H2 style={{ margin: 0 }}>入口与注册流</H2>} />
          <CardBody>
            <Stack gap={6}>
              <Grid columns={2} gap={4}>
                <div style={itemStyle}>
                  <H3 style={{ margin: '0 0 8px' }}>app/layout.tsx</H3>
                  <Text tone="secondary" size="small">根布局、globals.css、元数据</Text>
                </div>
                <div style={itemStyle}>
                  <H3 style={{ margin: '0 0 8px' }}>app/page.tsx</H3>
                  <Text tone="secondary" size="small">游戏卡片首页，读取 GAME_REGISTRY</Text>
                </div>
              </Grid>

              <div style={{ ...itemStyle, textAlign: 'center' }}>
                <H3 style={{ margin: 0 }}>注册中心：lib/registry.ts</H3>
                <Text tone="secondary" size="small">聚合所有 app/&lt;game&gt;/meta.ts，导出 GAME_REGISTRY</Text>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 12,
                  flexWrap: 'wrap',
                }}
              >
                <div style={itemStyle}>app/&lt;game&gt;/meta.ts</div>
                <span style={arrowStyle}>→</span>
                <div style={{ ...itemStyle, background: tokens.accent.control, color: tokens.text.onAccent }}>
                  lib/registry.ts
                </div>
                <span style={arrowStyle}>→</span>
                <div style={itemStyle}>app/page.tsx</div>
                <span style={arrowStyle}>→</span>
                <div style={itemStyle}>app/&lt;game&gt;/page.tsx</div>
              </div>
            </Stack>
          </CardBody>
        </Card>

        {/* 共享库 */}
        <Card style={sectionCardStyle}>
          <CardHeader title={<H2 style={{ margin: 0 }}>共享库 lib/</H2>} />
          <CardBody>
            <Grid columns={4} gap={4} minColumnWidth={180}>
              {sharedLib.map((group) => (
                <Stack key={group.group} gap={2} style={itemStyle}>
                  <H3 style={{ margin: 0, color: tokens.accent.control }}>{group.group}/</H3>
                  {group.items.map((item) => (
                    <Text key={item} size="small" tone="secondary">
                      {item}
                    </Text>
                  ))}
                </Stack>
              ))}
            </Grid>
          </CardBody>
        </Card>

        {/* 标准游戏模块结构 */}
        <Card style={sectionCardStyle}>
          <CardHeader title={<H2 style={{ margin: 0 }}>标准游戏模块结构 app/&lt;game-id&gt;/</H2>} />
          <CardBody>
            <Grid columns={4} gap={3} minColumnWidth={160}>
              {gameModuleFiles.map((file) => (
                <div key={file} style={itemStyle}>
                  <Text>{file}</Text>
                </div>
              ))}
            </Grid>
          </CardBody>
        </Card>

        {/* 游戏列表 */}
        <Card style={sectionCardStyle}>
          <CardHeader
            title={
              <H2 style={{ margin: 0 }}>
                游戏列表
                {renderBadge('31 款')}
              </H2>
            }
          />
          <CardBody>
            <Grid columns={6} gap={3} minColumnWidth={120}>
              {games.map((game) => (
                <div
                  key={game.id}
                  style={{
                    ...itemStyle,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <Text size="small">{game.name}</Text>
                  {renderBadge(game.render)}
                </div>
              ))}
            </Grid>
          </CardBody>
        </Card>

        {/* 文档与资源 */}
        <Card style={sectionCardStyle}>
          <CardHeader title={<H2 style={{ margin: 0 }}>文档与资源</H2>} />
          <CardBody>
            <Grid columns={3} gap={3}>
              {['AGENTS.md', 'README.md', 'PRODUCT.md', 'FEATURES.md', 'docs/superpowers/', 'public/images/'].map((doc) => (
                <div key={doc} style={itemStyle}>
                  <Text>{doc}</Text>
                </div>
              ))}
            </Grid>
          </CardBody>
        </Card>
      </Stack>
    </ZoomableViewport>
  );
}

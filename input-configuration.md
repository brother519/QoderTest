# 拳皇游戏输入配置说明

## Unity输入管理器设置

在Unity编辑器中，需要在Edit > Project Settings > Input Manager中添加以下输入轴配置：

### 玩家1输入配置：

1. 名称: P1_Horizontal
   - Descriptive Name: Player 1 Horizontal
   - Negative Button: a
   - Positive Button: d
   - Alt Negative Button: left
   - Alt Positive Button: right
   - Gravity: 3
   - Dead: 0.001
   - Sensitivity: 3
   - Type: Key or Mouse Button
   - Axis: Not Used
   - Joy Num: Get Motion from all Joysticks

2. 名称: P1_Jump
   - Descriptive Name: Player 1 Jump
   - Positive Button: w
   - Alt Positive Button: up
   - Gravity: 1000
   - Dead: 0.001
   - Sensitivity: 1000
   - Type: Key or Mouse Button
   - Axis: Not Used
   - Joy Num: Get Motion from all Joysticks

3. 名称: P1_Attack
   - Descriptive Name: Player 1 Attack
   - Positive Button: j
   - Gravity: 1000
   - Dead: 0.001
   - Sensitivity: 1000
   - Type: Key or Mouse Button
   - Axis: Not Used
   - Joy Num: Get Motion from all Joysticks

4. 名称: P1_Skill1
   - Descriptive Name: Player 1 Skill 1
   - Positive Button: k
   - Gravity: 1000
   - Dead: 0.001
   - Sensitivity: 1000
   - Type: Key or Mouse Button
   - Axis: Not Used
   - Joy Num: Get Motion from all Joysticks

5. 名称: P1_Skill2
   - Descriptive Name: Player 1 Skill 2
   - Positive Button: l
   - Gravity: 1000
   - Dead: 0.001
   - Sensitivity: 1000
   - Type: Key or Mouse Button
   - Axis: Not Used
   - Joy Num: Get Motion from all Joysticks

6. 名称: P1_Skill3
   - Descriptive Name: Player 1 Skill 3
   - Positive Button: i
   - Gravity: 1000
   - Dead: 0.001
   - Sensitivity: 1000
   - Type: Key or Mouse Button
   - Axis: Not Used
   - Joy Num: Get Motion from all Joysticks

### 玩家2输入配置：

1. 名称: P2_Horizontal
   - Descriptive Name: Player 2 Horizontal
   - Negative Button: left
   - Positive Button: right
   - Alt Negative Button: a (当使用键盘时)
   - Alt Positive Button: d (当使用键盘时)
   - Gravity: 3
   - Dead: 0.001
   - Sensitivity: 3
   - Type: Key or Mouse Button
   - Axis: Not Used
   - Joy Num: Get Motion from all Joysticks

2. 名称: P2_Jump
   - Descriptive Name: Player 2 Jump
   - Positive Button: numpad8
   - Alt Positive Button: up (当使用键盘时)
   - Gravity: 1000
   - Dead: 0.001
   - Sensitivity: 1000
   - Type: Key or Mouse Button
   - Axis: Not Used
   - Joy Num: Get Motion from all Joysticks

3. 名称: P2_Attack
   - Descriptive Name: Player 2 Attack
   - Positive Button: numpad5
   - Gravity: 1000
   - Dead: 0.001
   - Sensitivity: 1000
   - Type: Key or Mouse Button
   - Axis: Not Used
   - Joy Num: Get Motion from all Joysticks

4. 名称: P2_Skill1
   - Descriptive Name: Player 2 Skill 1
   - Positive Button: numpad4
   - Gravity: 1000
   - Dead: 0.001
   - Sensitivity: 1000
   - Type: Key or Mouse Button
   - Axis: Not Used
   - Joy Num: Get Motion from all Joysticks

5. 名称: P2_Skill2
   - Descriptive Name: Player 2 Skill 2
   - Positive Button: numpad6
   - Gravity: 1000
   - Dead: 0.001
   - Sensitivity: 1000
   - Type: Key or Mouse Button
   - Axis: Not Used
   - Joy Num: Get Motion from all Joysticks

6. 名称: P2_Skill3
   - Descriptive Name: Player 2 Skill 3
   - Positive Button: numpad7
   - Gravity: 1000
   - Dead: 0.001
   - Sensitivity: 1000
   - Type: Key or Mouse Button
   - Axis: Not Used
   - Joy Num: Get Motion from all Joysticks

## 预设键位说明

### 玩家1 (键盘)
- 移动: A/D 或 方向键左右
- 跳跃: W 或 上方向键
- 攻击: J
- 技能1: K
- 技能2: L
- 技能3: I

### 玩家2 (键盘)
- 移动: 方向键
- 跳跃: 小键盘8
- 攻击: 小键盘5
- 技能1: 小键盘4
- 技能2: 小键盘6
- 技能3: 小键盘7

## 注意事项

1. 确保在Unity项目中正确配置了这些输入轴
2. 这些配置适用于键盘输入，如需支持手柄需额外配置
3. 可以根据需要调整重力和灵敏度参数
4. 死区值(Dead)用于防止摇杆漂移
# 拳皇游戏技术实现方案

## 1. 开发环境设置

### 1.1 软件需求
- Unity 2021.3 LTS 或更高版本
- Visual Studio 或 Rider 作为代码编辑器
- Git 版本控制系统

### 1.2 项目设置
1. 创建新的2D Unity项目
2. 设置项目结构和文件夹组织
3. 配置构建设置

### 1.3 资源准备
- 2D角色精灵图
- UI元素资源
- 音频文件
- 特效素材

## 2. 核心系统实现步骤

### 2.1 游戏管理器实现

创建 `GameManager.cs`：

```csharp
using UnityEngine;
using UnityEngine.SceneManagement;

public class GameManager : MonoBehaviour
{
    public static GameManager Instance { get; private set; }
    
    [Header("Game Settings")]
    public int playerLives = 2;
    public float gameSpeed = 1.0f;
    
    [Header("Character Settings")]
    public CharacterData[] characters;
    
    private void Awake()
    {
        if (Instance == null)
        {
            Instance = this;
            DontDestroyOnLoad(gameObject);
        }
        else
        {
            Destroy(gameObject);
        }
    }
    
    public void StartGame()
    {
        SceneManager.LoadScene("CharacterSelect");
    }
    
    public void RestartGame()
    {
        SceneManager.LoadScene(SceneManager.GetActiveScene().name);
    }
    
    public void QuitGame()
    {
        Application.Quit();
    }
}
```

### 2.2 角色基类实现

创建 `Character.cs`：

```csharp
using UnityEngine;

public abstract class Character : MonoBehaviour
{
    [Header("Character Stats")]
    public string characterName;
    public int maxHealth = 100;
    public int currentHealth;
    public int attackPower = 10;
    public int defense = 5;
    public float moveSpeed = 5f;
    public float jumpForce = 8f;
    
    [Header("Combat Settings")]
    public float attackRange = 1.5f;
    public float attackCooldown = 0.5f;
    protected float lastAttackTime = 0f;
    
    [Header("Animation")]
    protected Animator animator;
    protected Rigidbody2D rb;
    public float energy = 100.0f;
    public float maxEnergy = 100.0f;
    
    protected virtual void Start()
    {
        currentHealth = maxHealth;
        energy = maxEnergy;
        animator = GetComponent<Animator>();
        rb = GetComponent<Rigidbody2D>();
    }
    
    public virtual void TakeDamage(int damage)
    {
        int actualDamage = Mathf.Max(1, damage - defense);
        currentHealth -= actualDamage;
        
        if (currentHealth <= 0)
        {
            currentHealth = 0;
            OnCharacterDeath();
        }
        
        // 触发受伤动画
        if (animator != null)
            animator.SetTrigger("TakeDamage");
    }
    
    public virtual void Attack()
    {
        if (Time.time - lastAttackTime >= attackCooldown)
        {
            lastAttackTime = Time.time;
            
            // 触发攻击动画
            if (animator != null)
                animator.SetTrigger("Attack");
                
            // 检查攻击范围内是否有敌人
            CheckAttackHit();
        }
    }
    
    protected virtual void CheckAttackHit()
    {
        // 实现攻击碰撞检测
        Vector2 direction = transform.localScale.x > 0 ? Vector2.right : Vector2.left;
        Vector2 attackPosition = (Vector2)transform.position + direction * attackRange / 2;
        
        RaycastHit2D hit = Physics2D.Raycast(attackPosition, direction, attackRange, LayerMask.GetMask("Player"));
        
        if (hit.collider != null && hit.collider.gameObject != gameObject)
        {
            Character target = hit.collider.GetComponent<Character>();
            if (target != null)
            {
                target.TakeDamage(attackPower);
            }
        }
    }
    
    protected virtual void OnCharacterDeath()
    {
        // 角色死亡时的处理
        if (animator != null)
            animator.SetTrigger("Death");
            
        // 播放死亡音效
        AudioManager.Instance?.PlaySFX(0); // 假设索引0是死亡音效
        
        // 销毁角色
        Destroy(gameObject, 1f);
    }
    
    public virtual void Move(Vector2 direction)
    {
        if (rb != null)
        {
            rb.velocity = new Vector2(direction.x * moveSpeed, rb.velocity.y);
            
            // 翻转角色朝向
            if (direction.x > 0)
                transform.localScale = new Vector3(Mathf.Abs(transform.localScale.x), transform.localScale.y, transform.localScale.z);
            else if (direction.x < 0)
                transform.localScale = new Vector3(-Mathf.Abs(transform.localScale.x), transform.localScale.y, transform.localScale.z);
        }
    }
    
    public virtual void Jump()
    {
        if (IsGrounded())
        {
            rb.velocity = new Vector2(rb.velocity.x, jumpForce);
        }
    }
    
    protected virtual bool IsGrounded()
    {
        // 检查角色是否在地面上
        Vector2 position = transform.position;
        Vector2 direction = Vector2.down;
        float distance = 0.1f;
        
        return Physics2D.Raycast(position, direction, distance, LayerMask.GetMask("Ground"));
    }
    
    private void OnDrawGizmosSelected()
    {
        // 绘制攻击范围的可视化辅助
        Vector2 direction = transform.localScale.x > 0 ? Vector2.right : Vector2.left;
        Vector2 attackPosition = (Vector2)transform.position + direction * attackRange / 2;
        
        Gizmos.color = Color.red;
        Gizmos.DrawLine(transform.position, attackPosition);
        Gizmos.DrawWireCube(attackPosition, new Vector3(attackRange, 0.5f, 0));
    }
}
```

### 2.3 玩家类实现

创建 `Player.cs`：

```csharp
using UnityEngine;

public class Player : Character
{
    [Header("Player Settings")]
    public int playerNumber = 1;
    public bool isAIControlled = false;
    
    [Header("Skills")]
    public Skill[] skills;
    
    private bool facingRight = true;
    
    protected override void Start()
    {
        base.Start();
    }
    
    private void Update()
    {
        if (!BattleManager.Instance.isPaused)
        {
            if (!isAIControlled)
            {
                HandlePlayerInput();
            }
            else
            {
                HandleAIInput();
            }
        }
    }
    
    private void HandlePlayerInput()
    {
        // 移动控制
        float moveInput = 0;
        if (playerNumber == 1)
        {
            moveInput = Input.GetAxisRaw("P1_Horizontal");
        }
        else if (playerNumber == 2)
        {
            moveInput = Input.GetAxisRaw("P2_Horizontal");
        }
        
        Move(new Vector2(moveInput, 0));
        
        // 跳跃控制
        if ((playerNumber == 1 && Input.GetButtonDown("P1_Jump")) || 
            (playerNumber == 2 && Input.GetButtonDown("P2_Jump")))
        {
            Jump();
        }
        
        // 攻击控制
        if ((playerNumber == 1 && Input.GetButtonDown("P1_Attack")) || 
            (playerNumber == 2 && Input.GetButtonDown("P2_Attack")))
        {
            Attack();
        }
        
        // 技能控制
        if (playerNumber == 1)
        {
            if (Input.GetButtonDown("P1_Skill1") && skills.Length > 0) UseSkill(0);
            if (Input.GetButtonDown("P1_Skill2") && skills.Length > 1) UseSkill(1);
            if (Input.GetButtonDown("P1_Skill3") && skills.Length > 2) UseSkill(2);
        }
        else if (playerNumber == 2)
        {
            if (Input.GetButtonDown("P2_Skill1") && skills.Length > 0) UseSkill(0);
            if (Input.GetButtonDown("P2_Skill2") && skills.Length > 1) UseSkill(1);
            if (Input.GetButtonDown("P2_Skill3") && skills.Length > 2) UseSkill(2);
        }
    }
    
    private void HandleAIInput()
    {
        // 简单的AI逻辑
        Character target = FindClosestTarget();
        
        if (target != null)
        {
            float distanceToTarget = Vector2.Distance(transform.position, target.transform.position);
            
            if (distanceToTarget > attackRange)
            {
                // 移向目标
                Vector2 direction = (target.transform.position - transform.position).normalized;
                Move(new Vector2(direction.x, 0));
            }
            else if (Time.time - lastAttackTime >= attackCooldown)
            {
                // 攻击目标
                Attack();
            }
        }
    }
    
    private Character FindClosestTarget()
    {
        // 查找最近的敌人
        Character[] allCharacters = FindObjectsOfType<Character>();
        Character closest = null;
        float closestDistance = Mathf.Infinity;
        
        foreach (Character character in allCharacters)
        {
            if (character != this && character.currentHealth > 0)
            {
                float distance = Vector2.Distance(transform.position, character.transform.position);
                if (distance < closestDistance)
                {
                    closest = character;
                    closestDistance = distance;
                }
            }
        }
        
        return closest;
    }
    
    protected override void OnCharacterDeath()
    {
        base.OnCharacterDeath();
        BattleManager.Instance?.CheckBattleEnd();
    }
    
    public void UseSkill(int skillIndex)
    {
        if (skillIndex >= 0 && skillIndex < skills.Length)
        {
            skills[skillIndex].UseSkill(this);
        }
    }
}
```

### 2.4 技能系统实现

创建 `Skill.cs` 脚本：

```csharp
using UnityEngine;

[System.Serializable]
public class Skill
{
    [Header("Skill Info")]
    public string skillName;
    public string skillDescription;
    public int skillDamage = 20;
    public float skillRange = 2.0f;
    public float skillCooldown = 1.0f;
    public float skillCost = 10.0f; // 能量消耗
    
    [Header("Animation")]
    public string animationTrigger = "Skill1";
    
    [Header("Effects")]
    public GameObject skillEffect;
    public AudioClip skillSound;
    
    private float lastUsedTime = 0f;
    
    public bool CanUseSkill(float currentEnergy)
    {
        return Time.time - lastUsedTime >= skillCooldown && currentEnergy >= skillCost;
    }
    
    public void UseSkill(Player user)
    {
        if (CanUseSkill(user.energy))
        {
            // 播放动画
            if (user.animator != null)
                user.animator.SetTrigger(animationTrigger);
                
            // 播放音效
            if (skillSound != null)
                AudioManager.Instance?.PlaySFX(0);
                
            // 创建特效
            if (skillEffect != null)
            {
                Vector3 effectPos = user.transform.position;
                GameObject effect = Object.Instantiate(skillEffect, effectPos, Quaternion.identity);
                Object.Destroy(effect, 2f);
            }
            
            // 减少能量
            user.energy -= skillCost;
            
            // 更新最后使用时间
            lastUsedTime = Time.time;
            
            // 执行技能效果
            ExecuteSkillEffect(user);
        }
    }
    
    protected virtual void ExecuteSkillEffect(Player user)
    {
        // 检查技能范围内的敌人
        Vector2 direction = user.transform.localScale.x > 0 ? Vector2.right : Vector2.left;
        Vector2 skillPosition = (Vector2)user.transform.position + direction * skillRange / 2;
        
        Collider2D[] hits = Physics2D.OverlapCircleAll(skillPosition, skillRange / 2, LayerMask.GetMask("Player"));
        
        foreach (Collider2D hit in hits)
        {
            Character target = hit.GetComponent<Character>();
            if (target != null && target != user)
            {
                target.TakeDamage(skillDamage);
            }
        }
    }
}
```

### 2.5 战斗管理器实现

创建 `BattleManager.cs`：

```csharp
using UnityEngine;
using UnityEngine.SceneManagement;

public class BattleManager : MonoBehaviour
{
    public static BattleManager Instance { get; private set; }
    
    [Header("Battle Settings")]
    public Transform[] playerSpawnPoints;
    public Transform[] enemySpawnPoints;
    
    [Header("Game State")]
    public bool isBattleActive = false;
    public bool isPaused = false;
    
    private Player player1;
    private Player player2;
    
    private void Awake()
    {
        if (Instance == null)
        {
            Instance = this;
        }
        else
        {
            Destroy(gameObject);
        }
    }
    
    private void Start()
    {
        InitializeBattle();
    }
    
    private void InitializeBattle()
    {
        // 创建玩家和对手
        CreatePlayers();
        isBattleActive = true;
    }
    
    private void CreatePlayers()
    {
        // 从角色选择获取玩家选择的角色
        int player1CharIndex = PlayerPrefs.GetInt("Player1CharacterIndex", 0);
        int player2CharIndex = PlayerPrefs.GetInt("Player2CharacterIndex", 1);
        
        // 实例化角色 - 这里需要根据实际角色预制件来调整
        GameObject player1Obj = Instantiate(Resources.Load<GameObject>($"Characters/Character{player1CharIndex}"), 
                                          playerSpawnPoints[0].position, Quaternion.identity);
        GameObject player2Obj = Instantiate(Resources.Load<GameObject>($"Characters/Character{player2CharIndex}"), 
                                          playerSpawnPoints[1].position, Quaternion.identity);
        
        player1 = player1Obj.GetComponent<Player>();
        player2 = player2Obj.GetComponent<Player>();
        
        if (player1 != null) player1.playerNumber = 1;
        if (player2 != null) player2.playerNumber = 2;
    }
    
    public void CheckBattleEnd()
    {
        if (player1 == null || player1.currentHealth <= 0)
        {
            EndBattle(2); // 玩家2获胜
        }
        else if (player2 == null || player2.currentHealth <= 0)
        {
            EndBattle(1); // 玩家1获胜
        }
    }
    
    private void EndBattle(int winner)
    {
        isBattleActive = false;
        Debug.Log($"Player {winner} wins!");
        
        // 通知UI显示结果
        BattleUI battleUI = FindObjectOfType<BattleUI>();
        if (battleUI != null)
        {
            battleUI.ShowGameOver(winner);
        }
    }
    
    public void PauseGame()
    {
        isPaused = true;
        Time.timeScale = 0f;
    }
    
    public void ResumeGame()
    {
        isPaused = false;
        Time.timeScale = 1f;
    }
    
    public void RestartBattle()
    {
        SceneManager.LoadScene(SceneManager.GetActiveScene().name);
    }
    
    public void BackToMenu()
    {
        Time.timeScale = 1f; // 确保时间正常流动
        SceneManager.LoadScene("MainMenu");
    }
}
```

## 3. UI系统实现

### 3.1 战斗UI实现

创建 `BattleUI.cs`：

```csharp
using UnityEngine;
using UnityEngine.UI;
using UnityEngine.SceneManagement;

public class BattleUI : MonoBehaviour
{
    [Header("Health Bars")]
    public Slider player1HealthBar;
    public Slider player2HealthBar;
    
    [Header("Energy Bars")]
    public Slider player1EnergyBar;
    public Slider player2EnergyBar;
    
    [Header("Character Names")]
    public Text player1NameText;
    public Text player2NameText;
    
    [Header("UI Panels")]
    public GameObject battleUIPanel;
    public GameObject gameOverPanel;
    public Text winnerText;
    
    [Header("Timer")]
    public Text timerText;
    public float battleTime = 99f;
    
    private Player player1;
    private Player player2;
    
    private void Start()
    {
        InitializeBattleUI();
        InvokeRepeating("UpdateTimer", 1f, 1f);
    }
    
    private void InitializeBattleUI()
    {
        // 获取场景中的玩家
        Player[] players = FindObjectsOfType<Player>();
        foreach (Player p in players)
        {
            if (p.playerNumber == 1)
                player1 = p;
            else if (p.playerNumber == 2)
                player2 = p;
        }
        
        if (player1 != null)
        {
            player1NameText.text = player1.characterName;
            player1HealthBar.maxValue = player1.maxHealth;
            player1HealthBar.value = player1.currentHealth;
            player1EnergyBar.maxValue = player1.maxEnergy;
            player1EnergyBar.value = player1.energy;
        }
        
        if (player2 != null)
        {
            player2NameText.text = player2.characterName;
            player2HealthBar.maxValue = player2.maxHealth;
            player2HealthBar.value = player2.currentHealth;
            player2EnergyBar.maxValue = player2.maxEnergy;
            player2EnergyBar.value = player2.energy;
        }
    }
    
    private void Update()
    {
        UpdateHealthBars();
        UpdateEnergyBars();
    }
    
    private void UpdateHealthBars()
    {
        if (player1 != null)
            player1HealthBar.value = player1.currentHealth;
        
        if (player2 != null)
            player2HealthBar.value = player2.currentHealth;
    }
    
    private void UpdateEnergyBars()
    {
        if (player1 != null)
            player1EnergyBar.value = player1.energy;
        
        if (player2 != null)
            player2EnergyBar.value = player2.energy;
    }
    
    private void UpdateTimer()
    {
        if (BattleManager.Instance.isBattleActive && !BattleManager.Instance.isPaused)
        {
            battleTime -= 1f;
            if (timerText != null)
                timerText.text = Mathf.CeilToInt(battleTime).ToString();
            
            if (battleTime <= 0)
            {
                // 时间结束，判断生命值较高者获胜
                EndByTimeLimit();
            }
        }
    }
    
    private void EndByTimeLimit()
    {
        if (player1.currentHealth > player2.currentHealth)
            ShowGameOver(1);
        else if (player2.currentHealth > player1.currentHealth)
            ShowGameOver(2);
        else
            ShowGameOver(0); // 平局
    }
    
    public void ShowGameOver(int winnerPlayerNumber)
    {
        BattleManager.Instance.isBattleActive = false;
        battleUIPanel.SetActive(false);
        gameOverPanel.SetActive(true);
        
        if (winnerPlayerNumber == 1)
            winnerText.text = $"{player1.characterName} Wins!";
        else if (winnerPlayerNumber == 2)
            winnerText.text = $"{player2.characterName} Wins!";
        else
            winnerText.text = "Draw!";
    }
    
    public void RestartBattle()
    {
        BattleManager.Instance.RestartBattle();
    }
    
    public void BackToMenu()
    {
        BattleManager.Instance.BackToMenu();
    }
}
```

## 4. 输入系统配置

### 4.1 Unity输入管理器设置

在Unity编辑器中，需要在Edit > Project Settings > Input Manager中添加以下输入轴：

#### 玩家1输入：
- P1_Horizontal: 
  - Descriptive Name: Player 1 Horizontal
  - Negative Button: a
  - Positive Button: d
  - Alt Negative Button: left
  - Alt Positive Button: right
- P1_Jump: 
  - Descriptive Name: Player 1 Jump
  - Positive Button: w
  - Alt Positive Button: up
- P1_Attack: 
  - Descriptive Name: Player 1 Attack
  - Positive Button: j
- P1_Skill1: 
  - Descriptive Name: Player 1 Skill 1
  - Positive Button: k
- P1_Skill2: 
  - Descriptive Name: Player 1 Skill 2
  - Positive Button: l
- P1_Skill3: 
  - Descriptive Name: Player 1 Skill 3
  - Positive Button: i

#### 玩家2输入：
- P2_Horizontal: 
  - Descriptive Name: Player 2 Horizontal
  - Negative Button: left
  - Positive Button: right
- P2_Jump: 
  - Descriptive Name: Player 2 Jump
  - Positive Button: numpad8
- P2_Attack: 
  - Descriptive Name: Player 2 Attack
  - Positive Button: numpad5
- P2_Skill1: 
  - Descriptive Name: Player 2 Skill 1
  - Positive Button: numpad4
- P2_Skill2: 
  - Descriptive Name: Player 2 Skill 2
  - Positive Button: numpad6
- P2_Skill3: 
  - Descriptive Name: Player 2 Skill 3
  - Positive Button: numpad7

## 5. 测试计划

### 5.1 单元测试
- 角色属性系统测试
- 战斗判定系统测试
- 技能系统测试

### 5.2 集成测试
- 战斗流程测试
- 角色选择功能测试
- UI系统测试

### 5.3 性能测试
- 游戏帧率测试
- 内存使用测试
- 加载时间测试

## 6. 优化方案

### 6.1 性能优化
- 对象池系统减少GC压力
- 精灵图集优化渲染
- 碰撞检测优化

### 6.2 用户体验优化
- 操作反馈增强
- UI响应优化
- 音效同步优化

## 7. 扩展功能

### 7.1 额外功能
- 训练模式
- 回放系统
- 在线对战（未来扩展）

### 7.2 角色扩展
- 更多可玩角色
- 角色平衡调整
- 新技能系统
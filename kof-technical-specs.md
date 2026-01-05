# 拳皇游戏技术规格文档

## 1. 项目结构

```
KOF-Game/
├── Assets/
│   ├── Scripts/
│   │   ├── Core/
│   │   │   ├── GameManager.cs
│   │   │   ├── BattleManager.cs
│   │   │   └── AudioManager.cs
│   │   ├── Characters/
│   │   │   ├── Character.cs
│   │   │   ├── Player.cs
│   │   │   ├── Enemy.cs
│   │   │   └── CharacterFactory.cs
│   │   ├── Combat/
│   │   │   ├── AttackSystem.cs
│   │   │   ├── SkillSystem.cs
│   │   │   └── CollisionHandler.cs
│   │   ├── UI/
│   │   │   ├── MainMenu.cs
│   │   │   ├── CharacterSelect.cs
│   │   │   └── BattleUI.cs
│   │   └── Data/
│   │       ├── CharacterData.cs
│   │       └── SkillData.cs
│   ├── Scenes/
│   │   ├── MainMenu.unity
│   │   ├── CharacterSelect.unity
│   │   └── Battle.unity
│   ├── Sprites/
│   ├── Audio/
│   └── Prefabs/
├── ProjectSettings/
└── Packages/
```

## 2. 核心系统设计

### 2.1 游戏管理器 (GameManager.cs)

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

### 2.2 战斗管理器 (BattleManager.cs)

```csharp
using UnityEngine;

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
        string player1Char = PlayerPrefs.GetString("Player1Character", "Default");
        string player2Char = PlayerPrefs.GetString("Player2Character", "Default");
        
        // 实例化角色
        GameObject player1Obj = Instantiate(GetCharacterPrefab(player1Char), playerSpawnPoints[0].position, Quaternion.identity);
        GameObject player2Obj = Instantiate(GetCharacterPrefab(player2Char), playerSpawnPoints[1].position, Quaternion.identity);
        
        player1 = player1Obj.GetComponent<Player>();
        player2 = player2Obj.GetComponent<Player>();
    }
    
    private GameObject GetCharacterPrefab(string characterName)
    {
        // 返回对应角色的预制件
        // 实现根据角色名称获取预制件的逻辑
        return Resources.Load<GameObject>($"Characters/{characterName}");
    }
    
    public void CheckBattleEnd()
    {
        if (player1 == null || player1.CurrentHealth <= 0)
        {
            EndBattle(2); // 玩家2获胜
        }
        else if (player2 == null || player2.CurrentHealth <= 0)
        {
            EndBattle(1); // 玩家1获胜
        }
    }
    
    private void EndBattle(int winner)
    {
        isBattleActive = false;
        Debug.Log($"Player {winner} wins!");
        // 触发战斗结束UI
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
}
```

### 2.3 音频管理器 (AudioManager.cs)

```csharp
using UnityEngine;

public class AudioManager : MonoBehaviour
{
    public static AudioManager Instance { get; private set; }
    
    [Header("Audio Sources")]
    public AudioSource bgmSource;
    public AudioSource sfxSource;
    
    [Header("Audio Clips")]
    public AudioClip[] bgmClips;
    public AudioClip[] sfxClips;
    
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
    
    public void PlayBGM(int clipIndex)
    {
        if (clipIndex < bgmClips.Length)
        {
            bgmSource.clip = bgmClips[clipIndex];
            bgmSource.loop = true;
            bgmSource.Play();
        }
    }
    
    public void PlaySFX(int clipIndex)
    {
        if (clipIndex < sfxClips.Length)
        {
            sfxSource.PlayOneShot(sfxClips[clipIndex]);
        }
    }
    
    public void StopBGM()
    {
        bgmSource.Stop();
    }
    
    public void SetVolume(float volume)
    {
        AudioListener.volume = volume;
    }
}
```

## 3. 角色系统设计

### 3.1 角色基类 (Character.cs)

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
    
    protected virtual void Start()
    {
        currentHealth = maxHealth;
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

### 3.2 玩家类 (Player.cs)

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
            moveInput = Input.GetAxisRaw("Horizontal_P1");
        }
        else if (playerNumber == 2)
        {
            moveInput = Input.GetAxisRaw("Horizontal_P2");
        }
        
        Move(new Vector2(moveInput, 0));
        
        // 跳跃控制
        if ((playerNumber == 1 && Input.GetButtonDown("Jump_P1")) || 
            (playerNumber == 2 && Input.GetButtonDown("Jump_P2")))
        {
            Jump();
        }
        
        // 攻击控制
        if ((playerNumber == 1 && Input.GetButtonDown("Attack_P1")) || 
            (playerNumber == 2 && Input.GetButtonDown("Attack_P2")))
        {
            Attack();
        }
        
        // 技能控制
        if (playerNumber == 1)
        {
            if (Input.GetButtonDown("Skill1_P1") && skills.Length > 0) skills[0].UseSkill(this);
            if (Input.GetButtonDown("Skill2_P1") && skills.Length > 1) skills[1].UseSkill(this);
            if (Input.GetButtonDown("Skill3_P1") && skills.Length > 2) skills[2].UseSkill(this);
        }
        else if (playerNumber == 2)
        {
            if (Input.GetButtonDown("Skill1_P2") && skills.Length > 0) skills[0].UseSkill(this);
            if (Input.GetButtonDown("Skill2_P2") && skills.Length > 1) skills[1].UseSkill(this);
            if (Input.GetButtonDown("Skill3_P2") && skills.Length > 2) skills[2].UseSkill(this);
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

## 4. 战斗系统设计

### 4.1 技能系统 (SkillSystem.cs)

```csharp
using UnityEngine;

[CreateAssetMenu(fileName = "New Skill", menuName = "KOF/Skill")]
public class Skill : ScriptableObject
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
    
    public void UseSkill(Character user)
    {
        if (CanUseSkill(user.GetComponent<Player>().energy))
        {
            // 播放动画
            if (user.animator != null)
                user.animator.SetTrigger(animationTrigger);
                
            // 播放音效
            if (skillSound != null)
                AudioManager.Instance?.PlaySFX(Array.IndexOf(AudioManager.Instance.sfxClips, skillSound));
                
            // 创建特效
            if (skillEffect != null)
            {
                Vector3 effectPos = user.transform.position;
                GameObject effect = Instantiate(skillEffect, effectPos, Quaternion.identity);
                Destroy(effect, 2f);
            }
            
            // 减少能量
            Player player = user.GetComponent<Player>();
            if (player != null)
                player.energy -= skillCost;
                
            // 更新最后使用时间
            lastUsedTime = Time.time;
            
            // 执行技能效果
            ExecuteSkillEffect(user);
        }
    }
    
    protected virtual void ExecuteSkillEffect(Character user)
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

### 4.2 碰撞处理器 (CollisionHandler.cs)

```csharp
using UnityEngine;

public class CollisionHandler : MonoBehaviour
{
    [Header("Layers")]
    public LayerMask playerLayer;
    public LayerMask groundLayer;
    
    private void OnCollisionEnter2D(Collision2D collision)
    {
        if (IsPlayer(collision.gameObject))
        {
            HandlePlayerCollision(collision);
        }
        else if (IsGround(collision.gameObject))
        {
            HandleGroundCollision(collision);
        }
    }
    
    private void OnCollisionStay2D(Collision2D collision)
    {
        if (IsPlayer(collision.gameObject))
        {
            // 持续碰撞处理
        }
    }
    
    private bool IsPlayer(GameObject obj)
    {
        return ((1 << obj.layer) & playerLayer) != 0;
    }
    
    private bool IsGround(GameObject obj)
    {
        return ((1 << obj.layer) & groundLayer) != 0;
    }
    
    private void HandlePlayerCollision(Collision2D collision)
    {
        Player player = collision.gameObject.GetComponent<Player>();
        if (player != null)
        {
            // 处理玩家间的碰撞
            // 可能需要实现推挤效果
        }
    }
    
    private void HandleGroundCollision(Collision2D collision)
    {
        // 地面碰撞处理
        // 通常用于确认角色是否在地面上
    }
    
    private void OnTriggerEnter2D(Collider2D collider)
    {
        if (IsPlayer(collider.gameObject))
        {
            // 触发器碰撞处理
            HandleTriggerCollision(collider);
        }
    }
    
    private void HandleTriggerCollision(Collider2D collider)
    {
        // 处理触发器碰撞，比如技能命中
        Player player = collider.GetComponent<Player>();
        if (player != null)
        {
            // 技能命中处理
        }
    }
}
```

## 5. UI系统设计

### 5.1 主菜单 (MainMenu.cs)

```csharp
using UnityEngine;
using UnityEngine.SceneManagement;

public class MainMenu : MonoBehaviour
{
    [Header("UI Elements")]
    public GameObject mainMenuPanel;
    public GameObject settingsPanel;
    
    private void Start()
    {
        ShowMainMenu();
    }
    
    public void StartGame()
    {
        SceneManager.LoadScene("CharacterSelect");
    }
    
    public void ShowSettings()
    {
        mainMenuPanel.SetActive(false);
        settingsPanel.SetActive(true);
    }
    
    public void HideSettings()
    {
        settingsPanel.SetActive(false);
        mainMenuPanel.SetActive(true);
    }
    
    public void QuitGame()
    {
        GameManager.Instance.QuitGame();
    }
}
```

### 5.2 角色选择 (CharacterSelect.cs)

```csharp
using UnityEngine;
using UnityEngine.SceneManagement;

public class CharacterSelect : MonoBehaviour
{
    [Header("Character Selection")]
    public GameObject[] characterPanels;
    public GameObject[] characterPreviews;
    
    [Header("Player Selection")]
    public int player1SelectedIndex = 0;
    public int player2SelectedIndex = 0;
    
    private int currentPlayerSelecting = 1; // 1 for player 1, 2 for player 2
    
    private void Start()
    {
        UpdateCharacterPreviews();
    }
    
    public void SelectCharacter(int characterIndex)
    {
        if (currentPlayerSelecting == 1)
        {
            player1SelectedIndex = characterIndex;
            PlayerPrefs.SetInt("Player1CharacterIndex", characterIndex);
        }
        else if (currentPlayerSelecting == 2)
        {
            player2SelectedIndex = characterIndex;
            PlayerPrefs.SetInt("Player2CharacterIndex", characterIndex);
        }
        
        // 切换到下一个玩家选择
        if (currentPlayerSelecting == 1)
        {
            currentPlayerSelecting = 2;
        }
        else
        {
            // 所有玩家都已选择，开始战斗
            StartBattle();
        }
        
        UpdateCharacterPreviews();
    }
    
    private void UpdateCharacterPreviews()
    {
        // 更新角色预览显示
        for (int i = 0; i < characterPreviews.Length; i++)
        {
            if (i == player1SelectedIndex)
                characterPreviews[i].GetComponent<SpriteRenderer>().color = Color.blue; // 玩家1选择
            else if (i == player2SelectedIndex)
                characterPreviews[i].GetComponent<SpriteRenderer>().color = Color.red; // 玩家2选择
            else
                characterPreviews[i].GetComponent<SpriteRenderer>().color = Color.white; // 未选择
        }
    }
    
    public void StartBattle()
    {
        PlayerPrefs.SetInt("Player1CharacterIndex", player1SelectedIndex);
        PlayerPrefs.SetInt("Player2CharacterIndex", player2SelectedIndex);
        
        SceneManager.LoadScene("Battle");
    }
    
    public void BackToMenu()
    {
        SceneManager.LoadScene("MainMenu");
    }
}
```

### 5.3 战斗UI (BattleUI.cs)

```csharp
using UnityEngine;
using UnityEngine.UI;
using System.Collections;

public class BattleUI : MonoBehaviour
{
    [Header("Health Bars")]
    public Slider player1HealthBar;
    public Slider player2HealthBar;
    
    [Header("Character Names")]
    public Text player1NameText;
    public Text player2NameText;
    
    [Header("UI Panels")]
    public GameObject battleUIPanel;
    public GameObject gameOverPanel;
    public Text winnerText;
    
    [Header("Energy Bars")]
    public Slider player1EnergyBar;
    public Slider player2EnergyBar;
    
    private Player player1;
    private Player player2;
    
    private void Start()
    {
        InitializeBattleUI();
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
        }
        
        if (player2 != null)
        {
            player2NameText.text = player2.characterName;
            player2HealthBar.maxValue = player2.maxHealth;
            player2HealthBar.value = player2.currentHealth;
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
        {
            Player p1 = player1.GetComponent<Player>();
            if (p1 != null)
                player1EnergyBar.value = p1.energy;
        }
        
        if (player2 != null)
        {
            Player p2 = player2.GetComponent<Player>();
            if (p2 != null)
                player2EnergyBar.value = p2.energy;
        }
    }
    
    public void ShowGameOver(int winnerPlayerNumber)
    {
        battleUIPanel.SetActive(false);
        gameOverPanel.SetActive(true);
        
        if (winnerPlayerNumber == 1)
            winnerText.text = $"{player1.characterName} Wins!";
        else if (winnerPlayerNumber == 2)
            winnerText.text = $"{player2.characterName} Wins!";
    }
    
    public void RestartBattle()
    {
        GameManager.Instance.RestartGame();
    }
    
    public void BackToMenu()
    {
        SceneManager.LoadScene("MainMenu");
    }
}
```

## 6. 数据系统设计

### 6.1 角色数据 (CharacterData.cs)

```csharp
using UnityEngine;

[CreateAssetMenu(fileName = "New Character", menuName = "KOF/Character")]
public class CharacterData : ScriptableObject
{
    [Header("Basic Info")]
    public string characterName;
    public string characterDescription;
    public Sprite characterSprite;
    
    [Header("Stats")]
    public int maxHealth = 100;
    public int attackPower = 10;
    public int defense = 5;
    public float moveSpeed = 5f;
    public float jumpForce = 8f;
    
    [Header("Skills")]
    public Skill[] characterSkills;
    
    [Header("Animations")]
    public RuntimeAnimatorController animatorController;
}
```

### 6.2 技能数据 (SkillData.cs)

```csharp
using UnityEngine;

[CreateAssetMenu(fileName = "New Skill Data", menuName = "KOF/Skill Data")]
public class SkillData : ScriptableObject
{
    [Header("Skill Info")]
    public string skillName;
    public string skillDescription;
    public int damage = 20;
    public float range = 2.0f;
    public float cooldown = 1.0f;
    public float energyCost = 10.0f;
    
    [Header("Visual Effects")]
    public GameObject effectPrefab;
    public AnimationClip animationClip;
    
    [Header("Audio")]
    public AudioClip audioClip;
}
```
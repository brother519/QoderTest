using UnityEngine;
using System.Collections;

// 简单的测试脚本，用于验证拳皇游戏的基本概念
public class KOFGAME_TEST : MonoBehaviour
{
    // 测试角色数据
    [System.Serializable]
    public class TestCharacter
    {
        public string name;
        public int health;
        public int attack;
        public int defense;
        public float speed;
        
        public TestCharacter(string n, int h, int a, int d, float s)
        {
            name = n;
            health = h;
            attack = a;
            defense = d;
            speed = s;
        }
    }
    
    // 测试技能数据
    [System.Serializable]
    public class TestSkill
    {
        public string name;
        public int damage;
        public float energyCost;
        
        public TestSkill(string n, int d, float e)
        {
            name = n;
            damage = d;
            energyCost = e;
        }
    }
    
    // 创建测试角色
    public TestCharacter CreateTestCharacter()
    {
        return new TestCharacter("草薙京", 100, 25, 10, 5.0f);
    }
    
    // 创建测试技能
    public TestSkill CreateTestSkill()
    {
        return new TestSkill("鷹爪山", 50, 30.0f);
    }
    
    // 测试战斗逻辑
    public int CalculateDamage(int attack, int defense)
    {
        int damage = attack - defense;
        return damage > 0 ? damage : 1; // 最小伤害为1
    }
    
    // 测试能量恢复
    public float RestoreEnergy(float currentEnergy, float maxEnergy, float restoreAmount)
    {
        return Mathf.Min(currentEnergy + restoreAmount, maxEnergy);
    }
    
    void Start()
    {
        Debug.Log("拳皇游戏测试开始");
        
        // 创建测试角色
        TestCharacter kyo = CreateTestCharacter();
        Debug.Log($"角色: {kyo.name}, 生命: {kyo.health}, 攻击: {kyo.attack}, 防御: {kyo.defense}, 速度: {kyo.speed}");
        
        // 创建测试技能
        TestSkill skill = CreateTestSkill();
        Debug.Log($"技能: {skill.name}, 伤害: {skill.damage}, 能量消耗: {skill.energyCost}");
        
        // 测试伤害计算
        int damage = CalculateDamage(25, 10);
        Debug.Log($"伤害计算测试: 攻击25 - 防御10 = 伤害{damage}");
        
        // 测试能量恢复
        float energy = RestoreEnergy(70.0f, 100.0f, 15.0f);
        Debug.Log($"能量恢复测试: 70 + 15 = {energy}");
        
        Debug.Log("拳皇游戏测试完成");
    }
}
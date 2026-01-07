# Antigravity Project Documentation

**Last Updated:** 2026-01-07
**Version:** P0 Reversion (Full Unlock)

## 1. Project Overview (项目概览)

**Antigravity** 是一款基于 React 的禅意物品管理与订单完成游戏。玩家通过抽取物品、整理背包、合成升级物品来完成源源不断的订单，积累金币与奖券，解锁更多游戏内容。

### Core Loop (核心循环)
1.  **Draw (抽取)**: 花费金币从不同的物品池中抽取基础物品。
2.  **Organize (整理)**: 在有限的背包空间内管理物品。
3.  **Synthesize (合成)**: (机制已解锁) 将两个相同品质的同名物品合成为更高一级品质的物品。
4.  **Fulfill Orders (完成订单)**: 提交符合品质要求的物品完成订单，获取金币（基础货币）和奖券（特殊货币）。
5.  **Upgrade (提升)**: 随着主线订单的完成，游戏阶段提升，解锁新的剧情描述。

### Current State (当前版本状态)
目前游戏处于 **"P0 Design Reversion"** 状态，即：
*   **全机制解锁**: 游戏开始即解锁所有核心机制（合成、刷新、词缀、价格波动）。
*   **统一难度**: 所有阶段 (Stage 0-4) 共享同样的概率模型和机制配置，不再有“新手保护期”。
*   **硬核主线**: 主线任务从一开始就要求提交高品质（紫色/Epic）物品。

---

## 2. Game Mechanics (游戏机制详解)

### Items & Pools (物品与奖池)
*   **Active Pools**: 游戏当前共有 5 个物品池（水果、药物、文具、厨具、电器）。
*   **Pool Constraints**:
    *   `allowedPoolCount`: 5 (所有池子同时开放)。
    *   `poolSize`: 5 (每个池子只产出前 5 种基础物品，不随时代解锁更多)。

### Rarity System (稀有度系统)
游戏中有两套独立的概率权重系统的，分别控制“抽出什么”和“订单要什么”。

**当前权重模型 (All Stages):**
| Quality | Color | Drop Weight (掉落) | Order Weight (需求) |
| :--- | :--- | :--- | :--- |
| **Common (普通)** | White/Grey | **40%** | **40%** |
| **Uncommon (优秀)** | Green | **30%** | **30%** |
| **Rare (稀有)** | Blue | **20%** | **20%** |
| **Epic (史诗)** | Purple | **10%** | **10%** |
| **Legendary (传说)** | Orange | **0%** (Disabled) | **0%** (Disabled) |

*   **Drop Weight**: 决定从奖池抽奖或词缀生成时物品的品质。
*   **Order Weight**: 决定生成新订单时，客户对物品品质的要求。

### Orders (订单系统)
1.  **Normal Orders (普通订单)**:
    *   无限循环生成。
    *   奖励：金币或奖券。
    *   难度：基于 `orderRarityWeights` 随机生成需求。
    *   **Item Count**: 基于 `orderCountWeights` 随机生成 2~4 个需求 (Default: 20%/40%/20%)。
2.  **Mainline Orders (主线订单)**:
    *   **Mainline Drop Rate**: `0.4` (40% 概率随着普通抽奖掉落主线道具)。
    *   **Fixed Difficulty**: 主线订单总是包含两个需求：
        1.  一个神话级 (Mythic) 的主线道具（通过掉落获得）。
        2.  一个 **Epic (紫色/史诗)** 品质的填充物品（必须通过合成或运气获得）。
    *   **Progression**: 完成主线订单会提升 `mainlineProgress`，推进游戏剧情。

### Skills (技能系统)
玩家通过完成主线任务随机获取/升级技能。目前生效的技能如下：
*   **Poverty Relief (贫困救济)**: 金币 < 5 时，完成金币订单额外 +10 (最终加成)。
*   **Lucky 7 (幸运7)**: 金币尾数为 7 时，传说掉率翻倍。
*   **Alchemy (炼金术)**: 回收稀有以上物品概率获得奖券。
*   **VIP Discount (贵宾折扣)**: 高级词缀抽奖打折。
*   **Negotiator (谈判专家)**: 抽到史诗物品赠送刷新次数。
*   **Consolation Prize (安慰奖)**: 连续 5 次白装后保底。
*   **Cut Corners (偷工减料)**: 概率减少订单需求数量。
*   **Time Freeze (时间冻结)**: 概率不消耗刷新次数。
*   **OCD (强迫症)**: 提交同类物品奖励翻倍。
*   **Turn Fortune (时来运转)**: 完成订单后下次抽奖保底稀有。
*   **Auto Restock (自动补货)**: 完成订单后下次抽奖多给一个。
*   **Big Order Expert (大订单专家)**: 完成 4 需求订单给奖券。
*   **Hard Order Expert (困难订单专家)**: 完成含史诗需求订单给奖券。

*(已移除: Calculated / 精打细算)*

---

## 3. Configuration Guide (配置指南)

所有游戏数值配置均位于：`src/data/constants.js`

### Constant Reference
*   **修改各阶段概率**: 编辑 `INITIAL_STAGE_CONFIG` 数组。
    *   `rarityWeights`: `{ common: 0.4, ... }` (影响抽奖)
    *   `orderRarityWeights`: `{ common: 0.4, ... }` (影响订单)
    *   `orderCountWeights`: `{ 2: 20, 3: 40, 4: 20 }` (影响订单道具数量)
*   **修改主线掉率**: 编辑 `INITIAL_GAME_CONFIG.global`。
    *   `mainlineDropRate`: `0.3` -> `0.4`
*   **修改技能池**: 编辑 `SKILL_DEFINITIONS` 或 `INITIAL_GAME_CONFIG.enabledSkillIds`。
*   **修改物品池**: 编辑 `INITIAL_POOLS_DATA` (注意：`weight` 字段已弃用，无需添加)。

---

## 4. Development Guide (开发指南)

### Environment
*   **Runtime**: Node.js (v16+)
*   **Package Manager**: npm

### Key Commands
*   **Start Local Server**:
    *   运行根目录下的 `START_GAME.bat` (Windows)。
    *   或者命令行运行: `npm run dev -- --host --port 5176`
    *   访问地址: `http://localhost:5176`
*   **Build for Production**:
    *   运行: `npm run build`
    *   输出目录: `dist/`

### File Structure
*   `src/GameCore.jsx`: 游戏主逻辑入口与 UI 渲染。
*   `src/hooks/useGameLogic.js`: 核心状态管理与业务逻辑 (Redux-like structure)。
*   `src/components/game/`: 游戏子组件 (OrderCard, PoolCard, InventorySlot)。
*   `src/data/constants.js`: **[重要]** 唯一的数值配置文件。
*   `src/utils/helpers.js`: 辅助函数 (RNG, 订单生成逻辑)。

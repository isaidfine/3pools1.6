# P0 设计需求：回退至全机制解锁版本 (Design Reversion)

## 1. 背景 (Context)
经过设计验证，我们决定放弃当前的“分阶段解锁机制”设计，回退到早期的“全机制开放”版本。
目标是让玩家从 Stage 0 开始就能体验完整的游戏循环（刷新、合成、词缀、波动价格），并且保持全流程难度的统一性。

## 2. 核心需求 (Core Requirements)

### 2.1 统一阶段配置 (Unify Stage Configs)
所有五个阶段 (Stage 0 - Stage 4) 将拥有完全相同的核心配置（向 Stage 4 看齐）。

*   **修改文件**: `src/data/constants.js` -> `INITIAL_STAGE_CONFIG`
*   **修改规则**:
    *   遍历所有 Stage (id 0-4)，将它们的以下属性统一设置为与 **Stage 4 (巅峰挑战)** 相同的值：
        *   **mechanics**: `{ refresh: true, affixes: true, synthesis: true, variablePrice: true }` (全机制解锁)
        *   **rarityWeights**: `{ common: 0.35, uncommon: 0.3, rare: 0.2, epic: 0.15, legendary: 0.05 }` (允许掉落全稀有度，支持合成至传说)
        *   **allowedPoolCount**: `5` (全池子开放，或者保留逐步开放池子？用户描述为“完整功能一开始就开放”，但也说了“5个主线任务”。通常池子是随任务解锁的。为了稳妥，我们**仅统一机制和权重**，`inventorySize` 和 `poolSize` 等数值可以保留递增，或者也直接拉满。鉴于用户强调“难度没有变化”，建议将 **mechanics** 和 **rarityWeights** 拉满即可。背包格子保留成长感。)
        *   **修正**: 用户明确提到“每个主线任务都会要求一个紫色品质”。这意味着第一关就需要能产出/合成紫色。所以 `rarityWeights` 必须统一。

### 2.2 固定主线难度 (Fixed Mainline Difficulty)
主线任务不再从“普通”开始递增，而是固定要求高品质物品（紫色/Epic）。

*   **修改文件**: `src/utils/helpers.js` -> `generateMainlineOrder`
*   **修改逻辑**:
    *   找到定义主线填充物品稀有度的逻辑。
    *   删除/注释掉基于 `level` 的递增数组 `['common', 'uncommon', ...]`。
    *   将 `targetRarityId` **固定为 `'epic'`** (紫色)。
    *   *(注：这意味着玩家在 Stage 0 就需要提交 紫色 物品才能升到 Stage 1)*

## 3. 详细变更项 (Detailed Breakdown)

### `src/data/constants.js`
对 `INITIAL_STAGE_CONFIG` 数组中的**每一个对象**执行：
```javascript
// 覆盖为以下值
mechanics: { refresh: true, affixes: true, synthesis: true, variablePrice: true },
rarityWeights: { common: 0.35, uncommon: 0.3, rare: 0.2, epic: 0.15, legendary: 0.05 },
allowedPoolCount: 5, // 建议也全开，否则初期没池子选
fixedPrice: null, // 解除固定价格
poolSize: 5, // 建议全开
```

### `src/utils/helpers.js`
在 `generateMainlineOrder` 函数中：
```javascript
// 原逻辑：const targetRarityId = mainlineFillerRarities[level] || 'common';
// 新逻辑：
const targetRarityId = 'epic'; 
```

## 4. 验收标准 (Acceptance Criteria)
1.  **开局即巅峰**: 启动游戏进入 Stage 0，界面上应立刻出现“全部刷新”按钮（且可用），奖池应带有词缀（如“波动的”、“以旧换新”），背包物品应能合成（无“时代限制”提示）。
2.  **主线目标**: 第一个主线任务（Stage 0 -> 1）的要求应该包含一个 **紫色 (Epic)** 品质的物品。

# P2 设计需求：结构重构与关卡化 (Structure Refactor)

## 1. 核心目标 (Core Objectives)
*   **移除奖券 (Remove Tickets)**: 彻底移除“奖券”这一货币，简化经济系统为单币制（金币）。
*   **重构主线 (Refactor Mainline)**: 移除独立的主线道具池，主线任务改为要求“普通池的高级物品”。
*   **关卡化重置 (Stage Reset)**: 阶段转换（Stage Transition）不再是平滑过渡，而是类似“下一关”的硬重置。

## 2. 详细需求 (Detailed Requirements)

### 2.1 移除奖券系统 (Kill Tickets)
*   **UI**: 顶部栏移除奖券数量显示。结算界面移除奖券奖励展示。
*   **逻辑**: 
    *   订单生成逻辑 (`generateOrder`) 中，`rewardType` 永远锁定为 `'gold'`。
    *   移除 `initialTickets` 配置。
*   **技能重构 (Skill Adjustment)**:
    *   `alchemy` (炼金术): 产出 5 奖券 -> 改为 **产出 10 金币**。
    *   `big_order_expert` (大订单专家): 产出 10 奖券 -> 改为 **产出 15 金币**。
    *   `hard_order_expert` (困难订单专家): 产出 15 奖券 -> 改为 **产出 20 金币**。
    *   `ocd` (强迫症): 奖励翻倍（仅金币）。

### 2.2 全新主线逻辑 (New Mainline)
*   **移除旧资产**: 废弃 `MAINLINE_ITEMS` (特斯拉、金铲铲等) 及其专属逻辑。
*   **新生成规则**:
    *   **目标**: 每次生成主线任务时，随机选取 **2 个** 不同的 `normal` 奖池（例如：一个水果，一个电器）。
    *   **要求**: 从这两个池子中各随机抽取一个物品，并强制要求 **Epic (史诗/紫色)** 品质。
    *   **总计**: 玩家需要提交 2 个不同的紫色物品来通过当前 Stage。

### 2.3 关卡重置机制 (Stage Hard Reset)
当玩家完成主线任务并点击“进入下一时代”时，执行以下**硬重置**（逻辑类似 `handleHardReset` 但保留部分状态）：

1.  **保留项 (Keep)**:
    *   **已获得的技能 (Skills)**: 此时技能构筑是唯一的积累，**必须保留**。
    *   **当前 Stage 索引**: +1。

2.  **重置项 (Reset)**:
    *   **清空背包 (Clear Inventory)**: 删除背包内所有物品。
    *   **清空订单 (Clear Orders)**: 移除当前所有待办订单，并重新生成一组新的初始订单。
    *   **重置金币 (Reset Gold)**: 将金币重置为**下个时代配置的初始值**。
        *   *配置变更*: 需要在 `INITIAL_STAGE_CONFIG` 里的每个 Stage 对象中增加 `initialGold` 字段。
        *   *建议数值*: Stage 0 (20g), Stage 1 (30g), Stage 2 (40g), Stage 3 (50g) 等。

## 3. 实现指引 (Implementation Steps)

1.  **修改 `constants.js`**:
    *   在 `INITIAL_STAGE_CONFIG` 中为每个 Stage 添加 `initialGold`。
    *   修改技能描述，去除“奖券”字样。
2.  **修改 `helpers.js`**:
    *   重写 `generateMainlineOrder`：不再读取 `MAINLINE_ITEMS`，而是随机 `getRandomItems` 并以此为模版生成 Epic 需求。
    *   修改 `generateOrder`：移除 `rewardType` 随机，固定为 gold。
3.  **修改 `useGameLogic.js`**:
    *   在 `handleMainlineSubmit` 成功后的回调中，插入 `resetForNextStage()` 逻辑（清空 items, orders, 重置 gold）。
4.  **修改 UI**:
    *   清理所有 Ticket 图标渲染。

## 4. 遗漏查缺 (Q&A)
*   **Q: 技能保留吗？**
    *   A: **保留**。这是 Roguelike 唯一的 Build 积累。
*   **Q: 商店（奖池）状态重置吗？**
    *   A: 理论上不需要重置（因为池子是本来就是随机生成的），但如果上一关锁定了某个池子（如 Stage 2 专精限制），进入新关卡应**解锁**一切限制，重新按新关卡规则运行。
*   **Q: “红”品质 (Mythic) 还需要吗？**
    *   A: 既然主线不再需要特殊的“红色主线道具”，那么 Mythic 品质目前处于**无用**状态。建议暂时保留在代码里作为彩蛋，或者暂时隐藏。

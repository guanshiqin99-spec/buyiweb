# 修复 Web 端学习记录显示 #undefined 问题

## 问题分析

### 现象
Web 端学习记录列表中，每条记录的标题显示为 `#undefined`。

### 根本原因

**后端返回的数据结构 vs 前端访问的字段不匹配：**

| 前端访问字段 | 后端实际位置 | 结果 |
|---|---|---|
| `record.contentType` | `record.content.type` | `undefined` |
| `record.title` | `record.content.title`（仅歌曲类型） | `undefined` |
| `record.buyiText` | `record.content.buyiText` | `undefined` |
| `record.contentId` | `record.id`（或 `record.content.id`） | `undefined` |

**数据流向：**
1. 后端 `MiniappLearningRecordsService.list()` 返回 `{ id, actionType, createdAt, content: {...} }`
2. 前端 `Record.vue` 第174行尝试 `record.title || record.buyiText || \`#${record.contentId}\`` 
3. 所有字段均为 `undefined`，最终 fallback 到 `#undefined`

## 修复方案

### 修改文件

#### 1. 后端：`backend/src/modules/miniapp-learning-records/miniapp-learning-records.service.ts`

在 `list` 方法中，将 `content` 对象的关键字段**展开到顶层**，方便前端直接使用：

```typescript
// 修改前（第39-45行）
return {
  id: item.id,
  actionType: item.actionType,
  createdAt: item.createdAt,
  content: this.contentService.serialize(content, item.contentType),
};

// 修改后
const serialized = this.contentService.serialize(content, item.contentType);
return {
  id: item.id,
  contentType: item.contentType,      // 展开：内容类型
  contentId: item.contentId,          // 展开：内容ID
  actionType: item.actionType,
  createdAt: item.createdAt,
  // 直接展开常用字段，方便前端使用
  title: serialized.title || null,
  buyiText: serialized.buyiText,
  zhText: serialized.zhText,
  enText: serialized.enText,
  content: serialized,
};
```

同时修改 catch 块中的 fallback 对象，也展开字段：

```typescript
// 修改前（第47-53行）
return {
  id: item.id,
  actionType: item.actionType,
  createdAt: item.createdAt,
  content: null,
};

// 修改后
return {
  id: item.id,
  contentType: item.contentType,
  contentId: item.contentId,
  actionType: item.actionType,
  createdAt: item.createdAt,
  title: null,
  buyiText: null,
  zhText: null,
  enText: null,
  content: null,
};
```

#### 2. 前端：`buyi-dictionary-vue/src/views/Record.vue`

修正模板中的字段访问，适配后端展开后的字段结构：

**第172行** - 内容类型标签：
```vue
<!-- 修改前 -->
<span class="record-type-tag">{{ getContentLabel(record.contentType) }}</span>
<!-- 修改后：后端已展开 contentType 字段 -->
<span class="record-type-tag">{{ getContentLabel(record.contentType) }}</span>
```
*注：此行实际上无需修改，因为后端展开后 `record.contentType` 即可直接访问*

**第174行** - 记录标题显示：
```vue
<!-- 修改前 -->
<p class="record-title">{{ record.title || record.buyiText || `#${record.contentId}` }}</p>

<!-- 修改后：优化兜底逻辑，支持更多字段 -->
<p class="record-title">
  {{ record.title || record.buyiText || record.zhText || record.enText || `#${record.contentId || record.id}` }}
</p>
```

**第175行** - 时间显示：
```vue
<!-- 修改前 -->
<p class="record-time">{{ formatDate(record.createdAt || record.learnedAt) }}</p>
<!-- 修改后：createdAt 已存在，无需 learnedAt fallback -->
<p class="record-time">{{ formatDate(record.createdAt) }}</p>
```

## 风险与注意事项

1. **向后兼容**：后端新增字段而非修改/删除现有字段，不会影响已有 API 消费者
2. **空内容处理**：当内容被删除（catch 分支），字段值为 null，前端已通过 `||` 短路处理
3. **仅修改必要文件**：不影响其他模块和功能

## 预期效果

修复后，学习记录列表将正确显示：
- **词典/短语/谚语**：显示布依语原文（`buyiText`）
- **歌曲**：显示歌曲标题（`title`）
- **兜底**：显示 `#{contentId}` 格式的引用
- **内容类型标签**：正确显示"词典"、"短语"、"谚语"、"歌曲"等

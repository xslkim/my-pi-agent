# T01 · 核心类型定义

> 课：L1 · 规格：[specs/01-talk.md「数据结构」](../specs/01-talk.md) · 预算：60 行 · 前置：T00

## 目标

定义贯穿全课的消息、工具调用与流事件类型。这一份类型后面四课都在用，值得一次定准。

## 要写的文件

- `src/types.ts`（新建）

## 实现要点

按 spec 原样落地这几个类型：`Role`、`Message`、`ToolCall`、`StreamEvent`、`Usage`。

要点说明：

- `Message.content: string`。不做多模态内容块数组——教学 agent 只处理文本，加了块结构会让后面每一课都变啰嗦。
- `ToolCall.arguments: string`，**保存原始 JSON 字符串**而不是解析后的对象。流式拼接期间它本来就是不完整的字符串，类型如实反映这一点。
- `StreamEvent` 是可辨识联合，必须包含 `text` / `thinking` / `tool_call_delta` / `done` 四种。
- `tool_call_delta` 本课**只定义不产生**，T07 才填实现。现在就定好可以避免届时改动 `llm.ts` 的公开签名。
- `done` 事件同时带 `finishReason` 和可选 `usage`——原因见 T03。

不要给类型加 `any` 兜底字段。宁可后面按需扩展。

## 验收

```bash
npx tsc --noEmit
```

- [ ] `npx tsc --noEmit` 无错
- [ ] `src/types.ts` 只有类型和 `export`，**没有任何运行时代码**
- [ ] 没有使用 `enum`（用字符串字面量联合代替）
- [ ] 行数 ≤ 60

## 不要做

- 不写解析逻辑（T03）
- 不定义 `Tool` 接口（那属于 T05 的 `src/tools/registry.ts`）

## 完成动作

`git commit -m "T01: core types"`，看板标 `done`。

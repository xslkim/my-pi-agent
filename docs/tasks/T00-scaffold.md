# T00 · 仓库骨架与零依赖验证

> 课：— · 规格：[teaching-agent-plan.md §2 §5](../teaching-agent-plan.md) · 预算：0 行 · 前置：无

## 目标

建好目录与配置，验证「Node 原生跑 TS + `node --test`」这条零依赖链路真的通。本任务不写任何业务代码。

## 要写的文件

- `package.json`（新建）
- `tsconfig.json`（新建）
- `test/scaffold.test.ts`（新建，不计预算）
- `src/.gitkeep`、`demo/.gitkeep`（占位，可选）

`README.md` 和 `.gitignore` 已存在，检查内容是否与 [plan §5](../teaching-agent-plan.md) 一致，不一致则更新。

## 实现要点

`package.json`：

```jsonc
{
  "name": "my-pi-agent",
  "private": true,
  "type": "module",
  "engines": { "node": ">=23.6" },
  "dependencies": {},
  "scripts": {
    "test": "node --test",
    "typecheck": "tsc --noEmit"
  }
}
```

- **`dependencies` 必须保持为空**，全课不许加运行时依赖。
- `devDependencies` 只允许 `typescript`（仅供 `tsc --noEmit`）。用 `npm i -D typescript` 安装。

`tsconfig.json` 关键项（配合 Node 的类型剥离）：

```jsonc
{
  "compilerOptions": {
    "target": "esnext",
    "module": "nodenext",
    "moduleResolution": "nodenext",
    "allowImportingTsExtensions": true,
    "rewriteRelativeImportExtensions": true,
    "noEmit": true,
    "strict": true,
    "erasableSyntaxOnly": true,
    "verbatimModuleSyntax": true,
    "lib": ["esnext"],
    "types": ["node"]
  },
  "include": ["src", "test"]
}
```

`erasableSyntaxOnly` 会在编译期挡住 `enum` / `namespace` / 构造函数参数属性——这些语法 Node 的类型剥离不支持，早报错好过运行时才炸。

`test/scaffold.test.ts`：导入一个 `src/` 下的小函数并断言，证明跨文件 `.ts` 导入（**必须写全 `.ts` 扩展名**）可用。

## 验收

```bash
node --test
npx tsc --noEmit
```

- [ ] `node --test` 输出 `pass 1`、`fail 0`
- [ ] `npx tsc --noEmit` 无错
- [ ] `node -e "console.log(require('./package.json').dependencies)"` 输出 `{}`
- [ ] `node -v` >= 23.6

## 不要做

- 不写 `llm.ts` / `types.ts` 等业务文件（T01 起）
- 不装除 `typescript` 外的任何包
- 不加构建步骤（webpack / esbuild / tsx 一律不要）

## 完成动作

`git add -A && git commit -m "T00: scaffold with zero runtime deps"`，把看板里 T00 标为 `done`。

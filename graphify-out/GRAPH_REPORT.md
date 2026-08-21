# Graph Report - my-pi-agent  (2026-08-20)

## Corpus Check
- 629 files · ~585,206 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 7724 nodes · 20594 edges · 278 communities (246 shown, 32 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 432 edges (avg confidence: 0.77)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Extension Bindings
- OpenAI Compat Layer
- Agent Harness Runtime
- Resource Loader
- Codex Responses API
- Provider Registry
- Provider Auth Flow
- Anthropic Messages
- OpenAI Completions API
- Remote Session
- Conformance
- Marked Min
- Settings Manager
- Colors
- Colors
- Template
- Footer Data Provider
- Required
- Interactive Theme
- Config
- Default Package Manager
- Model Runtime
- Mistral Conversations
- Tools Manager
- Coding Agent Tools
- Package Manager
- Model Data
- Resource List
- Rpc Client
- Tree Selector
- Package Manager Cli
- Loader
- Core/Compaction/Compaction
- Interactive TUI Mode
- Session Manager
- Core/Skills
- Model Config
- Src/Types
- Interactive TUI Mode
- Images Model
- Auth Check
- Highlight Min
- Exports
- Interactive Mode
- Status Indicator
- Extension Runner
- Core/Tools/Edit
- Providers/Anthropic
- Agent Session Runtime
- Normalize Path
- Theme
- Interactive TUI Mode
- Interactive TUI Mode
- Armin Component
- Scoped Models Selector
- Trust Manager
- O
- Package Manager
- Extension API
- Tsconfig Build Json
- Bedrock Converse Stream
- Export Html/Index
- Session Selector
- Google Vertex API
- Keybinding Hints
- Keybindings Manager
- Model Selector Component
- Model Resolver
- Deep Merge Settings
- Llama/Client
- OpenAI Responses
- Agent Session Core
- Bedrock Custom Headers Test
- Scripts
- Login Dialog Component
- Agent Session Core
- Model Stream Factory
- Run Rpc Mode
- Package Manager
- Generated Model Catalog
- Llama Extension
- Components/Index
- Harness/Compaction/Compaction
- Extension Context
- Llama View
- Image Resize
- Agent Harness
- Models Dev Reasoning Options
- Vars
- Mime
- Stream Simple
- Clipboard Image
- Vars
- Package Manager
- Extension Oauth Types
- Changelog
- Package Manager
- Output Accumulator
- Settings Selector
- Syntax Highlight
- Interactive Mode
- Package Manager
- Lazy Module Load Test
- Exif Orientation
- Image Process
- Provider Attribution
- Llama/Huggingface
- Theme Schema Json
- Properties
- Trust Selector
- Provider
- Hugging Face Search
- Daxnuts Component
- Auth Selector Provider
- Clipboard
- Legacy Api Aliases
- Properties
- Properties
- Src/Index
- Teaching LLM Client
- Agent Session Core
- CLI Entry Args
- Agent Harness Runtime
- Generate Models
- Inline Tokens
- Command Options
- Highlight Js Lib Index D
- Read Only Auth Storage
- Entry
- Agent Harness Runtime
- Dark Json
- Light Json
- Git
- Agent Harness
- Model Runtime
- Core/Tools/Index
- Harness/Skills
- First Time Setup Component
- Agent Message
- Codec
- Repo
- Vars
- Colors
- Deprecation
- Accent
- Bash Mode
- Border
- Border Accent
- Border Muted
- Custom Message Bg
- Custom Message Label
- Custom Message Text
- Dim
- Error
- Md Code
- Md Code Block
- Md Code Block Border
- Md Heading
- Md Hr
- Md Link
- Md Link Url
- Md List Bullet
- Md Quote
- Muted
- Scrollbar Thumb
- Search Match Bg
- Selected Bg
- Success
- Syntax Comment
- Syntax Function
- Syntax Keyword
- Syntax Number
- Syntax Operator
- Syntax Punctuation
- Syntax String
- Syntax Type
- Syntax Variable
- Text
- Thinking High
- Thinking Low
- Thinking Max
- Thinking Medium
- Thinking Minimal
- Thinking Off
- Thinking Text
- Thinking Xhigh
- Tool Diff Added
- Tool Diff Context
- Tool Diff Removed
- Tool Error Bg
- Tool Output
- Tool Pending Bg
- Tool Success Bg
- User Message Bg
- User Message Text
- Interactive TUI Mode
- Export Html
- Core/Radius
- Deferred Tools Test
- Harness/Tools/Edit
- Settings Manager
- Faux
- Oauth/Github Copilot
- Agent Loop
- Session
- E2E Test
- Oauth/Xai
- Src/Types
- Oauth/OpenAI Codex
- Agent Loop Test
- Scanning
- Dependencies
- Oauth/Kimi Coding
- Interactive Theme Controller
- Tool Execution Component
- In Memory Session Storage
- Tsconfig Build Json
- Oauth/Openrouter
- Rpc Mode
- Agent
- Events
- Oauth/Radius
- Session Storage
- File System
- Radius Config
- Interactive TUI Mode
- Oauth/Anthropic
- Cloudflare Gateway Binding
- Validation
- Footer
- Package Json
- Generate Models
- Provider Error Body Regression Test
- Cloudflare Workers Ai
- Jsonl Session Storage
- Session Tree
- Bedrock Error Metadata Test
- Dependencies
- Image
- Proxy
- Generate Image Models
- Utils/Retry
- Package Json
- Apply Thinking Level Metadata
- Ansi To Html
- Load Models Dev Data
- Mock Web Socket
- Dev Dependencies
- Scripts
- Jsonl Storage Test
- Ui
- Json Event
- Exports
- Truncate Test
- Keywords
- Assistant Message Component
- Dev Dependencies
- Generate Test Image
- OpenAI Codex Oauth Test
- Footer Component
- Keywords
- Context Test
- Vitest Config
- Vitest Harness Config
- Config Selector Component
- Repository
- Repository
- Side Effects
- Packageon
- Generate Models Strict Test
- Data Json D
- Vitest Config

## God Nodes (most connected - your core abstractions)
1. `InteractiveMode` - 206 edges
2. `SettingsManager` - 174 edges
3. `AgentSession` - 148 edges
4. `Model` - 137 edges
5. `DefaultPackageManager` - 107 edges
6. `Context` - 105 edges
7. `Theme` - 95 edges
8. `createProvider()` - 90 edges
9. `ExtensionRunner` - 87 edges
10. `envApiKeyAuth()` - 72 edges

## Surprising Connections (you probably didn't know these)
- `InlineExtension` --references--> `PackageCommandRuntimeOptions`  [EXTRACTED]
  core/extensions/types.ts → package-manager-cli.ts
- `BuildSystemPromptOptions` --references--> `CreateCodingAgentHarnessOptions`  [EXTRACTED]
  core/system-prompt.ts → server/create-harness.ts
- `SettingsManager` --references--> `CommandSettingsResult`  [EXTRACTED]
  core/settings-manager.ts → package-manager-cli.ts
- `stream()` --calls--> `captureClientConfig()`  [EXTRACTED]
  src/compat.ts → test/bedrock-credentials.test.ts
- `stream()` --calls--> `captureClientConfig()`  [EXTRACTED]
  src/compat.ts → test/bedrock-endpoint-resolution.test.ts

## Import Cycles
- 2-file cycle: `src/search/index.ts -> src/search/scanning.ts -> src/search/index.ts`
- 2-file cycle: `src/types.ts -> src/utils/event-stream.ts -> src/types.ts`
- 2-file cycle: `core/extensions/loader.ts -> index.ts -> core/extensions/loader.ts`
- 3-file cycle: `core/extensions/index.ts -> core/extensions/loader.ts -> index.ts -> core/extensions/index.ts`
- 3-file cycle: `core/agent-session-runtime.ts -> core/agent-session-services.ts -> core/sdk.ts -> core/agent-session-runtime.ts`
- 3-file cycle: `core/extensions/loader.ts -> index.ts -> core/resource-loader.ts -> core/extensions/loader.ts`
- 3-file cycle: `core/extensions/types.ts -> core/tools/index.ts -> core/tools/find.ts -> core/extensions/types.ts`
- 3-file cycle: `core/extensions/types.ts -> core/tools/index.ts -> core/tools/grep.ts -> core/extensions/types.ts`
- 3-file cycle: `core/extensions/types.ts -> core/tools/index.ts -> core/tools/ls.ts -> core/extensions/types.ts`
- 3-file cycle: `core/extensions/types.ts -> core/tools/index.ts -> core/tools/read.ts -> core/extensions/types.ts`
- 3-file cycle: `core/extensions/types.ts -> core/tools/index.ts -> core/tools/write.ts -> core/extensions/types.ts`
- 3-file cycle: `core/extensions/types.ts -> core/tools/edit.ts -> core/tools/tool-definition-wrapper.ts -> core/extensions/types.ts`
- 3-file cycle: `cli/args.ts -> core/extensions/types.ts -> core/model-resolver.ts -> cli/args.ts`
- 3-file cycle: `core/extensions/types.ts -> core/tools/bash.ts -> core/tools/tool-definition-wrapper.ts -> core/extensions/types.ts`
- 4-file cycle: `core/extensions/index.ts -> core/extensions/loader.ts -> index.ts -> modes/interactive/interactive-mode.ts -> core/extensions/index.ts`
- 4-file cycle: `core/extensions/loader.ts -> index.ts -> modes/interactive/interactive-mode.ts -> core/resource-loader.ts -> core/extensions/loader.ts`
- 4-file cycle: `core/agent-session.ts -> core/resource-loader.ts -> core/extensions/loader.ts -> index.ts -> core/agent-session.ts`
- 4-file cycle: `core/agent-session.ts -> core/extensions/index.ts -> core/extensions/loader.ts -> index.ts -> core/agent-session.ts`
- 4-file cycle: `core/extensions/index.ts -> core/extensions/loader.ts -> index.ts -> core/sdk.ts -> core/extensions/index.ts`
- 4-file cycle: `core/extensions/index.ts -> core/extensions/loader.ts -> index.ts -> modes/rpc/rpc-mode.ts -> core/extensions/index.ts`

## Communities (278 total, 32 thin omitted)

### Community 0 - "Extension Bindings"
Cohesion: 0.03
Nodes (176): AgentSessionEvent, AgentSessionEventListener, ExtensionBindings, ModelCycleResult, parseSkillBlock(), PromptOptions, SessionStats, THINKING_LEVELS (+168 more)

### Community 1 - "OpenAI Compat Layer"
Cohesion: 0.02
Nodes (192): apiProviderRegistry, ApiStreamFunction, ApiStreamSimpleFunction, BUILTIN_APIS, builtinApiProviderInstances, clearApiProviders(), compatModels, complete() (+184 more)

### Community 2 - "Agent Harness Runtime"
Cohesion: 0.04
Nodes (67): LaneSnapshot, AttemptSeries, bySequence(), clone(), corrupt(), deriveEffectiveConfiguration(), deriveNewestOwn(), deriveToolBatch() (+59 more)

### Community 3 - "Resource Loader"
Cohesion: 0.05
Nodes (36): CreateAgentSessionServicesOptions, ResourceCollision, ResourceDiagnostic, loadExtensionsCached(), Extension, LoadExtensionsResult, PathMetadata, ResolvedPaths (+28 more)

### Community 4 - "Codex Responses API"
Cohesion: 0.03
Nodes (101): acquireWebSocket(), applyServiceTierPricing(), assertSuccessfulOutput(), buildBaseCodexHeaders(), buildCachedWebSocketRequestBody(), buildSSEHeaders(), buildWebSocketHeaders(), CachedWebSocketConnection (+93 more)

### Community 5 - "Provider Registry"
Cohesion: 0.12
Nodes (48): anthropicMessagesApi(), googleGenerativeAIApi(), openAICompletionsApi(), openAIResponsesApi(), openrouterImagesApi(), envApiKeyAuth(), lazyOAuth(), loadOpenRouterOAuth() (+40 more)

### Community 6 - "Provider Auth Flow"
Cohesion: 0.03
Nodes (61): defaultProviderAuthContext(), NodeFsModule, NodeOsModule, InMemoryCredentialStore, AuthResolutionOverrides, ModelsError, ModelsErrorCode, overlayEnvAuthContext() (+53 more)

### Community 7 - "Anthropic Messages"
Cohesion: 0.04
Nodes (64): ANTHROPIC_MESSAGE_EVENTS, assertRequestAuth(), buildParams(), ccToolLookup, claudeCodeTools, consumeLine(), convertContentBlocks(), convertMessages() (+56 more)

### Community 8 - "OpenAI Completions API"
Cohesion: 0.03
Nodes (96): convertToolConfig(), appendGrammarToolInputJsonDelta(), createGrammarToolInputProperties(), getGrammarToolInput(), getJsonSchemaToolParameters(), GrammarConstrainedSampling, GrammarToolInputJsonBuffer, inferGrammarInputProperty() (+88 more)

### Community 9 - "Remote Session"
Cohesion: 0.08
Nodes (16): CreateRemoteSessionOptions, RemoteSession, RemoteSessionDisposedError, RemoteSessionLifecycle, RemoteSessionOperation, RemoteSessionOptions, RemoteSessionState, settleRemoteSessionDisposal() (+8 more)

### Community 10 - "Conformance"
Cohesion: 0.12
Nodes (18): ConformanceTest, createAssistantMessage(), createCase(), createSessionBackendConformance(), createUserMessage(), entryIds(), operationStarted(), rejectsWithCode() (+10 more)

### Community 11 - "Marked Min"
Cohesion: 0.06
Nodes (40): br(), checkbox(), code(), codespan(), constructor(), ct(), def(), ee() (+32 more)

### Community 13 - "Colors"
Cohesion: 0.04
Nodes (56): colors, accent, bashMode, border, borderAccent, borderMuted, customMessageBg, customMessageLabel (+48 more)

### Community 14 - "Colors"
Cohesion: 0.04
Nodes (56): colors, accent, bashMode, border, borderAccent, borderMuted, customMessageBg, customMessageLabel (+48 more)

### Community 15 - "Template"
Cohesion: 0.08
Nodes (47): applySidebarWidth(), buildActivePathIds(), buildShareUrl(), buildTree(), buildTreePrefix(), clampSidebarWidth(), code(), codespan() (+39 more)

### Community 16 - "Footer Data Provider"
Cohesion: 0.12
Nodes (10): findGitPaths(), FooterDataProvider, GitPaths, isWindowsMountedRepoPath(), isWslEnvironment(), resolveBranchWithGitAsync(), resolveBranchWithGitSync(), shouldPollGitHead() (+2 more)

### Community 17 - "Required"
Cohesion: 0.04
Nodes (51): required, accent, bashMode, border, borderAccent, borderMuted, customMessageBg, customMessageText (+43 more)

### Community 18 - "Interactive Theme"
Cohesion: 0.04
Nodes (82): ConfigSelectorOptions, selectConfig(), createProjectTrustContext(), selectSession(), SessionsLoader, applyDetectedStartupTheme(), clearStartupTui(), createStartupTui() (+74 more)

### Community 19 - "Config"
Cohesion: 0.08
Nodes (51): APP_TITLE, detectInstallMethod(), __dirname, __filename, getAgentDir(), getAuthPath(), getBinDir(), getBundledInteractiveAssetPath() (+43 more)

### Community 20 - "Default Package Manager"
Cohesion: 0.11
Nodes (4): DefaultPackageManager, getEnv(), getExtensionTempFolder(), isOfflineModeEnabled()

### Community 21 - "Model Runtime"
Cohesion: 0.06
Nodes (52): ResolvedRequestAuth, CreateModelRuntimeOptions, CredentialSynchronizationError, CredentialSynchronizationOperation, ModelRuntimeAuthOverrides, ModelRuntimeSnapshot, adaptOAuth(), applyExtension() (+44 more)

### Community 22 - "Mistral Conversations"
Cohesion: 0.06
Nodes (49): applyMistralHeaderOverrides(), buildChatPayload(), buildMistralHeaders(), buildToolResultText(), consumeChatStream(), createMistralToolCallIdNormalizer(), createOutput(), deriveMistralToolCallId() (+41 more)

### Community 23 - "Tools Manager"
Cohesion: 0.09
Nodes (35): VERSION, mergeModels(), parseCatalog(), REMOTE_CATALOG_REFRESH_INTERVAL_MS, remoteModels(), withRemoteCatalog(), FetchInput, FetchRetryOptions (+27 more)

### Community 24 - "Coding Agent Tools"
Cohesion: 0.04
Nodes (101): BashExecutorOptions, BashResult, executeBashWithOperations(), executeWithConfiguredShell(), BashRenderState, BashResultRenderComponent, BashResultRenderState, bashSchema (+93 more)

### Community 25 - "Package Manager"
Cohesion: 0.07
Nodes (44): addIgnoreRules(), applyAutoloadDisabledPatterns(), collectAutoExtensionEntries(), collectAutoPromptEntries(), collectAutoThemeEntries(), collectFiles(), collectResourceFiles(), collectSkillEntries() (+36 more)

### Community 27 - "Model Data"
Cohesion: 0.18
Nodes (24): packageRoot, assertExactModelIds(), createModelDataManifest(), describeSetDifference(), isRecord(), MODEL_DATA_MANIFEST_FILE, MODEL_DATA_SCHEMA_VERSION, ModelDataManifest (+16 more)

### Community 30 - "Tree Selector"
Cohesion: 0.06
Nodes (15): SessionTreeNode, compactRawKeys(), FilterMode, FlatNode, formatHelpKeys(), GutterInfo, HorizontalViewportRow, LabelInput (+7 more)

### Community 31 - "Package Manager Cli"
Cohesion: 0.08
Nodes (37): PACKAGE_NAME, SelfUpdatePackageTarget, AppMode, CommandSettingsResult, createCommandSettingsManager(), getCommandAppMode(), getPackageCommandUsage(), getSelfUpdatePlan() (+29 more)

### Community 32 - "Loader"
Cohesion: 0.09
Nodes (32): createEventBus(), EventBus, EventBusController, execCommand(), clearExtensionCache(), createExtension(), createExtensionAPI(), createExtensionRuntime() (+24 more)

### Community 33 - "Core/Compaction/Compaction"
Cohesion: 0.08
Nodes (54): BranchPreparation, BranchSummaryDetails, BranchSummaryResult, CollectEntriesResult, generateBranchSummary(), GenerateBranchSummaryOptions, getMessageFromEntry(), prepareBranchEntries() (+46 more)

### Community 35 - "Session Manager"
Cohesion: 0.03
Nodes (72): getSessionsDir(), AgentSessionConfig, createAgentSessionRuntime(), CreateAgentSessionRuntimeFactory, CreateAgentSessionRuntimeResult, AgentSessionRuntimeDiagnostic, AgentSessionServices, applyExtensionFlagValues() (+64 more)

### Community 36 - "Core/Skills"
Cohesion: 0.07
Nodes (42): getDocsPath(), getExamplesPath(), getReadmePath(), loadPromptTemplates(), LoadPromptTemplatesOptions, loadTemplateFromFile(), loadTemplatesFromDir(), addIgnoreRules() (+34 more)

### Community 37 - "Model Config"
Cohesion: 0.06
Nodes (28): AnthropicMessagesCompatSchema, ChatTemplateKwargScalarSchema, ChatTemplateKwargSchema, ChatTemplateKwargVariableSchema, deepFreeze(), formatValidationPath(), ModelConfig, ModelCostRatesSchema (+20 more)

### Community 38 - "Src/Types"
Cohesion: 0.04
Nodes (57): AnthropicEffort, AnthropicOptions, AnthropicThinkingDisplay, AzureOpenAIResponsesOptions, BedrockOptions, GoogleOptions, GoogleThinkingLevel, GoogleVertexOptions (+49 more)

### Community 39 - "Interactive TUI Mode"
Cohesion: 0.13
Nodes (21): formatBashCall(), buildEditCallComponent(), formatEditCall(), formatEditResult(), getEditHeaderBg(), formatFindCall(), formatGrepCall(), formatLsCall() (+13 more)

### Community 40 - "Images Model"
Cohesion: 0.05
Nodes (54): IMAGE_MODELS, getImageModel(), ImageModelApi, imageModelRegistry, getImagesApiProvider(), ImagesApiFunction, ImagesApiProvider, ImagesApiProviderInternal (+46 more)

### Community 41 - "Auth Check"
Cohesion: 0.09
Nodes (22): AuthCheckReason, AuthCheckResult, AuthCheckStatus, checkProviderAuth(), createAuthCheckModelRuntime(), getProviderCredential(), AUTH_COMMAND_USAGE, AuthCommand (+14 more)

### Community 42 - "Highlight Min"
Cohesion: 0.18
Nodes (25): a(), b(), c(), d(), e(), f(), g(), h() (+17 more)

### Community 43 - "Exports"
Cohesion: 0.11
Nodes (19): import, types, import, types, import, types, import, types (+11 more)

### Community 44 - "Interactive Mode"
Cohesion: 0.10
Nodes (3): SourceInfo, InteractiveMode, isDeadTerminalError()

### Community 46 - "Extension Runner"
Cohesion: 0.05
Nodes (8): buildBuiltinKeybindings(), emitSessionShutdownEvent(), ExtensionRunner, ResolvedCommand, wrapRegisteredTool(), wrapRegisteredTools(), ModelRegistry, normalizeToolResultImages()

### Community 47 - "Core/Tools/Edit"
Cohesion: 0.08
Nodes (41): createEditCallRenderComponent(), defaultEditOperations, AppliedEditsResult, applyEditsToNormalizedContent(), applyReplacements(), applyReplacementsPreservingUnchangedLines(), computeEditDiff(), computeEditsDiff() (+33 more)

### Community 48 - "Providers/Anthropic"
Cohesion: 0.06
Nodes (40): anthropicOAuth, githubCopilotOAuth, importOAuthModule(), loadAnthropicOAuth(), loadGitHubCopilotOAuth(), loadKimiCodingOAuth(), loadRadiusOAuth(), loadXaiOAuth() (+32 more)

### Community 49 - "Agent Session Runtime"
Cohesion: 0.21
Nodes (3): AgentSessionRuntime, extractUserMessageText(), ReplacedSessionContext

### Community 50 - "Normalize Path"
Cohesion: 0.06
Nodes (23): AUTH_FILE_WRITE_OPTIONS, AuthFileReadState, AuthFileReload, AuthStorage, AuthStorageBackend, AuthStorageData, FileAuthStorageBackend, InMemoryAuthStorageBackend (+15 more)

### Community 51 - "Theme"
Cohesion: 0.05
Nodes (11): isBlankRenderedLine(), ToolHtmlRenderer, ToolHtmlRendererDeps, trimRenderedResultLines(), ExtensionUIContext, MarkdownTransformer, ToolRenderContext, applyMarkdownTransformers() (+3 more)

### Community 52 - "Interactive TUI Mode"
Cohesion: 0.12
Nodes (4): EditorFactory, ExtensionUIDialogOptions, dispose(), isExpandable()

### Community 54 - "Armin Component"
Cohesion: 0.13
Nodes (9): ArminComponent, BITS, buildFinalGrid(), BYTES_PER_ROW, DISPLAY_HEIGHT, Effect, EFFECTS, getChar() (+1 more)

### Community 55 - "Scoped Models Selector"
Cohesion: 0.14
Nodes (13): clearAll(), enableAll(), EnabledIds, getSortedIds(), isEnabled(), ModelItem, ModelsCallbacks, ModelsConfig (+5 more)

### Community 56 - "Trust Manager"
Cohesion: 0.17
Nodes (14): saveProjectTrustPromptResult(), acquireTrustLockSync(), findNearestTrustEntry(), getProjectTrustOptions(), getProjectTrustParentPath(), normalizeCwd(), ProjectTrustDecision, ProjectTrustStore (+6 more)

### Community 57 - "O"
Cohesion: 0.12
Nodes (3): l, o, r

### Community 58 - "Package Manager"
Cohesion: 0.17
Nodes (4): getHomeDir(), getNpmVersionRange(), isExactNpmVersion(), PackageSource

### Community 60 - "Tsconfig Build Json"
Cohesion: 0.13
Nodes (14): **/*.d.ts, node_modules, src/**/*.d.ts, src/**/*.ts, ../../tsconfig.base.json, compilerOptions, module, moduleResolution (+6 more)

### Community 61 - "Bedrock Converse Stream"
Cohesion: 0.03
Nodes (96): addCustomHeadersMiddleware(), appendBedrockFailureDiagnostic(), BEDROCK_ERROR_PREFIXES, BedrockThinkingDisplay, Block, buildAdditionalModelRequestFields(), buildSystemPrompt(), convertMessages() (+88 more)

### Community 62 - "Export Html/Index"
Cohesion: 0.19
Nodes (15): getExportTemplateDir(), adjustBrightness(), deriveExportColors(), ExportOptions, generateHtml(), generateThemeVars(), getLuminance(), parseColor() (+7 more)

### Community 63 - "Session Selector"
Cohesion: 0.07
Nodes (25): SessionInfo, SessionListProgress, buildSessionTree(), canonicalizePath(), deleteSessionFile(), FlatSessionNode, flattenSessionTree(), formatSessionDate() (+17 more)

### Community 64 - "Google Vertex API"
Cohesion: 0.05
Nodes (83): openai, formatBedrockError(), buildParams(), ClampedThinkingLevel, createClient(), getDisabledThinkingConfig(), getGoogleBudget(), getThinkingLevel() (+75 more)

### Community 65 - "Keybinding Hints"
Cohesion: 0.05
Nodes (26): ParsedSkillBlock, BranchSummaryMessage, CompactionSummaryMessage, BranchSummaryMessageComponent, CompactionSummaryMessageComponent, ConfigSelectorHeader, CountdownTimer, ExtensionInputComponent (+18 more)

### Community 66 - "Keybindings Manager"
Cohesion: 0.08
Nodes (17): AppKeybinding, AppKeybindings, @earendil-works/pi-tui, isLegacyKeybindingName(), KEYBINDING_NAME_MIGRATIONS, Keybindings, KeybindingsManager, loadRawConfig() (+9 more)

### Community 68 - "Model Resolver"
Cohesion: 0.12
Nodes (17): isValidThinkingLevel(), buildFallbackModel(), findExactModelReferenceMatch(), findInitialModel(), InitialModelResult, isAlias(), ModelScopeDiagnostic, ParsedModelResult (+9 more)

### Community 69 - "Deep Merge Settings"
Cohesion: 0.11
Nodes (4): deepMergeSettings(), FileSettingsStorage, InMemorySettingsStorage, SettingsStorage

### Community 70 - "Llama/Client"
Cohesion: 0.18
Nodes (11): errorMessage(), formatBytes(), isModelInfo(), linkSignal(), LlamaClient, LlamaModelEvent, LlamaModelsResponse, LlamaModelStatus (+3 more)

### Community 71 - "OpenAI Responses"
Cohesion: 0.06
Nodes (51): AZURE_TOOL_CALL_PROVIDERS, buildDefaultBaseUrl(), buildParams(), createClient(), formatAzureOpenAIError(), normalizeAzureBaseUrl(), parseDeploymentNameMap(), resolveAzureConfig() (+43 more)

### Community 72 - "Agent Session Core"
Cohesion: 0.16
Nodes (6): formatNoApiKeyFoundMessage(), formatNoModelSelectedMessage(), getProviderLoginHelp(), expandPromptTemplate(), parseCommandArgs(), substituteArgs()

### Community 73 - "Bedrock Custom Headers Test"
Cohesion: 0.18
Nodes (8): bedrockMock, BedrockRuntimeClient, BedrockRuntimeServiceException, context, ConverseStreamCommand, driveBedrock(), getModelFixture(), MiddlewareHandler

### Community 74 - "Scripts"
Cohesion: 0.18
Nodes (11): scripts, build, build:offline, check:model-data, clean, generate-image-models, generate-model-catalog, generate-models (+3 more)

### Community 76 - "Agent Session Core"
Cohesion: 0.15
Nodes (7): estimateMessagesTokens(), withoutDeletedHeaders(), collectEntriesForBranchSummary(), calculateContextTokens(), estimateContextTokens(), prepareCompaction(), shouldCompact()

### Community 77 - "Model Stream Factory"
Cohesion: 0.04
Nodes (40): appendCustomToolCallInput(), ConvertResponsesMessagesOptions, ConvertResponsesToolsOptions, convertToolResultOutput(), encodeTextSignatureV1(), getCustomToolCallInput(), mapStopReason(), OpenAIResponsesStreamOptions (+32 more)

### Community 78 - "Run Rpc Mode"
Cohesion: 0.28
Nodes (12): flushRawStdout(), getRawStdoutWrite(), rawStdoutWriteTail, StdoutTakeoverState, takeOverStdout(), waitForRawStdoutBackpressure(), writeRawStdout(), writeRawStdoutChunk() (+4 more)

### Community 79 - "Package Manager"
Cohesion: 0.30
Nodes (3): applyPatterns(), hasGlobPattern(), isOverridePattern()

### Community 80 - "Generated Model Catalog"
Cohesion: 0.06
Nodes (45): flattenModelCatalog(), ModelApi, ModelCatalog, ModelGroups, ModelId, ANT_LING_MODELS, ANTHROPIC_MODELS, AZURE_OPENAI_RESPONSES_MODELS (+37 more)

### Community 81 - "Llama Extension"
Cohesion: 0.21
Nodes (8): configuredClient(), connectionErrorMessage(), isConnectionError(), llamaExtension(), modelIsLoaded(), parseHuggingFaceModel(), LLAMA_PROVIDER_ID, LlamaUi

### Community 82 - "Components/Index"
Cohesion: 0.06
Nodes (22): BorderedLoader, parseDiffLine(), renderDiff(), RenderDiffOptions, renderIntraLineDiff(), replaceTabs(), DynamicBorder, ModelItem (+14 more)

### Community 83 - "Harness/Compaction/Compaction"
Cohesion: 0.06
Nodes (69): BranchPreparation, generateBranchSummary(), getMessageFromEntry(), prepareBranchEntries(), calculateContextTokens(), combineUsage(), compact(), CompactionDetails (+61 more)

### Community 84 - "Extension Context"
Cohesion: 0.11
Nodes (3): ExtensionCommandContext, ExtensionContext, ReadonlySessionManager

### Community 85 - "Llama View"
Cohesion: 0.21
Nodes (4): frame(), LlamaView, runWithProgress(), selectTheme()

### Community 86 - "Image Resize"
Cohesion: 0.19
Nodes (15): ProcessImageOptions, DEFAULT_OPTIONS, encodeCandidate(), EncodedCandidate, ImageResizeOptions, ResizedImage, resizeImageInProcess(), createResizeWorker() (+7 more)

### Community 87 - "Agent Harness"
Cohesion: 0.03
Nodes (61): AbortRejected, AbortResult, ActionInfo, CancelQueuedRejected, CancelQueuedResult, Closed, CompactionOutcome, CompactionRejected (+53 more)

### Community 88 - "Models Dev Reasoning Options"
Cohesion: 0.29
Nodes (6): ModelsDevModel, processBasetenModels(), getEffortThinkingLevelMap(), ModelsDevReasoningOption, THINKING_LEVELS, ThinkingLevelMap

### Community 89 - "Vars"
Cohesion: 0.12
Nodes (17): vars, accent, blue, customMsgBg, cyan, darkGray, dimGray, gray (+9 more)

### Community 90 - "Mime"
Cohesion: 0.24
Nodes (14): ProcessedFiles, processFileArguments(), ProcessFileOptions, detectSupportedImageMimeType(), detectSupportedImageMimeTypeFromFile(), isAnimatedPng(), isBmp(), isPng() (+6 more)

### Community 91 - "Stream Simple"
Cohesion: 0.04
Nodes (48): ApiProvider, streamSimple(), SimpleStreamOptions, AnthropicPayload, capturePayload(), PayloadCaptured, capturePayload(), makeContext() (+40 more)

### Community 92 - "Clipboard Image"
Cohesion: 0.28
Nodes (14): baseMimeType(), ClipboardImage, convertToPng(), extensionForImageMimeType(), isSupportedImageMimeType(), isWSL(), readClipboardImage(), readClipboardImageViaNativeClipboard() (+6 more)

### Community 93 - "Vars"
Cohesion: 0.12
Nodes (16): vars, blue, customMsgBg, dimGray, green, lightGray, mediumGray, red (+8 more)

### Community 95 - "Extension Oauth Types"
Cohesion: 0.21
Nodes (6): OAuthAuthInfo, OAuthDeviceCodeInfo, OAuthLoginCallbacks, OAuthPrompt, OAuthSelectOption, OAuthSelectPrompt

### Community 96 - "Changelog"
Cohesion: 0.23
Nodes (13): getChangelogPath(), ChangelogEntry, compareVersions(), entryVersion(), getNewEntries(), isDirectoryTarget(), normalizeChangelogLinks(), normalizeChangelogLinkTarget() (+5 more)

### Community 97 - "Package Manager"
Cohesion: 0.25
Nodes (4): collectAncestorAgentsSkillDirs(), collectAutoSkillEntries(), findGitRepoRoot(), resourcePrecedenceRank()

### Community 98 - "Output Accumulator"
Cohesion: 0.25
Nodes (3): byteLength(), defaultTempFilePath(), OutputAccumulator

### Community 99 - "Settings Selector"
Cohesion: 0.12
Nodes (15): formatHttpIdleTimeoutMs(), WarningSettings, DEFAULT_PROJECT_TRUST_BY_LABEL, DEFAULT_PROJECT_TRUST_LABELS, defaultAutomaticThemes(), preferredTheme(), SelectSubmenu, SETTINGS_SUBMENU_SELECT_LIST_LAYOUT (+7 more)

### Community 100 - "Syntax Highlight"
Cohesion: 0.22
Nodes (13): decodeCodePoint(), DecodedHtmlEntity, decodeHtmlEntity(), decodeHtmlEntityAt(), getActiveFormatter(), getScopeFormatter(), getScopeFromSpanTag(), highlight() (+5 more)

### Community 101 - "Interactive Mode"
Cohesion: 0.06
Nodes (38): SessionImportFileNotFoundError, asPreviousRequest(), CACHE_TTL_MS, CacheMiss, CacheWasteTotals, collectCacheMisses(), computeCacheWaste(), detectCacheMiss() (+30 more)

### Community 103 - "Lazy Module Load Test"
Cohesion: 0.40
Nodes (3): packageRoot, ProbeResult, SDK_SPECIFIERS

### Community 104 - "Exif Orientation"
Cohesion: 0.16
Nodes (18): applyExifOrientation(), DstIndexFn, findJpegTiffOffset(), findWebpTiffOffset(), getExifOrientation(), hasExifHeader(), Photon, readOrientationFromTiff() (+10 more)

### Community 105 - "Image Process"
Cohesion: 0.27
Nodes (10): baseMimeType(), conversionHint(), NormalizedImage, normalizeImage(), normalizeSupportedImageMimeType(), processImage(), ProcessImageResult, formatDimensionNote() (+2 more)

### Community 106 - "Provider Attribution"
Cohesion: 0.33
Nodes (9): getDefaultAttributionHeaders(), getSessionHeaders(), isCloudflareModel(), isNvidiaNimModel(), isOpenRouterModel(), matchesHost(), mergeProviderAttributionHeaders(), isInstallTelemetryEnabled() (+1 more)

### Community 108 - "Llama/Huggingface"
Cohesion: 0.24
Nodes (7): findHuggingFaceToken(), HuggingFaceClient, HuggingFaceModelDetails, HuggingFaceQuantization, parseRateLimitDelay(), payloadError(), readToken()

### Community 109 - "Theme Schema Json"
Cohesion: 0.17
Nodes (11): additionalProperties, oneOf, $defs, colorValue, description, required, $schema, title (+3 more)

### Community 110 - "Properties"
Cohesion: 0.17
Nodes (12): additionalProperties, description, type, description, pattern, type, properties, export (+4 more)

### Community 112 - "Trust Selector"
Cohesion: 0.35
Nodes (6): ProjectTrustOption, ProjectTrustStoreEntry, formatDecision(), TrustSelection, TrustSelectorComponent, TrustSelectorOptions

### Community 113 - "Provider"
Cohesion: 0.38
Nodes (9): llamaInferenceUrl(), LlamaModelInfo, normalizeLlamaServerUrl(), createLlamaProvider(), credentialServerUrl(), DEFAULT_LLAMA_SERVER_URL, LlamaProviderController, resolveServerUrl() (+1 more)

### Community 115 - "Daxnuts Component"
Cohesion: 0.31
Nodes (4): buildImage(), DaxnutsComponent, parseImage(), rgb()

### Community 117 - "Clipboard"
Cohesion: 0.16
Nodes (14): ClipboardReadResult, copyToClipboard(), copyToX11Clipboard(), emitOsc52(), isWaylandSession(), isRemoteSession(), ClipboardModule, ClipboardRequire (+6 more)

### Community 118 - "Legacy Api Aliases"
Cohesion: 0.04
Nodes (53): azureOpenAIResponsesApi(), bedrockConverseStreamApi(), importNodeOnlyApi(), googleVertexApi(), createSetupErrorMessage(), forwardStream(), hasResult(), lazyApi() (+45 more)

### Community 119 - "Properties"
Cohesion: 0.20
Nodes (10): description, $ref, properties, description, $ref, description, $ref, cardBg (+2 more)

### Community 120 - "Properties"
Cohesion: 0.20
Nodes (10): properties, description, $ref, mdQuoteBorder, searchMatchText, toolTitle, description, $ref (+2 more)

### Community 121 - "Src/Index"
Cohesion: 0.05
Nodes (59): allowedValues(), attributeNotes(), escapeCell(), generateTelemetryDocs(), parentDescription(), renderAgentTelemetrySchemaMarkdown(), renderSchema(), BranchSummaryDetails (+51 more)

### Community 122 - "Teaching LLM Client"
Cohesion: 0.07
Nodes (45): main(), num(), estimateTokens(), fitContext(), messageTokens(), abortError(), ChatOptions, LlmError (+37 more)

### Community 123 - "Agent Session Core"
Cohesion: 0.04
Nodes (3): AgentSession, createToolHtmlRenderer(), getThemeByName()

### Community 124 - "CLI Entry Args"
Cohesion: 0.05
Nodes (60): restoreSandboxEnv(), Args, Mode, parseArgs(), printHelp(), VALID_THINKING_LEVELS, buildInitialMessage(), InitialMessageInput (+52 more)

### Community 125 - "Agent Harness Runtime"
Cohesion: 0.07
Nodes (50): BashExecution, BashPrepare, bashSchema, BashToolDetails, BashToolInput, BashToolOptions, createBashTool(), getMutationQueueKey() (+42 more)

### Community 126 - "Generate Models"
Cohesion: 0.03
Nodes (63): AiGatewayModel, ANT_LING_RING_THINKING_LEVEL_MAP, BEDROCK_INFERENCE_PROFILE_ONLY_MODEL_IDS, COPILOT_STATIC_HEADERS, DEEPSEEK_V4_FLASH_THINKING_LEVEL_MAP, DEEPSEEK_V4_THINKING_LEVEL_MAP, __dirname, EAGER_TOOL_INPUT_STREAMING_UNSUPPORTED_ANTHROPIC_MODELS (+55 more)

### Community 127 - "Inline Tokens"
Cohesion: 0.29
Nodes (8): be(), blockTokens(), infiniteLoopError(), inlineTokens(), lex(), lexer(), lexInline(), reflink()

### Community 128 - "Command Options"
Cohesion: 0.07
Nodes (37): AuthInput, parseAuthInput(), RawAuthOptions, experimentalCli, ExperimentalCliContext, Command, CommandAction, CommandBuilder (+29 more)

### Community 129 - "Highlight Js Lib Index D"
Cohesion: 0.25
Nodes (4): highlight.js/lib/index.js, HighlightJs, HighlightOptions, HighlightResult

### Community 131 - "Entry"
Cohesion: 0.08
Nodes (18): assertJsonSerializable(), assertValidCursor(), assertValidLimit(), invalidPayload(), JsonValidationFrame, assertValidCursor(), assertValidLimit(), ordered() (+10 more)

### Community 132 - "Agent Harness Runtime"
Cohesion: 0.12
Nodes (30): abortResult(), fileInfoFromStats(), fileKindFromStats(), findBashOnPath(), getBashShellConfig(), getShellConfig(), getShellEnv(), isLegacyWslBashPath() (+22 more)

### Community 133 - "Dark Json"
Cohesion: 0.29
Nodes (6): export, cardBg, infoBg, pageBg, name, $schema

### Community 134 - "Light Json"
Cohesion: 0.29
Nodes (6): export, cardBg, infoBg, pageBg, name, $schema

### Community 135 - "Git"
Cohesion: 0.62
Nodes (6): buildGitSource(), decodeForValidation(), hasUnsafeGitInstallPart(), parseGenericGitUrl(), parseGitUrl(), splitRef()

### Community 136 - "Agent Harness"
Cohesion: 0.06
Nodes (4): AgentHarness, AgentHarnessOptions, CompactionSettings, QueueMode

### Community 137 - "Model Runtime"
Cohesion: 0.08
Nodes (3): ModelRuntime, RuntimeCredentials, operationSignal()

### Community 138 - "Core/Tools/Index"
Cohesion: 0.11
Nodes (46): DEFAULT_THINKING_LEVEL, getExperimentalToolSampling(), getDefaultAgentDir(), BashToolOptions, createBashTool(), createBashToolDefinition(), createEditTool(), createEditToolDefinition() (+38 more)

### Community 139 - "Harness/Skills"
Cohesion: 0.08
Nodes (36): formatPromptTemplateInvocation(), loadPromptTemplates(), loadSourcedPromptTemplates(), loadTemplateFromFile(), loadTemplatesFromDir(), parseFrontmatter(), PromptTemplateDiagnostic, PromptTemplateDiagnosticCode (+28 more)

### Community 141 - "Agent Message"
Cohesion: 0.05
Nodes (8): PendingMessageQueue, AgentLane, QueuedItem, SuspendedOperation, CompactResult, EffectiveLaneConfiguration, AgentMessage, ThinkingLevel

### Community 142 - "Codec"
Cohesion: 0.12
Nodes (32): decodeHeader(), decodeMutation(), encodeHeader(), encodeMutation(), ENTRY_TYPES, isObject(), metadataFromHeader(), OPERATION_KINDS (+24 more)

### Community 143 - "Repo"
Cohesion: 0.13
Nodes (17): fileResult(), jsonlSessionDirectories(), jsonlSessionDirectory(), jsonlSessionDirectoryName(), JsonlSessionRepo, jsonlSessionsRoot(), listJsonlSessionMetadata(), loadJsonlSessionStorage() (+9 more)

### Community 144 - "Vars"
Cohesion: 0.40
Nodes (5): oneOf, vars, additionalProperties, description, type

### Community 145 - "Colors"
Cohesion: 0.50
Nodes (4): additionalProperties, description, type, colors

### Community 147 - "Accent"
Cohesion: 0.67
Nodes (3): description, $ref, accent

### Community 148 - "Bash Mode"
Cohesion: 0.67
Nodes (3): description, $ref, bashMode

### Community 149 - "Border"
Cohesion: 0.67
Nodes (3): description, $ref, border

### Community 150 - "Border Accent"
Cohesion: 0.67
Nodes (3): description, $ref, borderAccent

### Community 151 - "Border Muted"
Cohesion: 0.67
Nodes (3): description, $ref, borderMuted

### Community 152 - "Custom Message Bg"
Cohesion: 0.67
Nodes (3): description, $ref, customMessageBg

### Community 153 - "Custom Message Label"
Cohesion: 0.67
Nodes (3): description, $ref, customMessageLabel

### Community 154 - "Custom Message Text"
Cohesion: 0.67
Nodes (3): description, $ref, customMessageText

### Community 155 - "Dim"
Cohesion: 0.67
Nodes (3): description, $ref, dim

### Community 156 - "Error"
Cohesion: 0.67
Nodes (3): description, $ref, error

### Community 157 - "Md Code"
Cohesion: 0.67
Nodes (3): description, $ref, mdCode

### Community 158 - "Md Code Block"
Cohesion: 0.67
Nodes (3): description, $ref, mdCodeBlock

### Community 159 - "Md Code Block Border"
Cohesion: 0.67
Nodes (3): description, $ref, mdCodeBlockBorder

### Community 160 - "Md Heading"
Cohesion: 0.67
Nodes (3): description, $ref, mdHeading

### Community 161 - "Md Hr"
Cohesion: 0.67
Nodes (3): description, $ref, mdHr

### Community 162 - "Md Link"
Cohesion: 0.67
Nodes (3): description, $ref, mdLink

### Community 163 - "Md Link Url"
Cohesion: 0.67
Nodes (3): description, $ref, mdLinkUrl

### Community 164 - "Md List Bullet"
Cohesion: 0.67
Nodes (3): description, $ref, mdListBullet

### Community 165 - "Md Quote"
Cohesion: 0.67
Nodes (3): description, $ref, mdQuote

### Community 166 - "Muted"
Cohesion: 0.67
Nodes (3): description, $ref, muted

### Community 167 - "Scrollbar Thumb"
Cohesion: 0.67
Nodes (3): scrollbarThumb, description, $ref

### Community 168 - "Search Match Bg"
Cohesion: 0.67
Nodes (3): searchMatchBg, description, $ref

### Community 169 - "Selected Bg"
Cohesion: 0.67
Nodes (3): selectedBg, description, $ref

### Community 170 - "Success"
Cohesion: 0.67
Nodes (3): success, description, $ref

### Community 171 - "Syntax Comment"
Cohesion: 0.67
Nodes (3): syntaxComment, description, $ref

### Community 172 - "Syntax Function"
Cohesion: 0.67
Nodes (3): syntaxFunction, description, $ref

### Community 173 - "Syntax Keyword"
Cohesion: 0.67
Nodes (3): syntaxKeyword, description, $ref

### Community 174 - "Syntax Number"
Cohesion: 0.67
Nodes (3): syntaxNumber, description, $ref

### Community 175 - "Syntax Operator"
Cohesion: 0.67
Nodes (3): syntaxOperator, description, $ref

### Community 176 - "Syntax Punctuation"
Cohesion: 0.67
Nodes (3): syntaxPunctuation, description, $ref

### Community 177 - "Syntax String"
Cohesion: 0.67
Nodes (3): syntaxString, description, $ref

### Community 178 - "Syntax Type"
Cohesion: 0.67
Nodes (3): syntaxType, description, $ref

### Community 179 - "Syntax Variable"
Cohesion: 0.67
Nodes (3): syntaxVariable, description, $ref

### Community 180 - "Text"
Cohesion: 0.67
Nodes (3): text, description, $ref

### Community 181 - "Thinking High"
Cohesion: 0.67
Nodes (3): thinkingHigh, description, $ref

### Community 182 - "Thinking Low"
Cohesion: 0.67
Nodes (3): thinkingLow, description, $ref

### Community 183 - "Thinking Max"
Cohesion: 0.67
Nodes (3): thinkingMax, description, $ref

### Community 184 - "Thinking Medium"
Cohesion: 0.67
Nodes (3): thinkingMedium, description, $ref

### Community 185 - "Thinking Minimal"
Cohesion: 0.67
Nodes (3): thinkingMinimal, description, $ref

### Community 186 - "Thinking Off"
Cohesion: 0.67
Nodes (3): thinkingOff, description, $ref

### Community 187 - "Thinking Text"
Cohesion: 0.67
Nodes (3): thinkingText, description, $ref

### Community 188 - "Thinking Xhigh"
Cohesion: 0.67
Nodes (3): thinkingXhigh, description, $ref

### Community 189 - "Tool Diff Added"
Cohesion: 0.67
Nodes (3): toolDiffAdded, description, $ref

### Community 190 - "Tool Diff Context"
Cohesion: 0.67
Nodes (3): toolDiffContext, description, $ref

### Community 191 - "Tool Diff Removed"
Cohesion: 0.67
Nodes (3): toolDiffRemoved, description, $ref

### Community 192 - "Tool Error Bg"
Cohesion: 0.67
Nodes (3): toolErrorBg, description, $ref

### Community 193 - "Tool Output"
Cohesion: 0.67
Nodes (3): toolOutput, description, $ref

### Community 194 - "Tool Pending Bg"
Cohesion: 0.67
Nodes (3): toolPendingBg, description, $ref

### Community 195 - "Tool Success Bg"
Cohesion: 0.67
Nodes (3): toolSuccessBg, description, $ref

### Community 196 - "User Message Bg"
Cohesion: 0.67
Nodes (3): userMessageBg, description, $ref

### Community 197 - "User Message Text"
Cohesion: 0.67
Nodes (3): userMessageText, description, $ref

### Community 198 - "Interactive TUI Mode"
Cohesion: 0.67
Nodes (3): warning, description, $ref

### Community 201 - "Deferred Tools Test"
Cohesion: 0.08
Nodes (33): UserMessage, calculateContextTokens(), ContextUsageEstimate, estimateContextTokens(), estimateMessages(), estimateMessageTokens(), estimateTextAndImageContentChars(), estimateTextAndImageContentTokens() (+25 more)

### Community 202 - "Harness/Tools/Edit"
Cohesion: 0.10
Nodes (32): createEditTool(), AppliedEditsResult, applyEditsToNormalizedContent(), applyReplacements(), applyReplacementsPreservingUnchangedLines(), countOccurrences(), detectLineEnding(), Edit (+24 more)

### Community 203 - "Settings Manager"
Cohesion: 0.08
Nodes (33): CONFIG_DIR_NAME, emitProjectTrustEvent(), ProjectTrustContext, formatProjectTrustPrompt(), ResolveProjectTrustedOptions, selectProjectTrustOption(), BranchSummarySettings, CompactionSettings (+25 more)

### Community 204 - "Faux"
Cohesion: 0.10
Nodes (31): assistantContentToText(), cloneMessage(), commonPrefixLength(), contentToText(), createAbortedMessage(), createDeferredMessage(), createErrorMessage(), createFauxCore() (+23 more)

### Community 205 - "Oauth/Github Copilot"
Cohesion: 0.12
Nodes (27): abortableSleep(), OAuthDeviceCodeIncompletePollResult, OAuthDeviceCodePollOptions, OAuthDeviceCodePollResult, pollOAuthDeviceCodeFlow(), RFC-8628, asRecord(), CLIENT_ID (+19 more)

### Community 206 - "Agent Loop"
Cohesion: 0.16
Nodes (28): AgentEventSink, agentLoop(), agentLoopContinue(), createAgentStream(), createErrorToolResult(), createToolResultMessage(), emitToolExecutionEnd(), emitToolResultMessage() (+20 more)

### Community 207 - "Session"
Cohesion: 0.12
Nodes (3): collectEntriesForBranchSummary(), Session, IdGenerator

### Community 208 - "E2E Test"
Cohesion: 0.11
Nodes (19): AgentEvent, AgentToolResult, abortExecution(), basicPrompt(), getTextContent(), multiTurnConversation(), registrations, stateUpdates() (+11 more)

### Community 209 - "Oauth/Xai"
Cohesion: 0.12
Nodes (18): credentialsFromTokenResponse(), JsonObject, loginXai(), OAuthHttpResponse, parseDeviceCode(), pollForTokens(), positiveNumber(), postForm() (+10 more)

### Community 210 - "Src/Types"
Cohesion: 0.16
Nodes (19): ActiveRun, AgentOptions, DEFAULT_MODEL, EMPTY_USAGE, MutableAgentState, AfterToolCallContext, AfterToolCallResult, AgentContext (+11 more)

### Community 211 - "Oauth/OpenAI Codex"
Cohesion: 0.13
Nodes (24): createAuthorizationFlow(), createState(), credentialsFromToken(), decodeJwt(), DeviceAuthInfo, DeviceTokenSuccess, exchangeAuthorizationCode(), exchangeAuthorizationCodeForCredentials() (+16 more)

### Community 212 - "Agent Loop Test"
Cohesion: 0.09
Nodes (9): setDefaultStreamFn(), AgentToolUpdateCallback, createAssistantMessage(), createUsage(), CustomMessage, CustomNotification, MockAssistantStream, MockAssistantStream (+1 more)

### Community 213 - "Scanning"
Cohesion: 0.17
Nodes (16): SessionSearch, SessionSearchHit, SessionSearchOptions, arraySource(), createDefaultScanningHit(), createScanningSessionSearch(), readablesFor(), scanningEntries() (+8 more)

### Community 214 - "Dependencies"
Cohesion: 0.09
Nodes (22): @anthropic-ai/sdk, @aws-sdk/client-bedrock-runtime, @earendil-works/pi-telemetry, @google/genai, http-proxy-agent, https-proxy-agent, @opentelemetry/api, dependencies (+14 more)

### Community 215 - "Oauth/Kimi Coding"
Cohesion: 0.17
Nodes (18): DeviceAuthorization, formUrlEncode(), getOauthHost(), isRetryableRefreshFailure(), kimiCodingOAuth, loginKimiCoding(), parseTokenResponse(), pollForToken() (+10 more)

### Community 216 - "Interactive Theme Controller"
Cohesion: 0.17
Nodes (7): ANALYTICS_OPTIONS, FirstTimeSetupOptions, FirstTimeSetupResult, SETUP_LOGO_LINES, THEME_OPTIONS, InteractiveThemeController, TerminalTheme

### Community 218 - "In Memory Session Storage"
Cohesion: 0.15
Nodes (5): InMemorySessionRepo, InMemorySessionStorage, SessionCreateOptions, SessionMetadata, WorkspaceMetadata

### Community 219 - "Tsconfig Build Json"
Cohesion: 0.10
Nodes (19): ../ai/dist/*.d.ts, ../ai/dist/index.d.ts, ../ai/dist/providers/*.d.ts, **/*.d.ts, node_modules, src/**/*.d.ts, src/**/*.ts, ../telemetry/dist/index.d.ts (+11 more)

### Community 220 - "Oauth/Openrouter"
Cohesion: 0.21
Nodes (17): startCallbackServer(), escapeHtml(), oauthErrorHtml(), oauthSuccessHtml(), renderPage(), startLocalOAuthServer(), errorDetail(), exchangeAuthorizationCode() (+9 more)

### Community 221 - "Rpc Mode"
Cohesion: 0.23
Nodes (15): PrintModeOptions, attachJsonlLineReader(), serializeJsonLine(), DistributiveOmit, ModelInfo, RpcClientOptions, RpcCommandBody, RpcEventListener (+7 more)

### Community 223 - "Events"
Cohesion: 0.13
Nodes (11): Events, HarnessEvent, HarnessEventBus, HarnessEventListener, HarnessEventOfType, HarnessEventType, RunEndEvent, RunStartEvent (+3 more)

### Community 224 - "Oauth/Radius"
Cohesion: 0.14
Nodes (12): DeviceAuthorizationResponse, loginWithBrowser(), loginWithDeviceCode(), OAuthCallbackServer, OAuthResponseError, RadiusOAuthDiscovery, RadiusOAuthOptions, NOTE: This module uses node:http for the OAuth callback server. (+4 more)

### Community 227 - "Radius Config"
Cohesion: 0.22
Nodes (15): piMessagesApi(), DEFAULT_RADIUS_GATEWAY, getRadiusCredentialConfig(), getRadiusModels(), getRadiusModelsFromConfig(), isRadiusGatewayModel(), loadRadiusGatewayConfig(), normalizeRadiusGatewayUrl() (+7 more)

### Community 229 - "Oauth/Anthropic"
Cohesion: 0.19
Nodes (13): CallbackServerInfo, CLIENT_ID, exchangeAuthorizationCode(), formatErrorDetails(), getNodeApis(), loginAnthropic(), NodeApis, parseAuthorizationInput() (+5 more)

### Community 230 - "Cloudflare Gateway Binding"
Cohesion: 0.18
Nodes (11): AiGatewayBinding, AiGatewayBindingGateway, AiGatewayUniversalRequestLike, CLOUDFLARE_GATEWAY_BINDING_AUTH_SENTINEL, collectHeaders(), createGatewayBindingFetch(), FetchInput, GatewayBindingFetchOptions (+3 more)

### Community 231 - "Validation"
Cohesion: 0.22
Nodes (16): applySchemaArrayCoercion(), applySchemaObjectCoercion(), coercePrimitiveByType(), coerceWithJsonSchema(), coerceWithUnionSchema(), formatValidationPath(), getSchemaTypes(), getSubSchemaValidator() (+8 more)

### Community 232 - "Footer"
Cohesion: 0.21
Nodes (11): areExperimentalFeaturesEnabled(), PREFER_STRICT_TOOL_SAMPLING, getLatestCompactionEntry(), addUsageToTotals(), createUsageTotals(), getUsageCostBreakdown(), UsageCostBreakdownEntry, UsageTotals (+3 more)

### Community 233 - "Package Json"
Cohesion: 0.12
Nodes (15): author, bin, pi-ai, description, engines, node, files, dist (+7 more)

### Community 234 - "Generate Models"
Cohesion: 0.15
Nodes (16): applyModelsDevReasoningOptionMetadata(), applyOpenAICompletionsCompatMetadata(), applyOpenAIExplicitPromptCacheMetadata(), applyOpenAIGrammarToolCompatMetadata(), applyOpenAIToolSearchMetadata(), detectOpenAICompletionsCompat(), fetchAiGatewayModels(), fetchOpenRouterModels() (+8 more)

### Community 235 - "Provider Error Body Regression Test"
Cohesion: 0.12
Nodes (10): bedrockMock, BedrockRuntimeClient, BedrockRuntimeServiceException, completionsModel, context, ConverseStreamCommand, FakeAPIError, FakeOpenAI (+2 more)

### Community 236 - "Cloudflare Workers Ai"
Cohesion: 0.20
Nodes (9): ApiKeyCredential, cloudflareAIGatewayAuth(), CloudflareAuthKind, cloudflareWorkersAIAuth(), resolveCloudflareEnv(), resolveValue(), cloudflareStreams(), resolveCloudflareModel() (+1 more)

### Community 239 - "Bedrock Error Metadata Test"
Cohesion: 0.15
Nodes (8): bedrockMock, BedrockRuntimeClient, BedrockRuntimeServiceException, context, ConverseStreamCommand, getModelFixture(), runBedrock(), SendResult

### Community 240 - "Dependencies"
Cohesion: 0.15
Nodes (13): diff, @earendil-works/pi-ai, @earendil-works/pi-telemetry, ignore, dependencies, diff, @earendil-works/pi-ai, @earendil-works/pi-telemetry (+5 more)

### Community 241 - "Image"
Cohesion: 0.33
Nodes (11): detectSupportedImageMimeType(), encodeBase64(), isAnimatedPng(), isBmp(), isPng(), PNG_SIGNATURE, readUint16LE(), readUint32BE() (+3 more)

### Community 242 - "Proxy"
Cohesion: 0.24
Nodes (9): buildProxyRequestOptions(), processProxyEvent(), ProxyAssistantMessageEvent, ProxyMessageEventStream, ProxySerializableStreamOptions, ProxyStreamOptions, streamProxy(), model (+1 more)

### Community 243 - "Generate Image Models"
Cohesion: 0.24
Nodes (10): __dirname, fetchOpenRouterImageModels(), __filename, generateImageModelsFile(), main(), OpenRouterModelRecord, packageRoot, parseOpenRouterImageModels() (+2 more)

### Community 244 - "Utils/Retry"
Cohesion: 0.24
Nodes (8): isRetryableAssistantError(), NON_RETRYABLE_PROVIDER_LIMIT_ERROR_PATTERN, RETRYABLE_PROVIDER_ERROR_PATTERN, retryAssistantCall(), RetryCallbacks, RetryPolicy, RetrySleepAbortError, sleep()

### Community 245 - "Package Json"
Cohesion: 0.18
Nodes (10): author, description, engines, node, license, main, name, type (+2 more)

### Community 246 - "Apply Thinking Level Metadata"
Cohesion: 0.18
Nodes (11): applyStrictToolCompatMetadata(), applyThinkingLevelMetadata(), isAnthropicAdaptiveThinkingModel(), isAnthropicTemperatureUnsupportedModel(), isGemini3FlashModel(), isGemini3ProModel(), isGemma4Model(), isGoogleThinkingApi() (+3 more)

### Community 247 - "Ansi To Html"
Cohesion: 0.31
Nodes (10): ANSI_COLORS, ansiLinesToHtml(), ansiToHtml(), applySgrCode(), color256ToHex(), createEmptyStyle(), escapeHtml(), hasStyle() (+2 more)

### Community 248 - "Load Models Dev Data"
Cohesion: 0.24
Nodes (10): fetchNvidiaNimModelIds(), getAnthropicMessagesCompat(), getBedrockBaseUrl(), getModelsDevCost(), getTogetherCompat(), getTogetherThinkingLevelMap(), loadModelsDevData(), normalizeNvidiaModelId() (+2 more)

### Community 249 - "Mock Web Socket"
Cohesion: 0.29
Nodes (3): buildSSEPayload(), MockWebSocket, start()

### Community 250 - "Dev Dependencies"
Cohesion: 0.22
Nodes (9): devDependencies, @types/node, typescript, vitest, @vitest/coverage-v8, @types/node, typescript, vitest (+1 more)

### Community 251 - "Scripts"
Cohesion: 0.22
Nodes (9): scripts, build, check:telemetry-docs, clean, coverage:harness, generate-telemetry-docs, prepublishOnly, test (+1 more)

### Community 252 - "Jsonl Storage Test"
Cohesion: 0.25
Nodes (4): NewRecord, createRepository(), reopen(), tempDirs

### Community 253 - "Ui"
Cohesion: 0.28
Nodes (7): LlamaProgress, compactCount(), contextLabel(), LlamaManagerAction, modelDescription(), ProgressState, showLlamaUi()

### Community 254 - "Json Event"
Cohesion: 0.25
Nodes (4): JsonAgentSessionEvent, JsonMessageUpdateEvent, MessageUpdateEvent, WithoutPartial

### Community 255 - "Exports"
Cohesion: 0.25
Nodes (8): exports, ./node, ./package.json, ./session/testing, import, types, import, types

### Community 256 - "Truncate Test"
Cohesion: 0.36
Nodes (5): assertMatchesBufferTail(), bufferTail(), checkExhaustive(), encoder, sampledByteLimits()

### Community 257 - "Keywords"
Cohesion: 0.25
Nodes (8): keywords, ai, anthropic, api, bedrock, gemini, llm, unified

### Community 259 - "Dev Dependencies"
Cohesion: 0.29
Nodes (7): canvas, devDependencies, canvas, @types/node, vitest, @types/node, vitest

### Community 260 - "Generate Test Image"
Cohesion: 0.29
Nodes (6): buffer, canvas, ctx, __dirname, __filename, outputPath

### Community 261 - "OpenAI Codex Oauth Test"
Cohesion: 0.33
Nodes (3): openaiCodexOAuth, deviceAuthPendingResponse(), jsonResponse()

### Community 263 - "Keywords"
Cohesion: 0.33
Nodes (6): keywords, agent, ai, llm, state-management, transport

### Community 265 - "Vitest Config"
Cohesion: 0.40
Nodes (4): agentSrcIndex, aiSrcCompat, aiSrcIndex, telemetrySrcIndex

### Community 266 - "Vitest Harness Config"
Cohesion: 0.40
Nodes (4): agentSrcIndex, aiSrcCompat, aiSrcIndex, telemetrySrcIndex

### Community 268 - "Repository"
Cohesion: 0.50
Nodes (4): repository, directory, type, url

### Community 269 - "Repository"
Cohesion: 0.50
Nodes (4): repository, directory, type, url

### Community 270 - "Side Effects"
Cohesion: 0.50
Nodes (4): sideEffects, ./dist/compat.js, ./dist/images.js, ./dist/providers/images/register-builtins.js

### Community 271 - "Packageon"
Cohesion: 0.67
Nodes (3): files, dist, README.md

## Knowledge Gaps
- **1476 isolated node(s):** `BuiltInKeyBindings`, `ReloadHandler`, `RunnerEmitEvent`, `RunnerEmitResult`, `SessionBeforeEvent` (+1471 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **32 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `SettingsManager` connect `Settings Manager` to `Extension Bindings`, `Resource Loader`, `Core/Tools/Index`, `Config Selector Component`, `Interactive Theme`, `Default Package Manager`, `Package Manager`, `Settings Manager`, `Resource List`, `Package Manager Cli`, `Session Manager`, `Normalize Path`, `Model Selector Component`, `Model Resolver`, `Deep Merge Settings`, `Settings Manager`, `Components/Index`, `Interactive Theme Controller`, `Package Manager`, `Provider Attribution`, `Settings Manager`, `Agent Session Core`, `CLI Entry Args`?**
  _High betweenness centrality (0.022) - this node is a cross-community bridge._
- **Why does `ModelRuntime` connect `Model Runtime` to `Extension Bindings`, `Resource Loader`, `Session Manager`, `Model Config`, `Model Selector Component`, `Model Resolver`, `Auth Check`, `Core/Tools/Index`, `Extension Runner`, `Components/Index`, `Normalize Path`, `Model Runtime`, `Agent Session Core`, `CLI Entry Args`, `Package Manager Cli`?**
  _High betweenness centrality (0.014) - this node is a cross-community bridge._
- **Why does `Theme` connect `Theme` to `Extension Bindings`, `Resource Loader`, `Core/Tools/Index`, `Interactive Theme`, `Config`, `Coding Agent Tools`, `Tree Selector`, `Session Manager`, `Interactive TUI Mode`, `Interactive Mode`, `Core/Tools/Edit`, `Interactive TUI Mode`, `Armin Component`, `Scoped Models Selector`, `Session Selector`, `Keybinding Hints`, `Keybindings Manager`, `Settings Manager`, `Components/Index`, `Llama View`, `Interactive Theme Controller`, `Rpc Mode`, `Settings Selector`, `Interactive Mode`, `Footer`, `Trust Selector`, `Hugging Face Search`, `Daxnuts Component`, `Ui`?**
  _High betweenness centrality (0.011) - this node is a cross-community bridge._
- **What connects `BuiltInKeyBindings`, `ReloadHandler`, `RunnerEmitEvent` to the rest of the system?**
  _1476 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Extension Bindings` be split into smaller, more focused modules?**
  _Cohesion score 0.03262606778726922 - nodes in this community are weakly interconnected._
- **Should `OpenAI Compat Layer` be split into smaller, more focused modules?**
  _Cohesion score 0.01836878662904276 - nodes in this community are weakly interconnected._
- **Should `Agent Harness Runtime` be split into smaller, more focused modules?**
  _Cohesion score 0.03980782429649966 - nodes in this community are weakly interconnected._
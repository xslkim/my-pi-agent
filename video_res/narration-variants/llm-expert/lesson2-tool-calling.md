>>> 协议扩展 #B01
tool calling 不改变传输层，只扩展协议
请求体加一个 **tools** 字段
每个工具：name、description、一份 JSON Schema
模型看到的全部，就是这份声明
description 里写不要心算、请用计算器
不是礼貌，是降低它绕过工具的概率


>>> 响应形态变化 #B02
带上 tools 再问，响应形态变了
delta.content 为空，多出来 **delta.tool_calls**
finish_reason 从 stop 变成 tool_calls
模型没有执行任何东西
它只是按协议输出了一段结构化文本
执行是宿主程序的事


>>> 参数是字符串碎片 #B03
关键细节：arguments 不是 JSON 对象，是字符串
而且是被切碎的字符串流
真实抓包里，数字 21 分成两片到达
只有第一片带 id 和 name，后续只有 index
必须按 index 累加，流结束后再 parse
中途 parse 必炸，而且半成品长得像合法状态


>>> 运行时校验 #B04
TypeScript 的类型在运行时不存在
类型剥离之后，没有任何东西替你检查参数
而模型一定会传错
字符串当数字、缺字段、调不存在的工具
所以宿主侧要自己写校验器，六十行
数字宽容转换，错误信息精确到字段名


>>> 错误回灌 #B05
校验失败不抛异常
错误文本作为 tool 消息回灌进上下文
模型读到 field op is required，自己补参数重试
所谓 agent 的 **自愈**，本质是错误也是上下文
报错信息的第一读者是模型，不是人


>>> agent loop #B06
agent 的本体是一个 while
调模型，收 tool_calls，执行，结果回灌，再调
finish_reason 不再是 tool_calls 时退出
去掉外壳，agent 就是这段循环加一份消息状态
九十几行


>>> 消息序列不变量 #B07
协议有一条硬性 **不变量**
带 tool_calls 的 assistant 消息之后
必须紧跟每个 call 对应的 tool 结果
缺一条，服务端直接 400
而且报错信息完全看不出根因
这条不变量后面每一集都会回来


>>> wire format #B08
回传时还有一个线上格式问题
内部表示是 id、name、arguments 的扁平结构
线上要求 type 冒号 function，再嵌套一层 function
少这层包装，llama.cpp 直接 500
fake server 测不出来：它验的是我们自己定义的形状
内部表示与 **wire format** 分离，转换只发生在出口


>>> maxSteps #B09
模型会死循环：反复调同一个工具
工具持续报错时尤其如此
**maxSteps** 是必需的熔断，不是防御性洁癖
没有上限，六万四的上下文会被烧光
本地模型上烧掉的是时间
按 token 计费的云上，烧掉的是钱


>>> 与生产实现的差距 #B10
pi 的 loop 七百九十六行
多出的是并行工具、插话队列、生命周期钩子
每一项对应我们显式跳过的一个边界
串行、单端点的九十几行，足够讲清协议
生产级的复杂度几乎全在边界条件里

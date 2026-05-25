# 1.6T 光模块产业链瓶颈研究

## 一句话判断

1.6T 光模块的真正瓶颈不是“谁能做出样品”，而是 200G/lane 光电链路在功耗、良率、测试吞吐、InP/激光器供应、OSFP/OSFP-XD 热设计和云厂商认证上的系统性约束；2026-2028 年最值得跟踪的是 1.6T DR8/2xDR4 量产良率、200G PAM4 DSP/driver/TIA、InP EML 与 CW laser、224G 测试设备、以及 LPO/CPO 对传统 DSP 模块价值链的替代速度。

## 研究范围与默认假设

- 地域: 全球视角，重点覆盖美国、中国、日本和东南亚制造链。
- 时间范围: 2026-2030 年，偏 3-5 年产业研究。
- 研究目的: 产业链瓶颈识别与供应商研究，不构成买入、卖出或持有建议。
- 产品边界: 以 AI 数据中心短距/中距 1.6T 可插拔光模块为主，覆盖 OSFP、OSFP-XD、DR8、2xDR4、FR4/2xFR4、LPO/LRO，以及与 CPO/NPO 的替代关系；相干 1.6T ZR/ZR+ 作为相邻分支处理。
- 资料来源: 公司公告/产品页、IEEE/OIF/行业会议资料、TrendForce/LightCounting 等行业研究摘要；截至 2026-05-25 的公开信息。

## 横向产业链地图

| 环节 | 作用 | 上游依赖 | 下游客户/场景 | 代表供应商 | 约束信号 |
|---|---|---|---|---|---|
| AI 集群网络需求 | 驱动 800G 向 1.6T 升级 | GPU/TPU、交换 ASIC、集群拓扑、功耗预算 | 云厂商、AI 工厂、HPC | NVIDIA、Google、Meta、Amazon、Microsoft | AI 集群从 400G/800G 转向 800G+/1.6T，端口密度和功耗约束同步上升 |
| 交换 ASIC/SerDes | 决定端口速率和模块代际 | 先进制程、112G/224G SerDes、封装 | 交换机、NIC/DPU、云网络 | Broadcom、NVIDIA、Marvell | 51.2T/102.4T 交换容量推动 800G/1.6T 端口部署 |
| 200G/lane 电芯片 | 完成 PAM4 DSP、FEC、driver、TIA、retimer | 先进节点、模拟 IP、高速封装 | 光模块、AEC、LPO/LRO | Marvell、Broadcom、Semtech、Credo、MaxLinear | 200G/lane 带来功耗、信号完整性、热和 FEC 复杂度压力 |
| 光源/调制器 | 将电信号转换为高速光信号 | InP 外延、EML/DFB/CW laser、硅光 PIC、GaAs VCSEL | 1.6T DR/FR、硅光、CPO | Coherent、Lumentum、Source Photonics、海信宽带、Innolume | 200G EML、CW laser、InP 芯片和可靠性验证是慢变量 |
| 光模块设计与制造 | 集成芯片、光器件、PCB、散热和固件 | 上游芯片/光源、FAU、连接器、测试 | 云厂商、交换机厂 | Innolight、中际旭创、Eoptolink、新易盛、Coherent、Jabil、Fabrinet、AOI | 样品展示多，但批量一致性、良率和认证节奏决定实际供给 |
| 封装/被动光学 | 实现低损耗耦合和高密度出光 | FAU、透镜、隔离器、陶瓷插芯、MPO/SN 连接器 | 模块厂、CPO 光引擎 | SENKO、US Conec、Corning、天孚通信、太辰光 | 高端小器件成本占比低，但失败会阻断整模块交付 |
| 测试与认证 | 保证 BER、眼图、FEC、温度、互通和可靠性 | BERT、DCA、采样示波器、光谱仪、自动耦合、老化设备 | 模块厂、云厂商实验室 | Keysight、Anritsu、Tektronix、VIAVI | 224G/1.6T 测试复杂度和测试时间可能成为隐性产能瓶颈 |
| 系统集成 | 把模块部署进交换机和集群网络 | OSFP/OSFP-XD cage、散热、线缆管理、软件监控 | 云数据中心、AI 训练集群 | Arista、Cisco、NVIDIA、HPE、Dell | 插拔模块功耗、散热和可维护性决定部署速度 |

## 纵向技术/工艺/产能拆解

| 关键节点 | 底层约束 | 关键工艺/设备 | 扩产路径 | 验证周期 | 替代路线 | 主要风险 |
|---|---|---|---|---|---|---|
| 1.6T DR8/2xDR4 模块 | 8x200G PAM4 光通道，链路预算更紧 | 高速 PCB、DSP/driver/TIA、EML/硅光、自动耦合、温控测试 | 增加模块产线、测试设备和上游器件锁单 | 云厂商互通、可靠性、温循、批量一致性验证 | 800G 双模块、AEC、LPO、CPO | 功耗超预算、良率低、测试吞吐不足 |
| 200G/lane PAM4 DSP | FEC、ADC/DAC、SerDes、热功耗 | 5nm/3nm/更先进节点、模拟前端、封装 | 芯片 tape-out、晶圆代工、客户设计导入 | 模块厂与系统厂联合认证 | LPO/LRO/XPO、CPO 缩短电通道 | DSP 价值被线性光学侵蚀，或功耗降不够快 |
| EML/InP laser | III-V 外延缺陷、芯片寿命、高温可靠性 | MOCVD、外延、光刻、刻蚀、镀膜、老化测试 | 扩建外延/芯片线，提升良率和老化吞吐 | 长周期可靠性与客户 qualification | 硅光外置 CW laser、GaAs VCSEL、薄膜铌酸锂 | 产能扩张慢，客户集中，路线切换影响价值 |
| 硅光 PIC/CW laser | 光源异质集成、耦合损耗、热漂移 | CMOS 硅光工艺、flip-chip、晶圆级测试、FAU 耦合 | 晶圆代工加封装测试平台扩张 | 光源、封装、系统级可靠性验证 | 分立 EML、LPO、CPO 光引擎 | 光源与封装成为硅光规模化瓶颈 |
| OSFP/OSFP-XD 热设计 | 1.6T 功耗密度高，前面板空间有限 | 散热器、cage、PCB、风道、固件监控 | 机箱/交换机协同设计 | 系统级热测试和长期可靠性 | CPO/NPO、液冷、降低 DSP 功耗 | 模块可用但系统无法稳定部署 |
| 224G 测试设备 | 极高速信号的测试一致性和吞吐 | DCA、BERT、clock recovery、FEC/BER 测试、自动化工站 | 采购仪器、并行化测试、自动化软件 | 与 IEEE/OIF/客户规范同步 | 抽样测试、内建自测试 | 测试时间吞噬产能，设备交期和资本开支上升 |
| 客户认证 | hyperscaler 对互通、寿命和供应稳定性要求高 | 交换机互通、固件、温湿度、长期稳定性 | 从样品到小批量再到量产 | 通常跨季度推进 | 多供应商导入、降级到 800G | 样品阶段乐观但量产订单延后 |

## Top 潜在瓶颈

| 排名 | 瓶颈节点 | 为什么会卡 | 需求驱动 | 供给约束 | 替代难度 | 证据强度 | 结论状态 |
|---|---|---|---|---|---|---|---|
| 1 | 1.6T 量产良率与测试吞吐 | 200G/lane 把光、电、热、固件和测试耦合到一起，单点达标不等于批量达标 | AI 集群端口带宽升级 | 高速测试设备、自动耦合、温循/BER 测试时间 | 中高 | 中 | 合理推断 |
| 2 | 200G/lane DSP/driver/TIA | 1.6T 需要低功耗高性能电芯片，且 LPO/CPO 可能改变价值分配 | 1.6T OSFP/OSFP-XD、AEC、LPO | 先进节点、模拟 IP、客户设计导入 | 中 | 高 | 确定事实/合理推断 |
| 3 | InP EML 与 CW laser | III-V 外延、芯片可靠性和老化测试扩张慢于模块组装 | 1.6T DR/FR、硅光、CPO 外置光源 | 外延/芯片/老化产能、少数成熟供应商 | 高 | 中 | 合理推断 |
| 4 | OSFP/OSFP-XD 热与系统部署 | 模块功耗、交换机风道和机柜功率一起约束部署 | 51.2T/102.4T 交换机端口密度 | 散热结构、系统设计、运维可维护性 | 中 | 中 | 合理推断 |
| 5 | 客户认证和供货一致性 | 云厂商不只买样品，还要求多批次互通和稳定供货 | 大规模 AI 集群 | qualification、固件、可靠性、供应链备份 | 高 | 中 | 合理推断 |
| 6 | 硅光封装与外置光源 | 硅光可降成本/功耗，但光源、耦合、封装良率仍需爬坡 | 1.6T/3.2T、CPO/NPO | CW laser、FAU、异质集成、测试 | 中高 | 中 | 合理推断 |
| 7 | 被动光学与连接器 | 成本小但链路损耗和端面一致性影响整机良率 | 高密度端口和 CPO 光纤管理 | 精密加工、检测和洁净装配 | 中 | 中低 | 待验证假设 |
| 8 | 中国高端上游替代 | 模块厂强，但核心 DSP、仪器、部分高端激光器仍需验证 | 中国 AI 数据中心与出口供应链 | IP、设备、客户认证、出口限制 | 高 | 中低 | 待验证假设 |

## 关键供应商与公司映射

| 环节 | 公司/机构 | 上市状态 | 地域 | 可能客户/下游 | 相关产品 | 扩产难点 | 待验证点 |
|---|---|---|---|---|---|---|---|
| PAM4 DSP/SerDes | Marvell | 上市 | 美国 | 模块厂、云厂商 | Nova/Ara 1.6T PAM4 DSP、AEC DSP、相干 DSP | 先进节点、功耗、客户导入 | 3nm Ara 的量产节奏与 LPO 替代影响 |
| PAM4 DSP/PHY | Broadcom | 上市 | 美国 | 模块厂、交换机厂 | 200G/lane Sian2、交换 ASIC | SerDes、PHY 与交换芯片协同 | 1.6T DR8 中份额和 102.4T 节奏 |
| 线性光学芯片 | Semtech | 上市 | 美国 | LPO/LRO/XPO 模块 | 224G TIA、MZM driver | 线性链路预算和客户规范 | LPO/LRO 是否规模替代 DSP 模块 |
| 光器件/模块 | Coherent | 上市 | 美国 | 云厂商、模块厂、系统厂 | 1.6T、3.2T、InP CW laser、200G InP EML、硅光 PIC | 垂直整合、InP 良率、资本开支 | OFC 2026 展示到量产的转换速度 |
| 激光器/光源 | Lumentum | 上市 | 美国 | 云厂商、CPO/硅光生态 | Datacom lasers、硅光相关光源 | 激光器产能、客户集中 | NVIDIA photonics 生态中的真实订单节奏 |
| 光模块 | Innolight / 中际旭创 | 上市 | 中国 | 海外云厂商、AI 数据中心 | 800G/1.6T 高速数通模块 | 客户认证、测试设备、上游器件 | 1.6T 出货占比和 BOM 自主程度 |
| 光模块 | Eoptolink / 新易盛 | 上市 | 中国 | 云厂商、设备商 | Gen2 1.6T OSFP/OSFP-RHS、LPO/LRO | 高端良率、海外认证 | Google/海外大客户订单稳定性 |
| 光模块/制造 | Jabil、Fabrinet、AOI | 上市 | 美国/泰国等 | 光模块品牌商、云厂商 | 1.6T OSFP、制造代工、数据中心模块 | 测试线和客户转产 | 量产订单是否持续 |
| 测试设备 | Keysight、Anritsu、Tektronix | 上市/私有混合 | 美国/日本 | 模块厂、芯片厂、云实验室 | 224G/1.6T 电光验证、BERT、DCA | 高端仪器供给和自动化软件 | 测试工站是否成为模块厂 capex 约束 |
| 被动光学/连接 | SENKO、US Conec、Corning、天孚通信、太辰光 | 混合 | 日本/美国/中国 | 模块厂、CPO、数据中心 | MPO/SN、FAU、光纤、透镜、隔离器 | 精密加工、洁净和一致性 | 高密度连接规格胜出路径 |

## 证据链与反证

| 命题 | 支持证据 | 反证/替代解释 | 置信度 | 下一步验证 |
|---|---|---|---|---|
| 1.6T 的技术基础是 200G/lane 电/光接口 | IEEE P802.3dj 是 200Gb/s、400Gb/s、800Gb/s、1.6Tb/s Ethernet Task Force，覆盖 200G/lane 相关 PHY/管理参数；见 [IEEE P802.3dj](https://www.ieee802.org/3/dj/) | 标准推进不等于所有客户同一时间采用，InfiniBand/私有互联可能先行 | 高 | 跟踪 IEEE 802.3dj 定稿、OIF CEI-224G 和客户私有规范 |
| 200G/lane DSP 已进入多供应商竞争 | Marvell 发布 Nova/Ara 1.6T PAM4 DSP，Ara 采用 3nm 并声称较前代降低模块功耗；Broadcom 发布 Sian2 200G/lane PAM4 DSP PHY；见 [Marvell Ara](https://www.marvell.com/company/newsroom/marvell-unveils-industrys-first-3nm-1-6tbps-pam4-interconnect-platform.html)、[Broadcom Sian2](https://investors.broadcom.com/news-releases/news-release-details/broadcom-delivers-industry-leading-200glane-dsp-gen-ai) | LPO/LRO 可能降低 DSP 使用量，DSP 供应并不一定是长期最紧环节 | 高 | 拆分各模块厂 1.6T BOM 和 DSP 供应商份额 |
| 1.6T 模块供应的隐性瓶颈可能在测试 | Keysight 2026-03-13 发布 224G 测试解决方案，明确指向 1.6T 电光验证和高量产测试挑战；见 [Keysight](https://www.keysight.com.cn/cn/zh/about/newsroom/news-releases/2026/0313-pr26-049-keysight-introduces-new-224g-test-solutions-to-enable-1-6t-optical-network-validation.html) | 测试设备厂会随需求扩产，模块厂也可通过并行测试缓解 | 中 | 观察模块厂测试 capex、交期和单位测试时间 |
| InP/EML/CW laser 是 1.6T 的关键二级约束 | Coherent 在 OFC 2026 宣布展示多种 1.6T 技术，包括 Silicon Photonics PIC、高功率 InP CW laser、200G InP EML 和 200G GaAs VCSEL；见 [Coherent OFC 2026](https://www.coherent.com/news/press-releases/coherent-demonstrates-next-gen-pluggable-transceiver-ofc-2026) | 不同 1.6T 路线可能采用不同光源，单一器件价值量可能被硅光/CPO 重新分配 | 中 | 验证各路线的激光器颗数、良率、老化产能和客户认证 |
| 800G+ 模块在 AI 数据中心的渗透率快速上升 | TrendForce 2026-02-10 预计 800G 及以上模块出货占比从 2024 年 19.5% 升至 2026 年超过 60%；2026-04-20 又称 AI 光模块市场 2026 年可达 260 亿美元，并指出组件短缺是扩产瓶颈；见 [TrendForce 2026-02](https://www.trendforce.com/presscenter/news/20260210-12919.html)、[TrendForce 2026-04](https://www.trendforce.com/presscenter/news/20260420-13017.html) | 行业研究预测可能高估需求，客户资本开支和网络架构会改变模块需求 | 中 | 用 hyperscaler capex、GPU/TPU 出货、模块厂订单交叉验证 |
| 1.6T 已从展示进入早期量产/订单验证 | Eoptolink 在 OFC 2025 发布 Gen2 1.6T OSFP/OSFP-RHS；AOI 2026-05 公布获得 hyperscale 客户 1.6T 数据中心收发器首个量产订单；见 [Eoptolink](https://www.eoptolink.com/news/361-eoptolink-launches-its-gen2-1-6t-osfp-and-osfp-rhs-transceiver-family-at-ofc-2025)、[AOI](https://investors.ao-inc.com/node/16751/pdf) | 首单或展示不代表行业普遍量产，客户认证可能分批推进 | 中 | 观察 2026-2027 年收入确认、交付量和客户扩单 |
| CPO 会影响 1.6T 可插拔窗口，但不会立刻替代全部模块 | NVIDIA 2025-03-18 发布 Spectrum-X/Quantum-X Photonics，并列出 Coherent、Corning、Fabrinet、Lumentum、SENKO 等硅光生态伙伴；见 [NVIDIA Newsroom](https://nvidianews.nvidia.com/news/nvidia-spectrum-x-co-packaged-optics-networking-switches-ai-factories/) | CPO 若部署快于预期，会压缩高端可插拔模块的生命周期 | 中 | 跟踪 NVIDIA photonics 交换机 2026 年交付与客户采用 |

## 结论分层

### 确定事实

- 1.6T Ethernet/光模块的行业标准与产品开发围绕 200G/lane/224G 级别电光接口推进，IEEE P802.3dj 是公开标准化锚点。
- Marvell、Broadcom、Semtech 等公司已公开发布或展示面向 1.6T/224G/200G/lane 的 DSP、PHY、TIA/driver 或线性光学芯片。
- Coherent、Eoptolink、Jabil、AOI 等公司已公开展示、发布或宣布 1.6T 光模块/相关技术，说明产业已从研发样品进入客户验证和早期量产阶段。
- Keysight 已发布面向 224G 和 1.6T 电光验证的测试方案，说明测试复杂度本身成为产业链明确关注点。

### 合理推断

- 2026-2028 年 1.6T 的供给弹性主要由“高良率模块 + 合格上游器件 + 测试吞吐 + 客户认证”共同决定，而不是由单一模块组装产能决定。
- InP EML、CW laser、硅光封装、FAU/连接器、224G 测试设备这些二三级环节可能比成品模块品牌更容易出现短期紧缺。
- LPO/LRO/XPO 会在部分短距场景挑战传统 DSP 模块，但短期更可能形成并行路线，而不是一次性替代。
- CPO/NPO 是 1.6T/3.2T 之后的中长期方向，但 1.6T 可插拔模块仍有一个由客户认证、可维护性和现有交换机生态支撑的窗口期。

### 待验证假设

- 1.6T 模块的单位测试时间可能显著高于 800G，导致测试工站成为比装配线更稀缺的产能。
- 中国模块厂在 1.6T 成品交付上具备竞争力，但其盈利质量取决于 DSP、InP laser、测试设备和高端被动光学的可控程度。
- Google/TPU、NVIDIA/InfiniBand/Ethernet、Meta/自研网络等不同客户架构会造成 1.6T 模块规格和供应商份额明显分化。
- 若 CPO 在 2026-2027 年超预期落地，1.6T 可插拔模块的需求峰值可能提前，价值转向光引擎、外置光源和高密度连接。

## 下一步研究清单

1. 拆 1.6T DR8/2xDR4 BOM: DSP、driver、TIA、laser/PIC、FAU、PCB、散热、连接器、测试时间和良率损耗。
2. 分路线比较 EML、硅光、VCSEL、LPO/LRO、CPO 在功耗、成本、良率和客户认证上的边界条件。
3. 对 Marvell、Broadcom、Semtech、Coherent、Lumentum、Innolight、Eoptolink、Jabil、AOI 做供应商证据包。
4. 建立测试设备清单: Keysight/Anritsu/Tektronix 的 224G BERT、DCA、FEC/BER、光谱、温循和自动耦合方案。
5. 跟踪 OFC/ECOC、IEEE P802.3dj、OIF CEI-224G、OSFP MSA 的标准进展和互通测试。
6. 从客户侧拆分 Google TPU/OCS、NVIDIA Spectrum-X/Quantum-X、Meta/以太网 AI 集群对 1.6T 的需求差异。
7. 验证模块厂 2026-2027 年真实收入确认: 样品、首单、小批量、量产、扩单分别对应不同确定性。

## 主要来源

- IEEE P802.3dj 200Gb/s, 400Gb/s, 800Gb/s, and 1.6Tb/s Ethernet Task Force: https://www.ieee802.org/3/dj/
- Marvell Ara 3nm 1.6T PAM4 DSP announcement: https://www.marvell.com/company/newsroom/marvell-unveils-industrys-first-3nm-1-6tbps-pam4-interconnect-platform.html
- Broadcom Sian2 200G/lane DSP PHY announcement: https://investors.broadcom.com/news-releases/news-release-details/broadcom-delivers-industry-leading-200glane-dsp-gen-ai
- Semtech 224Gbps IC family for linear optics: https://www.semtech.com/company/press/semtech-launches-224-gbps-ic-family-for-linear-optics-era
- Coherent OFC 2026 next-generation pluggable transceiver announcement: https://www.coherent.com/news/press-releases/coherent-demonstrates-next-gen-pluggable-transceiver-ofc-2026
- Keysight 224G test solutions for 1.6T optical network validation: https://www.keysight.com.cn/cn/zh/about/newsroom/news-releases/2026/0313-pr26-049-keysight-introduces-new-224g-test-solutions-to-enable-1-6t-optical-network-validation.html
- TrendForce 800G+ optical transceiver share forecast, 2026-02-10: https://www.trendforce.com/presscenter/news/20260210-12919.html
- TrendForce AI optical transceiver market and component shortage note, 2026-04-20: https://www.trendforce.com/presscenter/news/20260420-13017.html
- Eoptolink Gen2 1.6T OSFP/OSFP-RHS at OFC 2025: https://www.eoptolink.com/news/361-eoptolink-launches-its-gen2-1-6t-osfp-and-osfp-rhs-transceiver-family-at-ofc-2025
- NVIDIA Spectrum-X/Quantum-X Photonics announcement, 2025-03-18: https://nvidianews.nvidia.com/news/nvidia-spectrum-x-co-packaged-optics-networking-switches-ai-factories/
- AOI 1.6T data center transceiver volume order release: https://investors.ao-inc.com/node/16751/pdf

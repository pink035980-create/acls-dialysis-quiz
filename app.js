/**
 * ACLS 2025/2026 最新指引 × 血液透析與高血鉀急症互動複習與手寫測驗系統
 * 核心引擎：動態示波器心電圖、20題臨床模擬試卷、手寫畫布、Chart.js雷達圖、Gemini 視覺批改
 */

// -------------------------------------------------------------
// 1. DATA: 6 經典心電圖判讀口訣 (AHA 2025/2026 版)
// -------------------------------------------------------------
const MNEMONICS = [
  {
    id: "vf_pvt",
    title: "1. 心室纖維顫動 (VF) / 無脈搏心室頻脈 (pVT)",
    badge: "致命性去顫心律 (Shockable)",
    badgeClass: "badge-danger",
    quote: "「混亂無序無PQRS，即刻去顫電200J不猶豫！」",
    features: "VF：基線完全混亂無固定振幅與週期；pVT：寬大畸形 QRS 規則連續跑動（>150 bpm），且觸摸大動脈無脈搏。",
    actions: "立即非同步去顫電擊（雙相波 120-200J）➔ 立即重啟 CPR 2 分鐘 ➔ 建立 IV/IO ➔ 兩次電擊後給予 Epinephrine 1mg 每 3-5 分鐘一次 ➔ 三次電擊後給予 Amiodarone 300mg（第二劑 150mg）或 Lidocaine 1-1.5 mg/kg。",
    ecgType: "vf"
  },
  {
    id: "pea_asystole",
    title: "2. 無脈搏電活動 (PEA) / 心搏停止 (Asystole)",
    badge: "非去顫心律 (Non-Shockable)",
    badgeClass: "badge-warning",
    quote: "「有電無脈或一條線，高品質CPR加Epi，絕對不電擊查5H5T！」",
    features: "Asystole：雙導程確認平直線條；PEA：螢幕見到有組織之電氣信號（甚至看似竇性心律），但頸動脈完全摸不到脈搏。",
    actions: "絕對禁忌電擊！立即開始高品質 CPR ➔ 盡早給予 Epinephrine 1mg IV ➔ 積極排查可逆病因（5H5T，洗腎病患首重高血鉀與低血容量）。",
    ecgType: "asystole"
  },
  {
    id: "psvt",
    title: "3. 陣發性上心室頻脈 (PSVT)",
    badge: "窄QRS規則心搏過速",
    badgeClass: "badge-info",
    quote: "「窄QRS規則跑太快，迷走神經無效Adenosine六毫克快推沖水！」",
    features: "窄 QRS（<0.12s），節律極規則，心率 150–250 bpm，P 波常埋沒在 QRS 內或緊隨其後倒置。",
    actions: "穩定型：改良式 Valsalva 迷走神經刺激 ➔ 首選 Adenosine 6mg 快速靜脈推注（1-2秒內）並立即以 20ml NS 沖管抬高肢體 ➔ 無效第二劑 12mg ➔ 再無效轉 Diltiazem 或 Beta-blocker。\n不穩定型：立即同步心臟電擊（Synchronized Cardioversion 50-100J）。",
    ecgType: "psvt"
  },
  {
    id: "afib_afl",
    title: "4. 心房顫動 (Afib) / 心房撲動 (Afl)",
    badge: "2025新指引重點變革",
    badgeClass: "badge-primary",
    quote: "「心律不整無P波鋸齒撲，不穩定同步電擊2025新指引上調兩百焦耳！」",
    features: "Afib：RR 間期絕對不規則，P 波消失代以細碎顫動 f 波；Afl：規則或成比例傳導之鋸齒狀 F 波（典型心房率 300 bpm）。",
    actions: "【2025 AHA 關鍵變革】：不穩定型（低血壓、胸痛、休克）實施同步心臟電擊，初始能量正式上調至 200J！\n穩定型：Rate control（Diltiazem/Beta-blocker，透析病患防地高辛中毒）＋抗凝評估。",
    ecgType: "afib"
  },
  {
    id: "brady_avb",
    title: "5. 嚴重心搏過緩 / 高度房室傳導阻滯 (AV Block)",
    badge: "心搏過緩致命併發症",
    badgeClass: "badge-secondary",
    quote: "「心跳過慢五十四，三度房室各自走，Atropine無效外貼TCP或Dopamine滴注！」",
    features: "心率 < 50 bpm。二度二型（Mobitz II）PR 間期固定但偶見 QRS 脫落；三度（完全房室阻滯）P 波與 QRS 完全脫鉤，P-P 規則、R-R 規則各自跳動。",
    actions: "灌流不足低血壓時：首選 Atropine 1mg IV 每 3-5 分鐘一次（上限 3mg）。三度或二度二型反應差，立即備外貼心臟節律器（TCP）與 Dopamine (5-20 mcg/kg/min) 或 Epinephrine 輸注。透析病患先排除高血鉀！",
    ecgType: "avb3"
  },
  {
    id: "hyperkalemia",
    title: "6. 血液透析患者常見之高血鉀症 (Hyperkalemia)",
    badge: "透析急症核心必考",
    badgeClass: "badge-danger",
    quote: "「T波高尖如帳篷，寬QRS融Sine wave，心跳停止CPR第一位，鈣劑護心胰島素拉鉀進細胞！」",
    features: "隨血鉀上升演進：K 5.5-6.5 Peaked T（基底窄對稱高尖）➔ K 6.5-7.5 PR 延長、P 波扁平消失、QRS 寬大 ➔ K > 8.0 QRS 與 T 融合呈正弦波（Sine wave）➔ PEA/VF 猝死。",
    actions: "【2025 指引變革】：跳停下 CPR 高於一切！\n1. 心肌穩定：10% Calcium gluconate 10-30ml IV 2-5分鐘（護心不降鉀！）。\n2. 移入細胞：D50W 50ml + RI 10U IV，併用吸入性 Albuterol 10-20mg。\n3. 排除：緊急安排血液透析（Emergent HD）。",
    ecgType: "sine_wave"
  }
];

// -------------------------------------------------------------
// 2. DATA: 20 題透析與高血鉀急症全方位試卷
// -------------------------------------------------------------
const QUESTIONS = [
  {
    id: 1,
    type: "choice",
    category: "hyperkalemia",
    title: "1. 一位 68 歲血液透析患者，兩天未洗腎，主訴四肢對稱性無力與心悸。心電圖監視器顯示如下波形（高尖對稱 T 波）。生化檢驗血鉀為 6.8 mEq/L。請問此時第一時間最應立即給予的藥物為？",
    ecgType: "peaked_t",
    options: [
      { key: "A", text: "立即靜脈推注 10% Calcium gluconate 10-20 ml" },
      { key: "B", text: "立即快速滴注 50% Dextrose 50 ml + Regular Insulin 10U" },
      { key: "C", text: "立即口服降血鉀樹脂 Kalimate 1 包" },
      { key: "D", text: "立即給予 Sodium bicarbonate 7% 50 ml 靜脈滴注" }
    ],
    answer: "A",
    rationale: "【正確答案：A】高血鉀治療的第一優先是「穩定心肌細胞膜電位」，防止致命性心律不整。雖然鈣劑完全不能降低體內血鉀總量，但能在 1-3 分鐘內拮抗高鉀引起的心肌毒性，應首選 10% Calcium gluconate 或 Chloride。胰島素與排鉀樹脂皆在心肌穩定後接續給予。"
  },
  {
    id: 2,
    type: "choice",
    category: "hyperkalemia",
    title: "2. 承上題，關於在嚴重高血鉀心律不整時使用「10% Calcium gluconate」的藥理機轉與臨床觀念，下列敘述何者正確？",
    ecgType: null,
    options: [
      { key: "A", text: "它會將細胞外的鉀離子迅速驅入細胞內，使血清鉀在 5 分鐘內下降約 1.0 mEq/L" },
      { key: "B", text: "它能穩定心肌細胞膜閥電位（Threshold Potential），但完全不會改變血清中鉀離子的濃度" },
      { key: "C", text: "其藥效可持續 4 至 6 小時，因此單次給藥後便無需再安排緊急血液透析" },
      { key: "D", text: "血液透析患者嚴禁由周邊靜脈推注 Calcium gluconate，必須由頸靜脈導管快速加壓推注" }
    ],
    answer: "B",
    rationale: "【正確答案：B】Calcium gluconate 的作用機制是藉由升高心肌細胞膜的閥電位（threshold potential），恢復正常的興奮性梯度，因此是純粹的「細胞膜穩定劑（membrane stabilizer）」，它完全「不降低」血清鉀濃度。其保護作用通常僅維持 30-60 分鐘，必須儘速接續促轉移藥物與緊急透析。"
  },
  {
    id: 3,
    type: "choice",
    category: "hyperkalemia",
    title: "3. 針對嚴重高血鉀使用「葡萄糖加常規胰島素（D50W + RI）」促進鉀離子移入細胞內之處置，下列臨床實務何者最為精確？",
    ecgType: null,
    options: [
      { key: "A", text: "若病患當前隨機血糖值為 320 mg/dL，處方時仍必須並行靜脈注射 D50W 50ml，以免反跳性低血糖" },
      { key: "B", text: "標準劑量通常為 Regular Insulin 10U 搭配 50% 葡萄糖 (D50W) 50ml（或 D10W 250ml），約 15-30 分鐘起效" },
      { key: "C", text: "胰島素的作用能將血鉀永久排出體外，藥效結束後血鉀不會再次回彈" },
      { key: "D", text: "可直接使用皮下注射（SC）胰島素取代靜脈注射，兩者吸收起效時間無顯著差異" }
    ],
    answer: "B",
    rationale: "【正確答案：B】D50W 50ml + RI 10U 是臨床黃金標準，約在 15-30 分鐘起效，可使血鉀下降 0.5-1.0 mEq/L。注意：若病患血糖已經明顯偏高（如 > 250-300 mg/dL），可單獨給予 RI 而暫緩加推高張葡萄糖；皮下注射吸收太慢，急症時必須 IV。"
  },
  {
    id: 4,
    type: "choice",
    category: "hyperkalemia",
    title: "4. 在血液透析合併嚴重高血鉀的急救情境中，關於碳酸氫鈉（Sodium Bicarbonate, 小蘇打）的使用指引，下列何者正確？",
    ecgType: null,
    options: [
      { key: "A", text: "不論有無酸中毒，碳酸氫鈉皆是與鈣劑同等級的第一線促鉀轉移首選單一藥物" },
      { key: "B", text: "碳酸氫鈉僅建議在患者同時合併有嚴重代謝性酸中毒（如 pH < 7.15）時輔助給予，不應作為急性高血鉀的常規單獨降鉀藥" },
      { key: "C", text: "碳酸氫鈉可以與 Calcium gluconate 抽取在同一支空針內同時推注，以增進協同效應" },
      { key: "D", text: "注射碳酸氫鈉會顯著降低血液鈉離子濃度，對無尿患者有高度利尿效果" }
    ],
    answer: "B",
    rationale: "【正確答案：B】實證醫學顯示在無顯著代謝性酸中毒的病人身上，碳酸氫鈉的降鉀效果遲緩且不顯著，故僅建議在合併嚴重代酸時使用。特別注意：碳酸氫鈉絕對不可與鈣劑在同管路/同一空針混合，否則會產生碳酸鈣白色沉澱！"
  },
  {
    id: 5,
    type: "choice",
    category: "hyperkalemia",
    title: "5. 一名血液透析患者在急診心電圖監視器上突發以下波形（QRS 與 T 波融合，呈現平滑之正弦波 Sine Wave），隨後患者意識喪失，大動脈摸無脈搏。依據 2025 年最新指引，此時最關鍵的第一優先處置是？",
    ecgType: "sine_wave",
    options: [
      { key: "A", text: "立即暫停一切動作，花費 3 分鐘調配高劑量胰島素與碳酸氫鈉並尋找透析導管" },
      { key: "B", text: "立即開始高品質 CPR（按壓優先），不中斷壓胸，並同步指派同仁準備 Epinephrine 與 Calcium gluconate" },
      { key: "C", text: "判定為心室顫動（VF），立即進行同步 50J 電擊" },
      { key: "D", text: "立即進行雙側股靜脈穿刺置放暫時洗腎導管，送進洗腎室" }
    ],
    answer: "B",
    rationale: "【正確答案：B】Sine wave 融合波無脈搏即屬心跳停止（Cardiac Arrest，通常為 PEA 或 fine VF 前兆）。【2025 AHA 新指引重點強調】：跳停下高品質 CPR 高於一切！絕對不可因尋找特殊解毒劑或調配藥物而中斷胸外按壓。壓胸同時快速靜注鈣劑穩定心肌。"
  },
  {
    id: 6,
    type: "choice",
    category: "hyperkalemia",
    title: "6. 患者經積極 CPR 與給予 Calcium、Insulin 後成功復甦（ROSC），目前恢復自主心跳 72 bpm，但仍處於無尿狀態。關於復甦自主循環後防範「高血鉀反彈（Rebound Hyperkalemia）」的臨床處置，何者最為關鍵？",
    ecgType: null,
    options: [
      { key: "A", text: "ROSC 代表高血鉀已完全痊癒，送入一般病房每 12 小時抽血追蹤即可" },
      { key: "B", text: "胰島素促使鉀移入細胞的藥效通常在 2-4 小時後減退，若未及時啟動緊急血液透析排出體外，血鉀必然嚴重反彈猝死" },
      { key: "C", text: "立即大量靜脈輸注含有 20 mEq/L 氯化鉀之維持性輸液" },
      { key: "D", text: "給予高劑量 Loop 利尿劑（Lasix 500mg），無尿的洗腎病人亦能在 1 小時內排出大量尿鉀" }
    ],
    answer: "B",
    rationale: "【正確答案：B】急診使用的轉移劑（Insulin、Albuterol）只是把鉀「借移」進細胞內，完全沒有減少體內總鉀量。2-4 小時後藥效代謝，鉀離子會再次釋放回細胞外（Rebound）。無尿的洗腎病患利尿劑無效，唯一終極解法是把握 ROSC 後的黃金期緊急會診腎臟科進行血液透析。"
  },
  {
    id: 7,
    type: "choice",
    category: "afib_afl",
    title: "7. 【2025 AHA ACLS 新指引重大更新】一名洗腎病患於透析中突發心房顫動（Afib with RVR，心率 165 bpm），血壓驟降至 72/45 mmHg，主訴嚴重胸悶與冷汗。醫師決定實施同步心臟電擊（Synchronized Cardioversion），依據 2025 最新建議，初始電擊能量應設為多少？",
    ecgType: "afib",
    options: [
      { key: "A", text: "50 焦耳（J）" },
      { key: "B", text: "100 焦耳（J）" },
      { key: "C", text: "200 焦耳（J）" },
      { key: "D", text: "360 焦耳非同步電擊" }
    ],
    answer: "C",
    rationale: "【正確答案：C】2025/2026 AHA ACLS 指引針對「不穩定型心房顫動（Afib）與心房撲動（Afl）」提出關鍵更新：建議初始雙相波同步心臟電擊能量由傳統的 100J 直接「上調至 200J」。實證研究指出 200J 首次轉復成功率顯著高於低能量，能避免低能量反覆失敗對缺血心肌造成延遲與二次損傷。"
  },
  {
    id: 8,
    type: "choice",
    category: "dialysis_complications",
    title: "8. 血液透析治療進行至第 3 小時，患者突然劇烈呼吸困難、胸痛、發紺，聽診心臟聞及「機械磨輪音（Mill-wheel murmur）」，懷疑發生「急性空氣栓塞（Air Embolism）」。請問當下最正確的立即處置與病患擺位（Durant's Maneuver）為？",
    ecgType: null,
    options: [
      { key: "A", text: "右側躺、頭高腳低位（Fowler's position），加速氣泡往肺動脈排出" },
      { key: "B", text: "左側臥、頭低腳高位（Trendelenburg position），並夾閉管路暫停透析，給予 100% 高濃度純氧" },
      { key: "C", text: "平躺仰臥位，立即給予大量等張生理食鹽水 1000ml 全速加壓灌注" },
      { key: "D", text: "立即拔除動靜脈管路針頭，請患者用力閉氣咳嗽" }
    ],
    answer: "B",
    rationale: "【正確答案：B】空氣栓塞的經典搶救是 Durant's maneuver：採「左側臥（Left lateral decubitus）＋頭低腳高（Trendelenburg）」。機制是利用浮力使氣泡滯留在右心室尖端與右心房頂部，避免氣泡堵塞右心室流出道與肺動脈主幹。同時給予 100% 氧氣以利氮氣交換吸收。"
  },
  {
    id: 9,
    type: "choice",
    category: "dialysis_complications",
    title: "9. 透析病患拔除穿刺針後，其自體動靜脈瘻管（AVF）穿刺點突發大量噴射性出血，患者驚慌且血壓已降至 85/50 mmHg。請問下列何者是現場最關鍵且正確的止血處置？",
    ecgType: null,
    options: [
      { key: "A", text: "立即以止血帶（Tourniquet）死死捆紮瘻管上臂，直到完全摸不到瘻管雜音" },
      { key: "B", text: "以紗布於穿刺點及近心端進行兩點局部直接手指加壓（Direct Finger Pressure），維持輕微可觸摸之震顫（Thrill），避免過度緊繃引發瘻管血栓" },
      { key: "C", text: "立即在噴血處注射 1:1000 之 Epinephrine 局部血管收縮止血" },
      { key: "D", text: "立刻將穿刺側手臂置入冰水中急速冰敷" }
    ],
    answer: "B",
    rationale: "【正確答案：B】瘻管是透析患者的「生命線」。大出血時應使用手指定點直接加壓，力道以「能止住外露出血，但仍能隱約感受到血管震顫（Thrill）」為原則。嚴禁使用環狀止血帶強力死扎，否則會造成整條瘻管急性血栓栓塞而永久報廢。"
  },
  {
    id: 10,
    type: "choice",
    category: "dialysis_complications",
    title: "10. 一名長期未透析之尿毒症病患（初診 BUN 180 mg/dL），首次接受血液透析 2 小時後，突發劇烈頭痛、噁心、嘔吐、肌肉抽搐及意識混亂，無局部神經缺損。此最可能為「透析失衡症候群（DDS）」，其病理機轉與首要處置為？",
    ecgType: null,
    options: [
      { key: "A", text: "血液中尿素氮被過速清除，血腦屏障內滲透壓高於血液，水分移入腦組織造成急性腦水腫；應減慢血流速、必要時輸注 Mannitol 或高張食鹽水" },
      { key: "B", text: "透析液鈉離子過高引發急性高血鈉腦病變；應立刻全速輸注純蒸餾水" },
      { key: "C", text: "因透析中使用肝素導致急性硬腦膜下大出血；應立即推注維生素 K" },
      { key: "D", text: "此為常見疲勞反應，只需調快血流速加速洗完即可返家" }
    ],
    answer: "A",
    rationale: "【正確答案：A】透析失衡症候群（Dialysis Disequilibrium Syndrome, DDS）常見於極高 BUN 的初次透析病患。因腦組織尿素清除速度遠慢於血液，形成逆向滲透梯度導致腦水腫。預防勝於治療（初次透析血流速宜慢、時間宜短 <2小時）；發生時應降速或停止透析，並靜脈輸注高張溶液（甘露醇 Mannitol 或 3% 高張食鹽水）。"
  },
  {
    id: 11,
    type: "choice",
    category: "dialysis_complications",
    title: "11. 血液透析過程中，病患突然頻繁打哈欠、腹痛有便意感、冒冷汗，測量血壓由 140/85 mmHg 驟降至 78/46 mmHg（透析中低血壓 IDH）。下列第一線護理處置何者最為優先？",
    ecgType: null,
    options: [
      { key: "A", text: "立即將脫水率（Ultrafiltration, UF）調降為零，將病患床頭放平並抬高下肢，快速滴注 100-200ml 生理食鹽水" },
      { key: "B", text: "立即給予舌下含服硝化甘油片（NTG 0.6mg）擴張冠狀動脈" },
      { key: "C", text: "加速超濾脫水速度，以便早點洗完結束療程" },
      { key: "D", text: "將透析液溫度由 36°C 提升至 39°C 加速血液循環" }
    ],
    answer: "A",
    rationale: "【正確答案：A】打哈欠、便意感、冷汗是透析中低血壓（Intradialytic Hypotension）的黃金先兆。首要動作是停止脫水（UF rate = 0），抬高下肢增加回心血量，並小量快速輸注生理食鹽水 100-200ml。調降透析液溫度（低溫透析 35-35.5°C）能幫助血管收縮，提升血壓。"
  },
  {
    id: 12,
    type: "choice",
    category: "dialysis_complications",
    title: "12. 【透析飲食致命紅線】一名維持性血液透析病患，晚餐喝了半碗新鮮「楊桃湯」並吃了一顆楊桃，數小時後出現頑固性打嗝、肢體麻木，隨後在透析室發生連續性癲癇發作及意識昏迷。此現象之致病機轉為？",
    ecgType: null,
    options: [
      { key: "A", text: "楊桃富含高維生素 C，引發急性草酸鹽腎小管阻塞" },
      { key: "B", text: "楊桃含有強效神經毒素「Caramboxin」，腎功能衰竭者無法經尿液排泄，蓄積於腦部引發 GABA 抑制受體阻斷而致致命性腦病變" },
      { key: "C", text: "楊桃含糖量過高造成高滲透壓高血糖非酮症昏迷（HHS）" },
      { key: "D", text: "楊桃種子含有氰化物，造成急性組織缺氧" }
    ],
    answer: "B",
    rationale: "【正確答案：B】楊桃是透析病患的絕對致死禁忌！楊桃所含的 Caramboxin 是一種具神經毒性的氨基酸，健康人可由腎臟代謝排出，但尿毒症病患蓄積會引發打嗝、嘔吐、癲癇、昏迷甚至休克死亡。血液透析合併血液灌助（Hemoperfusion）是唯一可能救命的清除手段。"
  },
  {
    id: 13,
    type: "choice",
    category: "hyperkalemia",
    title: "13. 洗腎病患家屬因關心病患高血壓，特地將家中烹飪用鹽全部更換為市售「低鈉鹽」與「薄鹽醬油」，一週後病患被 119 送抵急診時已失去心跳。其最可能之致死原因為何？",
    ecgType: null,
    options: [
      { key: "A", text: "低鈉鹽缺少鈉離子造成急性嚴重低血鈉腦疝" },
      { key: "B", text: "市售低鈉鹽通常以「氯化鉀 (KCl)」大量取代氯化鈉，一湯匙即含有極高鉀量，洗腎患者無法排鉀導致突發致命高血鉀心室顫動" },
      { key: "C", text: "薄鹽醬油添加過量防腐劑造成急性肝衰竭" },
      { key: "D", text: "低鈉鹽引發重度代謝性鹼中毒" }
    ],
    answer: "B",
    rationale: "【正確答案：B】市售低鈉鹽、薄鹽醬油主要成分就是「氯化鉀（KCl）」，對於少尿或無尿的洗腎患者來說等同於「口服毒藥」。此為衛教極高頻發生的悲劇，必須嚴格告誡家屬不可食用低鈉鹽。"
  },
  {
    id: 14,
    type: "choice",
    category: "nephrology_care",
    title: "14. 關於透析病患常規使用之「磷結合劑（如碳酸鈣片 Calcium Carbonate、碳酸司維來姆 Sevelamer）」的服藥衛教，下列何者正確？",
    ecgType: null,
    options: [
      { key: "A", text: "必須在空腹時（如早晨起床或睡前）以 500ml 溫開水整顆吞服，以達到最佳吸收效果" },
      { key: "B", text: "必須在「隨餐咬碎（或嚼碎）」與食物充分混合，才能在腸道結合食物中的磷並隨糞便排出；若沒吃正餐則不需服用" },
      { key: "C", text: "若是吃高鉀水果（如香蕉、柑橘），才需要服用磷結合劑" },
      { key: "D", text: "碳酸鈣片長期空腹服用能顯著預防血管鈣化與高血磷" }
    ],
    answer: "B",
    rationale: "【正確答案：B】磷結合劑顧名思義是為了「在腸道抓住食物中的磷」。若空腹吃，不僅無法結合磷，碳酸鈣還會被大量吸收進血液造成高血鈣與血管硬化鈣化。因此必須嚴格教導病患「隨餐咬碎、一口飯一口藥，沒吃飯不吃藥」。"
  },
  {
    id: 15,
    type: "choice",
    category: "brady_avb",
    title: "15. 洗腎病友心電圖顯示心率 35 bpm，P 波與 QRS 完全脫節，各自規律跳動（三度房室傳導阻滯）。病患血壓 75/42 mmHg，給予 Atropine 1mg 兩劑後心率完全無改善。此時除了立即準備經皮心臟節律器（TCP）外，身為醫護人員必須同時警覺並排查的病因為何？",
    ecgType: "avb3",
    options: [
      { key: "A", text: "高血鉀引起的假性心肌傳導系統麻痺（Hyperkalemic AV block），應立即推注 Calcium gluconate 測試反應" },
      { key: "B", text: "急性大量失血引發之副交感神經亢進" },
      { key: "C", text: "嚴重低血糖反應，應立即給予 Glucagon 肌肉注射" },
      { key: "D", text: "立即給予高劑量 Adenosine 12mg 進行轉復" }
    ],
    answer: "A",
    rationale: "【正確答案：A】高血鉀會抑制房室結與希氏束的傳導，臨床上常表現為「假性高度房室阻滯（Pseudo-AV block）」，對 Atropine 通常無反應。遇到透析病患嚴重心搏過緩，除了 TCP 節律器，務必立即給予 Calcium gluconate 診斷性治療兼急救。"
  },
  {
    id: 16,
    type: "choice",
    category: "psvt",
    title: "16. 血液透析患者在診間突發胸悶，心電圖呈現規則窄 QRS 心搏過速（心率 195 bpm），血壓 115/70 mmHg，意識清醒。迷走神經刺激（Modified Valsalva）無效後，醫師處方 Adenosine。請問下列給藥技術與衛教何者正確？",
    ecgType: "psvt",
    options: [
      { key: "A", text: "Adenosine 6mg 需加入 100ml D5W 中緩慢滴注 15 分鐘" },
      { key: "B", text: "由接近心臟的靜脈通路（或周邊大靜脈）以 1-2 秒內極快速推注 Adenosine 6mg，並緊接著以 20ml 生理食鹽水加壓沖管並抬高肢體" },
      { key: "C", text: "給藥前告知病患本藥物絕無任何不適感，如同打生理食鹽水" },
      { key: "D", text: "若第一劑 6mg 無效，第二劑應減量為 3mg" }
    ],
    answer: "B",
    rationale: "【正確答案：B】Adenosine 在體內半衰期極短（< 10秒），若推太慢在周邊血液就被代謝殆盡，故必須以「極速推注＋20ml NS 大力沖水抬高肢體」。給藥前應同理告知病患可能會有短暫數秒的胸悶、瀕死感或心跳暫停感。"
  },
  {
    id: 17,
    type: "choice",
    category: "vf_pvt",
    title: "17. 透析病患在心電圖監視器上突發以下多型性心室頻脈（Polymorphic VT / Torsades de Pointes），QRS 波尖端圍繞基線呈現扭轉特徵。患者動脈仍有微弱搏動。此時首選的靜脈藥物為？",
    ecgType: "torsades",
    options: [
      { key: "A", text: "硫酸鎂（Magnesium Sulfate）1 至 2 公克稀釋後靜脈輸注" },
      { key: "B", text: "立即推注 Digoxin 0.5mg" },
      { key: "C", text: "給予高劑量 Amiodarone 600mg 快速推注" },
      { key: "D", text: "給予 Verapamil 5mg 靜脈注射" }
    ],
    answer: "A",
    rationale: "【正確答案：A】扭轉型室速（Torsades de Pointes）多伴隨 QT 間期延長，首選藥物為硫酸鎂（Magnesium sulfate 1-2g IV）。Amiodarone 會進一步延長 QT 間期，在此情況下為相對禁忌！若病患轉為無脈搏或血壓崩塌，則立即實施非同步電擊。"
  },
  {
    id: 18,
    type: "choice",
    category: "hyperkalemia",
    title: "18. 【臨床急症決策題 1｜高血鉀致命正弦波之急救處置順序】\n一位維持性血液透析患者在等待洗腎時突發胸悶昏厥，心電圖呈現如下典型「正弦波（Sine Wave）」，病患面臨跳停猝死。醫護團隊展開搶救，下列各項急救措施哪些正確？\n① 立即靜脈推注 10% Calcium gluconate 10-20ml（2-5分鐘慢推），以拮抗高鉀之心肌膜電位毒性\n② 給予 50% Dextrose (D50W) 50ml 加上 Regular Insulin (RI) 10U 靜脈推注，促進鉀離子移入細胞內\n③ 若病患動脈血氣分析（ABG）合併嚴重代謝性酸中毒，可考慮給予 Sodium bicarbonate 7% 50ml 靜脈輸注\n④ 因正弦波外觀寬大連續，應立即實施 200J 同步心臟電擊（Synchronized Cardioversion）以求轉復\n⑤ 立即聯繫腎臟科與透析室團隊，備妥管路安排緊急血液透析（Emergent HD）以根本排除體內蓄積之鉀離子",
    ecgType: "sine_wave",
    options: [
      { key: "A", text: "①②③" },
      { key: "B", text: "①②⑤" },
      { key: "C", text: "①②③⑤" },
      { key: "D", text: "①②③④⑤" }
    ],
    answer: "C",
    rationale: "【正確答案：C (①②③⑤)】\n解析：\n① 正確：10% Calcium gluconate 是高血鉀急救第一首選（心肌穩定劑，保護心肌不降鉀，1-3分鐘起效）。\n② 正確：胰島素促使鉀離子移入細胞內（15-30分鐘起效），併用高濃度葡萄糖防低血糖。\n③ 正確：重度代謝性酸中毒（pH < 7.15）時，重碳酸鈉可提升細胞外 pH 並輔助排鉀入細胞。\n④ 錯誤：正弦波（Sine Wave）是極嚴重高血鉀（K+ > 8.0 mEq/L）引發的心室內傳導嚴重阻滯融合波，並非室速電擊適應症；盲目電擊無法糾正電解質膜電位異常，且可能加速跳停，高血鉀跳停時 CPR 與給鈣高於一切！\n⑤ 正確：血液透析是永久排除體內過量鉀離子之根本決定性手段。"
  },
  {
    id: 19,
    type: "choice",
    category: "dialysis_complications",
    title: "19. 【臨床急症決策題 2｜血液透析空氣栓塞緊急處置與 Durant 擺位】\n血液透析進行中病患突發急性呼吸困難、胸骨後疼痛、劇烈咳嗽、發紺與意識混亂，聽診心臟聞及典型「水輪音（Water-wheel murmur / Mill-wheel murmur）」，高度懷疑發生急性空氣栓塞。下列急救處置措施哪些正確？\n① 立即夾閉（Clamp）透析管路之動靜脈端，並立即關閉透析機血泵（Blood pump）\n② 立即給予 100% 高濃度純氧，以加速血液中氣泡氮氣之置換與吸收\n③ 立即將病患置於「右側臥位（Right lateral decubitus）」＋「頭高腳低位」\n④ 實施 Durant 擺位利用空氣浮力特性，將氣泡鎖在右心室尖端與右心房頂部，防止氣泡直接阻塞肺動脈流出道\n⑤ 若有留置中心靜脈導管（CVC），必要時可嘗試使用空針將右心房/右心室內之積聚空氣抽出減壓",
    ecgType: null,
    options: [
      { key: "A", text: "①②④" },
      { key: "B", text: "①③④" },
      { key: "C", text: "①②④⑤" },
      { key: "D", text: "①②③④⑤" }
    ],
    answer: "C",
    rationale: "【正確答案：C (①②④⑤)】\n解析：\n① 正確：立即夾管、關閉血泵切斷氣體來源是第一優先現場動作！\n② 正確：100% 高濃度純氧可建立血液中氮氣濃度梯度，加速空氣泡中氮氣吸收。\n③ 錯誤！Durant 擺位的正確姿勢為「左側臥位（Left lateral decubitus）」＋「頭低腳高位（Trendelenburg position）」，絕非右側臥或頭高腳低！\n④ 正確：Durant 擺位之生理機制在於空氣密度小於血液，左側臥頭低位可使氣泡上浮聚集於右心室心尖部與心房頂端，避免氣泡直接嵌塞在肺動脈瓣與肺動脈主幹流出道，防止急性肺動脈高壓與心因性休克猝死。\n⑤ 正確：經中心靜脈導管抽氣是有效之後續減壓急救技巧。"
  },
  {
    id: 20,
    type: "choice",
    category: "dialysis_complications",
    title: "20. 【臨床急症決策題 3｜動靜脈瘻管穿刺孔噴射性大出血急救與血管保全】\n透析拔針後病患自體動靜脈瘻管（AV Fistula）穿刺孔突發噴射性大出血，現場護理師與急救團隊迅速應對。關於現場止血手法、瘻管保全與防範休克措施，下列哪些正確？\n① 立即以無菌紗布在出血穿刺孔處進行「手指直接定點加壓（Direct finger pressure）」，加壓時間至少 15–20 分鐘\n② 為求最快速度止血，應立即使用彈性止血帶或止血鉗於瘻管近心端進行強力環狀勒緊結紮\n③ 加壓止血之力量應以「能止住外露血液，但近心端仍可觸及微弱血管震顫（Thrill）或聽診器聽見血流雜音（Bruit）」為原則\n④ 病患若出現血壓驟降（BP < 90/60 mmHg）或頭暈冷汗等休克徵象，應立即將其平躺、抬高下肢，並快速靜脈輸注等張生理食鹽水\n⑤ 若定點加壓超過 30 分鐘仍無法止血，或懷疑假性動脈瘤破裂，應立即聯繫心臟血管外科或介入放射科進行緊急處置",
    ecgType: null,
    options: [
      { key: "A", text: "①②③" },
      { key: "B", text: "①③④" },
      { key: "C", text: "①③④⑤" },
      { key: "D", text: "①②③④⑤" }
    ],
    answer: "C",
    rationale: "【正確答案：C (①③④⑤)】\n解析：\n① 正確：穿刺孔大出血首選「手指直接定點加壓（Direct pressure）」，切勿大面積胡亂包紮。\n② 錯誤！絕對嚴禁用環狀止血帶強力死扎！此舉會導致整條動靜脈瘻管內血流完全停滯，在數分鐘內引發急性血栓形成而使病患唯一的「生命線」永久報廢！\n③ 正確：血管保全黃金原則：加壓力量必須保留微弱 Thrill/Bruit，既止血又保全通暢度。\n④ 正確：失血性休克低血壓會惡化瘻管灌注並危及生命，需平躺抬腿並快速補充等張晶體溶液。\n⑤ 正確：難治性出血或假性動脈瘤破裂必須儘早外科或放射介入處理。"
  }
];

// -------------------------------------------------------------
// 3. APPLICATION STATE & INITIALIZATION
// -------------------------------------------------------------
let currentView = "mnemonics-view";
let studentInfo = { name: "", id: "" };
let userAnswers = {}; // { qId: answerKey or dataUrl }
let handwriteCanvases = {}; // { qId: { canvas, ctx, isDrawing, ... } }
let examTimerInterval = null;
let timerSeconds = 45 * 60; // 45 minutes
let radarChartInstance = null;

// Submission storage (Simulated / Supabase / LocalStorage)
let submissions = JSON.parse(localStorage.getItem("acls_quiz_submissions") || "[]");

document.addEventListener("DOMContentLoaded", () => {
  renderMnemonics();
  renderQuestions();
  initOscilloscopes();
  loadSavedApiKey();
  updateTeacherSubmissionsTable();
  updateShareLink();
});

// View switching
function switchView(viewId) {
  document.querySelectorAll(".view-panel").forEach(p => p.classList.remove("active"));
  document.querySelectorAll(".nav-btn").forEach(b => b.classList.remove("active"));

  const targetPanel = document.getElementById(viewId);
  if (targetPanel) targetPanel.classList.add("active");

  const btnIndex = viewId === "mnemonics-view" ? 0 : (viewId === "quiz-view" ? 1 : 2);
  const navBtns = document.querySelectorAll(".nav-btn");
  if (navBtns[btnIndex]) navBtns[btnIndex].classList.add("active");

  currentView = viewId;
  if (viewId === "teacher-view") {
    updateTeacherSubmissionsTable();
  }
}

// -------------------------------------------------------------
// 4. MNEMONICS RENDERER & ECG ENGINE
// -------------------------------------------------------------
function renderMnemonics() {
  const container = document.getElementById("mnemonics-container");
  if (!container) return;

  container.innerHTML = MNEMONICS.map(m => `
    <div class="mnemonic-card">
      <div class="mnemonic-header">
        <h3>${m.title}</h3>
        <span class="mnemonic-badge ${m.badgeClass}">${m.badge}</span>
      </div>
      <div class="oscilloscope-screen">
        <canvas id="ecg-m-${m.id}" class="ecg-canvas"></canvas>
      </div>
      <div class="mnemonic-body">
        <div class="mnemonic-quote">${m.quote}</div>
        <div class="feature-box">
          <strong>🔍 判讀關鍵特徵：</strong>
          <p>${m.features}</p>
        </div>
        <div class="action-box">
          <strong>⚡ 第一線急救處置（2025新指引）：</strong>
          <p>${m.actions.replace(/\n/g, "<br>")}</p>
        </div>
      </div>
    </div>
  `).join("");
}

// -------------------------------------------------------------
// 5. DYNAMIC OSCILLOSCOPE ECG ENGINE (Canvas)
// -------------------------------------------------------------
const activeOscilloscopes = [];

function initOscilloscopes() {
  // Init mnemonics ECGs
  MNEMONICS.forEach(m => {
    const canvas = document.getElementById(`ecg-m-${m.id}`);
    if (canvas) {
      activeOscilloscopes.push(createOscilloscope(canvas, m.ecgType));
    }
  });

  // Start continuous rendering loop
  requestAnimationFrame(renderOscilloscopesLoop);
}

function createOscilloscope(canvas, ecgType) {
  const ctx = canvas.getContext("2d");
  const width = (canvas.width = canvas.parentElement ? (canvas.parentElement.clientWidth || 360) : 360);
  const height = (canvas.height = canvas.parentElement ? (canvas.parentElement.clientHeight || 140) : 140);

  window.addEventListener("resize", () => {
    if (canvas.parentElement) {
      canvas.width = canvas.parentElement.clientWidth || 360;
      canvas.height = canvas.parentElement.clientHeight || 140;
    }
  });

  return {
    canvas,
    ctx,
    ecgType,
    offset: 0,
    speed: 1.8
  };
}

function renderOscilloscopesLoop() {
  activeOscilloscopes.forEach(osc => {
    drawOscilloscopeFrame(osc);
  });
  requestAnimationFrame(renderOscilloscopesLoop);
}

function drawOscilloscopeFrame(osc) {
  const { ctx, canvas, ecgType } = osc;

  // Skip rendering if canvas is hidden in DOM
  if (!canvas.offsetParent && canvas.clientWidth === 0) {
    return;
  }

  // Dynamically update dimensions if container changed size
  const parentW = canvas.parentElement ? (canvas.parentElement.clientWidth || 360) : 360;
  const parentH = canvas.parentElement ? (canvas.parentElement.clientHeight || 140) : 140;
  if (canvas.width !== parentW || canvas.height !== parentH) {
    canvas.width = parentW;
    canvas.height = parentH;
  }

  const width = canvas.width;
  const height = canvas.height;
  const midY = height / 2;

  // 1. Clear monitor background
  ctx.fillStyle = "#0a0e17";
  ctx.fillRect(0, 0, width, height);

  // 2. Draw permanent crisp medical red grid
  drawMedicalGrid(ctx, width, height);

  // 3. Advance scroll offset
  osc.offset = (osc.offset || 0) + (osc.speed || 1.8);

  // 4. Draw continuous rolling waveform across entire width (0 to width)
  ctx.save();
  ctx.strokeStyle = "#00ff66";
  ctx.shadowColor = "#00ff88";
  ctx.shadowBlur = 5;
  ctx.lineWidth = 2.2;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  ctx.beginPath();
  const step = 2; // 2px steps for high-performance 60fps rendering
  for (let x = 0; x <= width; x += step) {
    const xVirtual = x + osc.offset;
    const y = getECGWaveSample(ecgType, xVirtual, midY, height);
    if (x === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  }
  ctx.stroke();

  // Subtle leading pulse dot at the right edge
  const rightY = getECGWaveSample(ecgType, width + osc.offset, midY, height);
  ctx.fillStyle = "#ffffff";
  ctx.shadowColor = "#00ffcc";
  ctx.shadowBlur = 8;
  ctx.beginPath();
  ctx.arc(width - 2, rightY, 2.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawMedicalGrid(ctx, width, height) {
  ctx.save();
  // Minor grid 1mm (10px)
  ctx.strokeStyle = "rgba(239, 68, 68, 0.18)";
  ctx.lineWidth = 0.5;
  for (let x = 0; x <= width; x += 10) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  for (let y = 0; y <= height; y += 10) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  // Major grid 5mm (50px)
  ctx.strokeStyle = "rgba(239, 68, 68, 0.40)";
  ctx.lineWidth = 1.0;
  for (let x = 0; x <= width; x += 50) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  for (let y = 0; y <= height; y += 50) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  // Monitor Lead & Calibration text in top-left
  ctx.fillStyle = "rgba(0, 255, 102, 0.75)";
  ctx.font = "bold 10px monospace";
  ctx.fillText("LEAD II  25mm/s  10mm/mV", 8, 15);

  ctx.restore();
}

function getECGWaveSample(type, xPos, midY, height) {
  const scale = height * 0.40;

  switch (type) {
    case "vf": {
      // Ventricular Fibrillation: Coarse chaotic undulations, no P-QRS-T
      const v = Math.sin(xPos * 0.053) * 0.42 +
                Math.sin(xPos * 0.091) * 0.32 +
                Math.sin(xPos * 0.163) * 0.20 +
                Math.cos(xPos * 0.241) * 0.12;
      return midY - v * scale;
    }

    case "asystole": {
      // Cardiac Arrest Flatline with subtle biological wandering
      const drift = Math.sin(xPos * 0.012) * 1.5 + Math.sin(xPos * 0.035) * 0.8;
      return midY + drift;
    }

    case "psvt": {
      // Paroxysmal Supraventricular Tachycardia (PSVT / AVNRT):
      // Heart rate ~200-220 bpm -> Extremely rapid & regular, narrow QRS (<0.08s)
      // P wave is buried in QRS (or pseudo-S), immediately followed by upright T wave with minimal diastole
      const period = 68; // 68px = ~220 bpm at 25mm/s standard telemetry
      const dx = ((xPos % period) + period) % period;
      
      // Small Q dip
      const q = -0.06 * Math.exp(-Math.pow((dx - 12) / 1.8, 2));
      // Sharp, tall, narrow R spike (<80ms)
      const r = 0.95 * Math.exp(-Math.pow((dx - 15) / 2.2, 2));
      // Crisp narrow S wave dip
      const s = -0.18 * Math.exp(-Math.pow((dx - 18.5) / 2.0, 2));
      // Upright T wave immediately following QRS without prolonged isoelectric delay
      const t = 0.26 * Math.exp(-Math.pow((dx - 38) / 8.5, 2));
      
      return midY - (q + r + s + t) * scale;
    }

    case "afib": {
      // Atrial Fibrillation: Irregularly irregular RR intervals, fine f-waves, no P wave
      // Cycle of varied RR intervals: 105, 155, 90, 135, 175, 120 (total sum = 780px)
      const rPeaks = [45, 150, 305, 395, 530, 705];
      const cycleLen = 780;
      const posInCycle = ((xPos % cycleLen) + cycleLen) % cycleLen;

      let qrsT = 0;
      for (let i = 0; i < rPeaks.length; i++) {
        const d = posInCycle - rPeaks[i];
        if (Math.abs(d) < 55) {
          // Q dip
          qrsT -= 0.08 * Math.exp(-Math.pow((d + 5) / 2.2, 2));
          // Sharp R spike
          qrsT += 0.88 * Math.exp(-Math.pow(d / 2.8, 2));
          // S dip
          qrsT -= 0.22 * Math.exp(-Math.pow((d - 6) / 2.6, 2));
          // T wave ~32px after R
          qrsT += 0.22 * Math.exp(-Math.pow((d - 32) / 11.0, 2));
        }
      }
      // Fine fibrillatory baseline (f waves)
      const fWave = (Math.sin(xPos * 0.35) * 0.06 + Math.cos(xPos * 0.62) * 0.04) * scale;
      return midY - qrsT * scale + fWave;
    }

    case "avb3": {
      // 3rd Degree Complete AV Block:
      // Independent P waves (period 130px, ~80 bpm) dissociated from slow wide QRS escape (period 360px, ~30 bpm)
      const pPeriod = 130;
      const qrsPeriod = 360;
      
      const dxP = ((xPos % pPeriod) + pPeriod) % pPeriod;
      const pWave = 0.20 * Math.exp(-Math.pow((dxP - 65) / 7.0, 2));

      const dxQRS = ((xPos % qrsPeriod) + qrsPeriod) % qrsPeriod;
      const dQ = dxQRS - 180;
      let qrsWave = 0;
      if (Math.abs(dQ) < 90) {
        // Wide notched QRS
        qrsWave += 0.75 * Math.exp(-Math.pow(dQ / 7.5, 2));
        qrsWave -= 0.35 * Math.exp(-Math.pow((dQ - 14) / 8.5, 2));
        // Inverted wide T wave
        qrsWave -= 0.30 * Math.exp(-Math.pow((dQ - 48) / 18.0, 2));
      }
      return midY - (pWave + qrsWave) * scale;
    }

    case "peaked_t": {
      // Hyperkalemia: Tall, tented, narrow-based symmetric T wave
      const period = 180;
      const dx = ((xPos % period) + period) % period;
      let y = 0;
      // Flattened P wave at dx = 25
      y += 0.10 * Math.exp(-Math.pow((dx - 25) / 7.0, 2));
      // Q dip at dx = 58
      y -= 0.08 * Math.exp(-Math.pow((dx - 58) / 2.5, 2));
      // R spike at dx = 65
      y += 0.88 * Math.exp(-Math.pow((dx - 65) / 3.5, 2));
      // S dip at dx = 72
      y -= 0.22 * Math.exp(-Math.pow((dx - 72) / 3.0, 2));
      // TALL TENTED T WAVE at dx = 118 (narrow base sigma=7.5, height=0.88 equal to R wave!)
      y += 0.88 * Math.exp(-Math.pow((dx - 118) / 7.5, 2));
      return midY - y * scale;
    }

    case "sine_wave": {
      // Lethal Hyperkalemia Sine Wave: Smooth sinusoidal pattern, QRS and T merged
      const period = 140;
      const v = Math.sin(xPos * (Math.PI * 2 / period)) * 0.82;
      return midY - v * scale;
    }

    case "torsades": {
      // Polymorphic VT / Torsades de Pointes: Waxing & waning sinusoidal amplitude
      const envelope = Math.sin(xPos * (Math.PI * 2 / 380));
      const fastVT = Math.sin(xPos * (Math.PI * 2 / 46));
      return midY - fastVT * envelope * scale * 0.85;
    }

    default: {
      // Normal Sinus Rhythm: Standard P-QRS-T complex, rate ~75 bpm
      const period = 180;
      const dx = ((xPos % period) + period) % period;
      let y = 0;
      // P wave at dx = 28
      y += 0.16 * Math.exp(-Math.pow((dx - 28) / 6.5, 2));
      // Q dip at dx = 58
      y -= 0.08 * Math.exp(-Math.pow((dx - 58) / 2.5, 2));
      // R spike at dx = 65
      y += 0.92 * Math.exp(-Math.pow((dx - 65) / 3.5, 2));
      // S dip at dx = 72
      y -= 0.22 * Math.exp(-Math.pow((dx - 72) / 3.0, 2));
      // Normal rounded T wave at dx = 115
      y += 0.28 * Math.exp(-Math.pow((dx - 115) / 15.0, 2));
      return midY - y * scale;
    }
  }
}

// -------------------------------------------------------------
// 6. QUIZ RENDERER & INTERACTION
// -------------------------------------------------------------
function startExam() {
  const name = document.getElementById("student-name").value.trim();
  const id = document.getElementById("student-id").value.trim();

  if (!name || !id) {
    alert("請務必填寫同仁姓名與員工編號/單位，以便成績記錄！");
    return;
  }

  studentInfo = { name, id };
  document.getElementById("student-entry-card").style.display = "none";
  document.getElementById("quiz-content").style.display = "block";
  document.getElementById("exam-timer").style.display = "flex";

  startTimer();
  window.scrollTo({ top: 0, behavior: "smooth" });

  // Init canvases for question ECGs and handwriting
  setTimeout(() => {
    initQuestionECGs();
    initHandwritingCanvases();
  }, 100);
}

function renderQuestions() {
  const container = document.getElementById("questions-list");
  if (!container) return;

  container.innerHTML = QUESTIONS.map((q, idx) => {
    let innerContent = "";

    if (q.type === "choice") {
      innerContent = `
        <div class="options-list">
          ${q.options.map(opt => `
            <label class="option-item" onclick="selectChoice(${q.id}, '${opt.key}')">
              <input type="radio" name="q_${q.id}" value="${opt.key}">
              <span class="option-text"><strong>${opt.key}.</strong> ${opt.text}</span>
            </label>
          `).join("")}
        </div>
      `;
    } else if (q.type === "handwrite") {
      innerContent = `
        <div class="handwrite-container">
          <div class="canvas-toolbar">
            <span class="canvas-hint">${q.handwritePrompt}</span>
            <div>
              <button type="button" class="btn btn-secondary btn-sm" onclick="clearCanvas(${q.id})">🧹 清除畫布</button>
            </div>
          </div>
          <div class="canvas-wrapper">
            <canvas id="hw-canvas-${q.id}" class="drawing-canvas"></canvas>
          </div>
          <div class="upload-fallback">
            <span>📷 或直接上傳手寫/筆記照片：</span>
            <input type="file" accept="image/*" onchange="handleImageUpload(${q.id}, this)">
          </div>
        </div>
      `;
    }

    return `
      <div class="question-card" id="q-card-${q.id}">
        <div class="question-header">
          <span class="q-badge">
            ${q.id >= 18 ? '🧩 臨床急症複選組合題 (5分)' : '單選題 (5分)'} [${q.category.toUpperCase()}]
          </span>
          <span class="q-number">第 ${idx + 1} / 20 題</span>
        </div>
        <div class="q-title">${q.title}</div>
        ${q.ecgType ? `
          <div class="q-ecg-box oscilloscope-screen">
            <canvas id="q-ecg-${q.id}" class="ecg-canvas"></canvas>
          </div>
        ` : ''}
        ${innerContent}
      </div>
    `;
  }).join("");
}

function initQuestionECGs() {
  QUESTIONS.forEach(q => {
    if (q.ecgType) {
      const canvas = document.getElementById(`q-ecg-${q.id}`);
      if (canvas) {
        activeOscilloscopes.push(createOscilloscope(canvas, q.ecgType));
      }
    }
  });
}

function selectChoice(qId, key) {
  userAnswers[qId] = key;
  updateProgressText();
}

function updateProgressText() {
  const answeredCount = Object.keys(userAnswers).length;
  document.getElementById("quiz-progress-text").innerText = `作答進度：${answeredCount} / 20 題`;
}

// -------------------------------------------------------------
// 7. HANDWRITING CANVAS ENGINE
// -------------------------------------------------------------
function initHandwritingCanvases() {
  QUESTIONS.filter(q => q.type === "handwrite").forEach(q => {
    const canvas = document.getElementById(`hw-canvas-${q.id}`);
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    canvas.width = canvas.parentElement.clientWidth || 500;
    canvas.height = 220;

    // Draw lined notebook background
    drawCanvasLinedBackground(ctx, canvas.width, canvas.height);

    let isDrawing = false;
    let lastX = 0;
    let lastY = 0;

    function getCoords(e) {
      const rect = canvas.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      return [clientX - rect.left, clientY - rect.top];
    }

    function startDraw(e) {
      isDrawing = true;
      [lastX, lastY] = getCoords(e);
      e.preventDefault();
    }

    function draw(e) {
      if (!isDrawing) return;
      const [x, y] = getCoords(e);
      ctx.strokeStyle = "#1e3a8a"; // medical blue pen
      ctx.lineWidth = 2.5;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      ctx.beginPath();
      ctx.moveTo(lastX, lastY);
      ctx.lineTo(x, y);
      ctx.stroke();

      [lastX, lastY] = [x, y];
      e.preventDefault();
    }

    function stopDraw() {
      if (isDrawing) {
        isDrawing = false;
        userAnswers[q.id] = canvas.toDataURL("image/png");
        updateProgressText();
      }
    }

    canvas.addEventListener("mousedown", startDraw);
    canvas.addEventListener("mousemove", draw);
    canvas.addEventListener("mouseup", stopDraw);
    canvas.addEventListener("mouseleave", stopDraw);

    canvas.addEventListener("touchstart", startDraw, { passive: false });
    canvas.addEventListener("touchmove", draw, { passive: false });
    canvas.addEventListener("touchend", stopDraw);

    handwriteCanvases[q.id] = { canvas, ctx };
  });
}

function drawCanvasLinedBackground(ctx, width, height) {
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = "#e2e8f0";
  ctx.lineWidth = 1;
  for (let y = 35; y < height; y += 35) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
}

function clearCanvas(qId) {
  const hw = handwriteCanvases[qId];
  if (hw) {
    drawCanvasLinedBackground(hw.ctx, hw.canvas.width, hw.canvas.height);
    delete userAnswers[qId];
    updateProgressText();
  }
}

function handleImageUpload(qId, input) {
  if (input.files && input.files[0]) {
    const reader = new FileReader();
    reader.onload = function (e) {
      userAnswers[qId] = e.target.result;
      // Draw image onto canvas preview
      const hw = handwriteCanvases[qId];
      if (hw) {
        const img = new Image();
        img.onload = () => {
          hw.ctx.drawImage(img, 0, 0, hw.canvas.width, hw.canvas.height);
        };
        img.src = e.target.result;
      }
      updateProgressText();
    };
    reader.readAsDataURL(input.files[0]);
  }
}

// -------------------------------------------------------------
// 8. TIMER ENGINE (45 Mins with Warnings)
// -------------------------------------------------------------
function startTimer() {
  const display = document.getElementById("timer-text");
  const box = document.getElementById("exam-timer");

  examTimerInterval = setInterval(() => {
    timerSeconds--;

    const m = Math.floor(timerSeconds / 60);
    const s = timerSeconds % 60;
    display.innerText = `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;

    // 5 minutes warning
    if (timerSeconds <= 300 && timerSeconds > 60) {
      box.classList.add("timer-warning");
    } else if (timerSeconds <= 60) {
      box.classList.remove("timer-warning");
      box.classList.add("timer-danger");
    }

    if (timerSeconds <= 0) {
      clearInterval(examTimerInterval);
      alert("⏱️ 45 分鐘考試時間已到！系統將自動為您提交試卷。");
      submitQuiz();
    }
  }, 1000);
}

// -------------------------------------------------------------
// 9. SUBMIT & SCORING & RADAR CHART
// -------------------------------------------------------------
function confirmSubmitQuiz() {
  const total = QUESTIONS.length;
  const answered = Object.keys(userAnswers).length;

  if (answered < total) {
    if (!confirm(`您尚有 ${total - answered} 題未作答，確定要現在交卷嗎？`)) {
      return;
    }
  } else {
    if (!confirm("確定要繳交本次試卷並生成成績分析報告嗎？")) {
      return;
    }
  }

  submitQuiz();
}

function submitQuiz() {
  if (examTimerInterval) clearInterval(examTimerInterval);
  document.getElementById("exam-timer").style.display = "none";

  let choiceScore = 0;
  const categoryStats = {
    vf_pvt: { total: 0, correct: 0, label: "VF / pVT 心室顫動" },
    pea_asystole: { total: 0, correct: 0, label: "PEA / 心搏停止" },
    psvt: { total: 0, correct: 0, label: "PSVT 上室速" },
    afib_afl: { total: 0, correct: 0, label: "Afib/Afl (200J)" },
    brady_avb: { total: 0, correct: 0, label: "嚴重心搏過緩/AVB" },
    hyperkalemia: { total: 0, correct: 0, label: "高血鉀進程與用藥" },
    dialysis_complications: { total: 0, correct: 0, label: "透析急症處置" }
  };

  QUESTIONS.forEach(q => {
    if (q.type === "choice") {
      const cat = categoryStats[q.category] || categoryStats.dialysis_complications;
      cat.total++;
      if (userAnswers[q.id] === q.answer) {
        choiceScore += 5;
        cat.correct++;
      }
    }
  });

  // Package submission
  const submissionRecord = {
    id: "sub_" + Date.now(),
    studentName: studentInfo.name,
    studentId: studentInfo.id,
    submittedAt: new Date().toLocaleString("zh-TW"),
    choiceScore: choiceScore,
    answers: userAnswers,
    handwriteStatus: "graded", // automatically graded 20 questions
    handwriteScore: 0,
    aiFeedback: "",
    categoryStats: categoryStats
  };

  submissions.unshift(submissionRecord);
  localStorage.setItem("acls_quiz_submissions", JSON.stringify(submissions));

  // Show result card
  document.getElementById("quiz-content").style.display = "none";
  document.getElementById("quiz-result-card").style.display = "block";
  document.getElementById("result-student-info").innerText = `學員姓名：${studentInfo.name} | 員工編號/單位：${studentInfo.id}`;
  document.getElementById("final-choice-score").innerText = choiceScore;

  renderRadarChart(categoryStats);
  renderReviewExplanations();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function renderRadarChart(stats) {
  const ctx = document.getElementById("radarChart").getContext("2d");
  if (radarChartInstance) radarChartInstance.destroy();

  const labels = Object.values(stats).map(s => s.label);
  const dataValues = Object.values(stats).map(s => s.total > 0 ? Math.round((s.correct / s.total) * 100) : 100);

  radarChartInstance = new Chart(ctx, {
    type: "radar",
    data: {
      labels: labels,
      datasets: [{
        label: "主題掌握度 (%)",
        data: dataValues,
        backgroundColor: "rgba(13, 110, 253, 0.2)",
        borderColor: "rgba(13, 110, 253, 0.85)",
        pointBackgroundColor: "#0d6efd",
        pointBorderColor: "#fff",
        pointHoverBackgroundColor: "#fff",
        pointHoverBorderColor: "#0d6efd"
      }]
    },
    options: {
      responsive: true,
      scales: {
        r: {
          angleLines: { color: "rgba(0,0,0,0.1)" },
          grid: { color: "rgba(0,0,0,0.08)" },
          suggestedMin: 0,
          suggestedMax: 100,
          ticks: { stepSize: 20 }
        }
      },
      plugins: {
        legend: { display: false }
      }
    }
  });
}

function renderReviewExplanations() {
  const container = document.getElementById("review-explanations");
  if (!container) return;

  container.innerHTML = "<h3>🔍 20 題深度臨床題解與 AHA 2025 解析</h3>" + QUESTIONS.map((q, idx) => {
    const userAns = userAnswers[q.id];
    let isCorrect = (q.type === "choice" && userAns === q.answer);
    let statusText = isCorrect ? "✅ 答對 (+5分)" : (q.type === "handwrite" ? "✍️ 已送交手寫 (待批改)" : `❌ 答錯 (您的選擇: ${userAns || '未作答'})`);

    return `
      <div class="review-item ${isCorrect ? 'correct' : (q.type === 'handwrite' ? '' : 'incorrect')}">
        <h4>第 ${idx + 1} 題：${q.title}</h4>
        <p><strong>狀態：</strong>${statusText} | <strong>標準答案：</strong>${q.answer || '請見臨床參考解答'}</p>
        <div class="review-rationale">
          <strong>💡 臨床詳解與最新指引依據：</strong>
          <p>${q.rationale || q.sampleAnswer.replace(/\n/g, '<br>')}</p>
        </div>
      </div>
    `;
  }).join("");
}

function resetQuiz() {
  userAnswers = {};
  timerSeconds = 45 * 60;
  document.getElementById("quiz-result-card").style.display = "none";
  document.getElementById("student-entry-card").style.display = "block";
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// -------------------------------------------------------------
// 10. OFFLINE EXPORT & BACKUP (EXCEL CSV / PDF PRINT / JSON VIEWER)
// -------------------------------------------------------------
function exportStudentCSV() {
  const name = studentInfo.name || "同仁";
  const id = studentInfo.id || "-";
  const total = QUESTIONS.length;
  let correctCount = 0;
  let totalScore = 0;

  let csvContent = "\uFEFF【ACLS 2025/2026 最新指引 × 血液透析與高血鉀急症測驗 個人成績單】\n";
  csvContent += `學員姓名,"${name}",員工編號/單位,"${id}",繳卷時間,"${new Date().toLocaleString('zh-TW')}"\n\n`;
  csvContent += "題號,分類,臨床題目,同仁選擇,正確解答,作答結果,配分,得分,臨床詳解與最新指引依據\n";

  QUESTIONS.forEach((q, idx) => {
    const userAns = userAnswers[q.id] || "未作答";
    const isCor = userAns === q.answer;
    if (isCor) {
      correctCount++;
      totalScore += 5;
    }
    const titleClean = `"${q.title.replace(/"/g, '""').replace(/\n/g, ' ')}"`;
    const rationaleClean = `"${(q.rationale || '').replace(/"/g, '""').replace(/\n/g, ' ')}"`;
    const statusText = isCor ? "正確" : "錯誤";
    const scoreText = isCor ? 5 : 0;

    csvContent += `${idx + 1},"${q.category}",${titleClean},"${userAns}","${q.answer}","${statusText}",5,${scoreText},${rationaleClean}\n`;
  });

  csvContent += `\n總分統計,,,,,"答對 ${correctCount} / ${total} 題",100,${totalScore} 分,\n`;

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `ACLS_成績單_${name}_${Date.now()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function printStudentCertificate() {
  window.print();
}

function exportStudentJSON() {
  const data = {
    type: "student_exam_record",
    student: studentInfo,
    timestamp: new Date().toISOString(),
    answers: userAnswers,
    questionsCount: QUESTIONS.length
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `ACLS_Exam_${studentInfo.name || 'Student'}_${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

// Global JSON File Viewer (Can read student exam or teacher backup JSON)
let uploadedParsedData = null;

function viewUploadedJSON(input) {
  if (!input.files || !input.files[0]) return;
  const file = input.files[0];
  const reader = new FileReader();

  reader.onload = function (e) {
    try {
      const data = JSON.parse(e.target.result);
      uploadedParsedData = data;
      showJsonViewerModal(file.name, data);
    } catch (err) {
      alert("❌ 檔案解讀失敗：此檔案非標準 JSON 格式或已損毀。\n" + err.message);
    }
    input.value = "";
  };

  reader.readAsText(file, "utf-8");
}

function showJsonViewerModal(fileName, data) {
  const modal = document.getElementById("json-viewer-modal");
  const title = document.getElementById("json-viewer-title");
  const body = document.getElementById("json-viewer-body");
  const footer = document.getElementById("json-viewer-footer");

  title.innerText = `📄 成功解讀檔案：${fileName}`;

  // Case A: Teacher full backup array (submissions)
  if (Array.isArray(data)) {
    body.innerHTML = `
      <div style="background:#ecfdf5; border:1px solid #6ee7b7; border-radius:8px; padding:1rem; margin-bottom:1rem;">
        <h4 style="color:#065f46; margin:0 0 0.3rem 0;">📋 全班測驗備份檔案 (共 ${data.length} 位同仁紀錄)</h4>
        <p style="color:#047857; margin:0; font-size:0.9rem;">系統已成功讀取您所選取的後台 JSON 備份檔！您可直接預覽下方清單，或點擊下方按鈕一鍵轉存為 Excel 表格。</p>
      </div>
      <div style="max-height:360px; overflow-y:auto; border:1px solid #e2e8f0; border-radius:8px;">
        <table class="data-table" style="font-size:0.88rem; width:100%;">
          <thead>
            <tr>
              <th>繳卷時間</th>
              <th>同仁姓名</th>
              <th>員編 / 單位</th>
              <th>測驗得分</th>
              <th>AI/導師評語</th>
            </tr>
          </thead>
          <tbody>
            ${data.map(s => `
              <tr>
                <td>${s.submittedAt || '-'}</td>
                <td><strong>${s.studentName || '-'}</strong></td>
                <td>${s.studentId || '-'}</td>
                <td><strong style="color:var(--primary-color);">${s.choiceScore}</strong> / 100</td>
                <td style="max-width:260px; font-size:0.82rem; color:#475569;">${s.aiFeedback || '（尚無評語）'}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    `;
    footer.innerHTML = `
      <button class="btn btn-success" onclick="convertLoadedJsonToCSV()">📥 立即將此資料轉為 Excel (CSV) 下載</button>
      <button class="btn btn-primary" onclick="importJsonToCurrentSubmissions()">🔄 載入至本機後台清單</button>
      <button class="btn btn-secondary" onclick="closeJsonViewerModal()">關閉視窗</button>
    `;
  } 
  // Case B: Single student exam record (e.g. ACLS_Exam_侯玉琴...)
  else if (data.student || data.answers) {
    const sName = data.student?.name || "未知同仁";
    const sId = data.student?.id || "-";
    const answers = data.answers || {};
    let correctCount = 0;
    let score = 0;

    QUESTIONS.forEach(q => {
      if (answers[q.id] === q.answer) {
        correctCount++;
        score += 5;
      }
    });

    body.innerHTML = `
      <div style="background:#eff6ff; border:1px solid #bfdbfe; border-radius:8px; padding:1.25rem; margin-bottom:1.25rem;">
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.5rem;">
          <div>
            <h3 style="margin:0 0 0.3rem 0; color:#1e40af;">🎓 學員：${sName} (${sId})</h3>
            <span style="font-size:0.85rem; color:#64748b;">測驗時間：${data.timestamp ? new Date(data.timestamp).toLocaleString('zh-TW') : '已記錄'}</span>
          </div>
          <div>
            <span style="font-size:1.6rem; font-weight:800; color:var(--primary-color);">${score} 分</span>
            <span style="color:#64748b; font-size:0.95rem;"> / 滿分 100 (答對 ${correctCount} / 20 題)</span>
          </div>
        </div>
      </div>

      <h4>📋 20 題詳細作答情形檢視：</h4>
      <div style="max-height:360px; overflow-y:auto; border:1px solid #e2e8f0; border-radius:8px; padding:0.75rem; background:#fff;">
        ${QUESTIONS.map(q => {
          const userAns = answers[q.id];
          const isCor = userAns === q.answer;
          return `
            <div style="padding:0.6rem 0; border-bottom:1px dashed #e2e8f0;">
              <div style="display:flex; justify-content:space-between; font-weight:700; font-size:0.92rem;">
                <span>第 ${q.id} 題：${q.title.split('\n')[0]}</span>
                <span>${isCor ? '<span style="color:var(--success-color);">✅ 答對 (+5)</span>' : `<span style="color:var(--danger-color);">❌ 答錯 (您選: ${userAns || '未答'} | 解答: ${q.answer})</span>`}</span>
              </div>
              <p style="font-size:0.84rem; color:#475569; margin:0.3rem 0 0 0;">💡 ${q.rationale}</p>
            </div>
          `;
        }).join("")}
      </div>
    `;

    footer.innerHTML = `
      <button class="btn btn-success" onclick="convertLoadedStudentJsonToCSV('${sName}', '${sId}')">📥 轉為 Excel (CSV) 成績單下載</button>
      <button class="btn btn-secondary" onclick="closeJsonViewerModal()">關閉視窗</button>
    `;
  } else {
    body.innerHTML = `
      <div style="padding:1.5rem; text-align:center;">
        <p style="color:#64748b;">此 JSON 檔案格式無法直接映射至測驗資料，以下為原始內容：</p>
        <pre style="background:#f1f5f9; padding:1rem; border-radius:6px; max-height:300px; overflow:auto; text-align:left; font-size:0.85rem;">${JSON.stringify(data, null, 2)}</pre>
      </div>
    `;
    footer.innerHTML = `<button class="btn btn-secondary" onclick="closeJsonViewerModal()">關閉視窗</button>`;
  }

  modal.style.display = "flex";
}

function closeJsonViewerModal() {
  document.getElementById("json-viewer-modal").style.display = "none";
}

function convertLoadedJsonToCSV() {
  if (!uploadedParsedData || !Array.isArray(uploadedParsedData)) return;
  const tempSubs = uploadedParsedData;
  let csvContent = "\uFEFF繳卷時間,同仁姓名,員工編號,測驗總分(100),答對題數(20),評定狀態,AI/教師臨床診斷評語\n";

  tempSubs.forEach(s => {
    const total = s.choiceScore || 0;
    const correctCount = Math.round(total / 5);
    const feedbackSafe = `"${(s.aiFeedback || '').replace(/"/g, '""')}"`;
    csvContent += `"${s.submittedAt || ''}","${s.studentName || ''}","${s.studentId || ''}",${total},${correctCount},"已評分",${feedbackSafe}\n`;
  });

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `ACLS_全班成績表_由JSON轉出_${Date.now()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function convertLoadedStudentJsonToCSV(name, id) {
  if (!uploadedParsedData) return;
  const answers = uploadedParsedData.answers || {};
  let correctCount = 0;
  let totalScore = 0;

  let csvContent = `\uFEFF【ACLS 2025/2026 個人成績單 - 由備份檔轉出】\n學員姓名,"${name}",員編/單位,"${id}",轉出時間,"${new Date().toLocaleString('zh-TW')}"\n\n`;
  csvContent += "題號,分類,臨床題目,同仁選擇,正確解答,結果,配分,得分,臨床詳解依據\n";

  QUESTIONS.forEach((q, idx) => {
    const userAns = answers[q.id] || "未作答";
    const isCor = userAns === q.answer;
    if (isCor) {
      correctCount++;
      totalScore += 5;
    }
    const titleClean = `"${q.title.replace(/"/g, '""').replace(/\n/g, ' ')}"`;
    const rationaleClean = `"${(q.rationale || '').replace(/"/g, '""').replace(/\n/g, ' ')}"`;
    const statusText = isCor ? "正確" : "錯誤";
    const scoreText = isCor ? 5 : 0;

    csvContent += `${idx + 1},"${q.category}",${titleClean},"${userAns}","${q.answer}","${statusText}",5,${scoreText},${rationaleClean}\n`;
  });

  csvContent += `\n總分統計,,,,,"答對 ${correctCount} / 20 題",100,${totalScore} 分,\n`;

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `ACLS_成績單_${name}_由JSON轉出_${Date.now()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function importJsonToCurrentSubmissions() {
  if (!uploadedParsedData || !Array.isArray(uploadedParsedData)) return;
  if (confirm(`確定要將此備份檔中的 ${uploadedParsedData.length} 筆資料匯入至後台嗎？（重複 ID 會自動過濾）`)) {
    let added = 0;
    uploadedParsedData.forEach(newSub => {
      if (!submissions.some(s => s.id === newSub.id)) {
        submissions.unshift(newSub);
        added++;
      }
    });
    localStorage.setItem("acls_quiz_submissions", JSON.stringify(submissions));
    updateTeacherSubmissionsTable();
    closeJsonViewerModal();
    alert(`🎉 成功匯入 ${added} 筆測驗繳卷紀錄！`);
  }
}

// -------------------------------------------------------------
// 11. TEACHER ADMIN & GOOGLE GEMINI VISION GRADING
// -------------------------------------------------------------
function loadSavedApiKey() {
  const key = localStorage.getItem("gemini_api_key") || "";
  const input = document.getElementById("gemini-api-key");
  if (input) input.value = key;
}

function saveApiKey() {
  const key = document.getElementById("gemini-api-key").value.trim();
  localStorage.setItem("gemini_api_key", key);
  alert("✅ Gemini API Key 已成功儲存於本機瀏覽器！");
}

function updateShareLink() {
  const input = document.getElementById("share-link-input");
  if (input) {
    input.value = window.location.href.split("#")[0];
  }
}

function copyShareLink() {
  const input = document.getElementById("share-link-input");
  input.select();
  navigator.clipboard.writeText(input.value);
  alert("📋 本機網址已複製到剪貼簿！（提醒：此網址僅限本機使用，若要派發給同仁請複製綠色的同 Wi-Fi 網址）。");
}

function copyWifiShareLink() {
  const input = document.getElementById("wifi-share-link");
  if (input) {
    input.select();
    navigator.clipboard.writeText(input.value);
    alert("📋 區網 Wi-Fi 派卷網址已複製到剪貼簿！\n同仁手機或平板只要連線在相同的 Wi-Fi 下，點開此網址即可直接進入測驗！");
  }
}

function updateTeacherSubmissionsTable() {
  const tbody = document.getElementById("submissions-tbody");
  const countSpan = document.getElementById("submission-count");
  if (!tbody) return;

  countSpan.innerText = submissions.length;

  if (submissions.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; color:#94a3b8; padding:2rem;">目前尚無同仁繳卷紀錄</td></tr>`;
    return;
  }

  tbody.innerHTML = submissions.map(sub => {
    const totalScore = sub.choiceScore;
    const correctCount = Math.round(totalScore / 5);
    const statusBadge = `<span style="color:var(--success-color); font-weight:700;">✅ 已自動批閱</span>`;

    return `
      <tr>
        <td>${sub.submittedAt}</td>
        <td><strong>${sub.studentName}</strong></td>
        <td>${sub.studentId}</td>
        <td><strong style="color:var(--primary-color); font-size:1.15rem;">${totalScore}</strong> / 100</td>
        <td>${correctCount} / 20 題</td>
        <td>${statusBadge}</td>
        <td>
          <button class="btn btn-primary btn-sm" onclick="openGradingModal('${sub.id}')">🔍 檢視診斷 / AI分析</button>
        </td>
      </tr>
    `;
  }).join("");
}

let currentGradingSubId = null;

function openGradingModal(subId) {
  const sub = submissions.find(s => s.id === subId);
  if (!sub) return;

  currentGradingSubId = subId;
  const modal = document.getElementById("grading-modal");
  const title = document.getElementById("modal-title");
  const body = document.getElementById("modal-body");

  title.innerText = `同仁作答診斷報告：${sub.studentName} (${sub.studentId})`;

  const wrongQuestions = QUESTIONS.filter(q => sub.answers[q.id] !== q.answer);

  body.innerHTML = `
    <div style="background:#f8fafc; padding:1.25rem; border-radius:8px; border:1px solid #e2e8f0;">
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.5rem;">
        <div>
          <span style="font-size:1.5rem; font-weight:800; color:var(--primary-color);">${sub.choiceScore} 分</span>
          <span style="color:#64748b; font-size:0.95rem;"> / 滿分 100 分 (答對 ${Math.round(sub.choiceScore / 5)} / 20 題)</span>
        </div>
        <div style="font-size:0.85rem; color:#64748b;">繳卷時間：${sub.submittedAt}</div>
      </div>
      <button class="btn btn-success btn-sm" style="margin-top:0.75rem;" onclick="gradeSingleSubmissionWithGemini('${sub.id}')">
        ⚡ 呼叫 Gemini 1.5 生成個人化學習弱點與臨床強化診斷
      </button>
    </div>

    <div style="margin-top:1rem;">
      <h4>📋 作答情形與錯題明細 (${wrongQuestions.length === 0 ? '<span style="color:var(--success-color);">全對 100 分！觀念極佳</span>' : `答錯 ${wrongQuestions.length} 題`})</h4>
      <div style="max-height: 220px; overflow-y: auto; border: 1px solid #e2e8f0; border-radius: 6px; padding: 0.75rem; background: #fff; margin-top: 0.5rem;">
        ${QUESTIONS.map(q => {
          const isCor = sub.answers[q.id] === q.answer;
          return `
            <div style="padding:0.4rem 0; border-bottom:1px dashed #f1f5f9; font-size:0.88rem; display:flex; justify-content:space-between; align-items:center;">
              <span style="max-width:70%; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">第 ${q.id} 題：${q.title.split('\n')[0]}</span>
              <span>${isCor ? '<span style="color:var(--success-color); font-weight:700;">✅ 正確 (+5)</span>' : `<span style="color:var(--danger-color); font-weight:700;">❌ 錯 (選 ${sub.answers[q.id] || '未答'} / 答 ${q.answer})</span>`}</span>
            </div>
          `;
        }).join("")}
      </div>
    </div>

    <div style="background:#fff; border:1px solid #cbd5e1; border-radius:8px; padding:1.25rem; margin-top:1rem;">
      <div class="form-group">
        <label for="modal-ai-feedback"><strong>💡 AI 臨床導師個人化診斷與指導評語：</strong></label>
        <textarea id="modal-ai-feedback" rows="4" style="width:100%; padding:0.75rem; border:1px solid #cbd5e1; border-radius:6px; margin-top:0.4rem;" placeholder="點擊上方按鈕由 Gemini 生成，或直接手動輸入導師指導建議...">${sub.aiFeedback || ''}</textarea>
      </div>
    </div>
  `;

  modal.style.display = "flex";
}

function closeGradingModal() {
  document.getElementById("grading-modal").style.display = "none";
}

function saveManualGrading() {
  if (!currentGradingSubId) return;
  const sub = submissions.find(s => s.id === currentGradingSubId);
  if (sub) {
    sub.aiFeedback = document.getElementById("modal-ai-feedback").value.trim();
    localStorage.setItem("acls_quiz_submissions", JSON.stringify(submissions));
    updateTeacherSubmissionsTable();
    closeGradingModal();
    alert("✅ 臨床診斷與導師評語已成功儲存！");
  }
}

// Gemini AI Clinical Diagnostic Analysis Logic
async function gradeSingleSubmissionWithGemini(subId) {
  const sub = submissions.find(s => s.id === subId);
  if (!sub) return;

  const apiKey = localStorage.getItem("gemini_api_key") || document.getElementById("gemini-api-key").value.trim();
  if (!apiKey) {
    alert("⚠️ 請先在上方設定並儲存您的 Google Gemini API Key 才能執行 AI 智能診斷！");
    return;
  }

  const wrongQuestions = QUESTIONS.filter(q => sub.answers[q.id] !== q.answer);

  const promptText = `
你是一位具備 2025 AHA ACLS 指導員與腎臟專科資格的資深急救主治醫師。
請依據台灣醫學常用術語與 2025 最新 ACLS 指引，為同仁「${sub.studentName}」本次 20 題急症測驗（得分：${sub.choiceScore}/100 分）撰寫一份個人化臨床能力診斷與弱點強化評語。

作答錯題清單如下：
${wrongQuestions.length === 0 ? "該同仁 20 題全部答對，滿分 100 分！觀念非常扎實。" : wrongQuestions.map(q => `- 第${q.id}題 [${q.category}]：${q.title.split('\n')[0]} (同仁選: ${sub.answers[q.id] || '未作答'}, 正確答案: ${q.answer})`).join("\n")}

請給予 120-200 字具體、溫暖且具備臨床實務教學價值的導師評語：
1. 先肯定其表現與掌握良好的急救觀念；
2. 針對其答錯的主題盲點（例如高血鉀 CPR 與鈣劑順序、Durant 擺位機轉、瘻管防栓加壓或 2025 指引 200J 電擊等）給予點撥；
3. 提示未來臨床應對時的心態與關鍵行動。

輸出格式必須嚴格為以下 JSON，不要包含 Markdown 代碼塊標籤：
{
  "feedback": "..."
}
`;

  try {
    // 1. Dynamically discover active available models for this API key
    let modelName = "gemini-2.5-flash";
    try {
      const listRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
      if (listRes.ok) {
        const listData = await listRes.json();
        if (listData.models && listData.models.length > 0) {
          const candidate = listData.models.find(m => 
            m.supportedGenerationMethods && 
            m.supportedGenerationMethods.includes("generateContent") && 
            (m.name.includes("flash") || m.name.includes("pro"))
          ) || listData.models.find(m => 
            m.supportedGenerationMethods && 
            m.supportedGenerationMethods.includes("generateContent")
          );
          if (candidate) {
            modelName = candidate.name.replace(/^models\//, "");
          }
        }
      }
    } catch (discErr) {
      console.warn("Model list fallback:", discErr);
    }

    // 2. Call generateContent
    let response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: promptText }]
        }]
      })
    });

    if (!response.ok && modelName !== "gemini-2.5-flash") {
      modelName = "gemini-2.5-flash";
      response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: promptText }] }]
        })
      });
    }

    const resData = await response.json();
    if (resData.candidates && resData.candidates[0]) {
      const rawText = resData.candidates[0].content.parts[0].text;
      const cleanJson = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
      const parsed = JSON.parse(cleanJson);

      document.getElementById("modal-ai-feedback").value = parsed.feedback || "Gemini 診斷評語生成完成。";
      alert(`🎉 Gemini (${modelName}) 臨床診斷報告生成完成！已自動填入建議評語，請確認後點擊「儲存」！`);
    } else {
      throw new Error(resData.error?.message || "API 回傳格式無效");
    }
  } catch (err) {
    alert("❌ Gemini 診斷失敗：" + err.message + "\n已切換為本地專家啟發式預評。");
    // Fallback heuristic feedback
    if (wrongQuestions.length === 0) {
      document.getElementById("modal-ai-feedback").value = "【臨床導師評語】：同仁 20 題全數答對，對 2025 ACLS 最新指引（200J 電擊、高血鉀跳停 CPR 優先）與血液透析急症（瘻管出血加壓、Durant 擺位、高鉀急救用藥）觀念掌握非常卓越，足堪團隊急救中流砥柱！";
    } else {
      document.getElementById("modal-ai-feedback").value = `【臨床導師評語】：同仁本次測驗表現良好（得分 ${sub.choiceScore} 分），在基礎心律判讀具備扎實概念。建議針對答錯之題目（如：${wrongQuestions.map(q=>'第'+q.id+'題').join('、')}）進行觀念強化，特別注意高血鉀正弦波急救順序與 Durant 擺位左側頭低位生理機制，臨床處置將更臻純熟！`;
    }
  }
}

async function batchGradeAll() {
  if (submissions.length === 0) {
    alert("目前尚無同仁繳卷紀錄！");
    return;
  }
  const apiKey = localStorage.getItem("gemini_api_key") || document.getElementById("gemini-api-key").value.trim();
  if (!apiKey) {
    alert("⚠️ 請先在上方設定並儲存您的 Google Gemini API Key！");
    return;
  }
  alert(`即將為目前 ${submissions.length} 位同仁批量生成 AI 診斷評語，請稍候！`);
  for (let s of submissions) {
    if (!s.aiFeedback) {
      await gradeSingleSubmissionWithGemini(s.id);
      saveManualGrading();
    }
  }
  alert("🎉 批量 AI 臨床診斷報告生成完畢！");
}

function exportTeacherCSV() {
  if (submissions.length === 0) {
    alert("目前尚無資料可匯出！");
    return;
  }

  let csvContent = "\uFEFF繳卷時間,同仁姓名,員工編號,測驗總分(100),答對題數(20),評定狀態,AI/教師臨床診斷評語\n";

  submissions.forEach(s => {
    const total = s.choiceScore;
    const correctCount = Math.round(total / 5);
    const feedbackSafe = `"${(s.aiFeedback || '').replace(/"/g, '""')}"`;
    csvContent += `"${s.submittedAt}","${s.studentName}","${s.studentId}",${total},${correctCount},"已評分",${feedbackSafe}\n`;
  });

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `ACLS_透析測驗全班成績表_${Date.now()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function exportTeacherJSON() {
  const blob = new Blob([JSON.stringify(submissions, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `ACLS_透析測驗後台完整備份_${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function clearAllSubmissions() {
  if (confirm("⚠️ 確定要清空所有同仁的測驗繳卷紀錄嗎？此動作無法復原！")) {
    submissions = [];
    localStorage.removeItem("acls_quiz_submissions");
    updateTeacherSubmissionsTable();
    alert("已清空紀錄。");
  }
}
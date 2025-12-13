# Anki ベストプラクティス - 言語学習向け最適設定

## 参考資料
- [Best Anki Settings - Lean Anki](https://leananki.com/best-settings/)
- [Anki Setup - Refold](https://refold.la/roadmap/stage-1/a/anki-setup/)
- [Anki Forums - Optimal Settings](https://forums.ankiweb.net/t/anki-optimal-settings/26896)
- [Anki Forums - Optimal Steps for Language Learning](https://forums.ankiweb.net/t/optimal-anki-steps-for-language-learning/30208)

---

## 1. アルゴリズム選択

### FSRS（推奨）
- **正式名称**: Free Spaced Repetition Scheduler
- **特徴**: 機械学習ベースの最新アルゴリズム
- **対応バージョン**: Anki 23.10以降
- **メリット**:
  - 個人の学習パターンに最適化
  - より正確な復習タイミング予測
  - 従来のSM-2より効率的

### SM-2（従来型）
- SuperMemo 2アルゴリズムがベース
- 長年の実績あり
- カスタマイズ性が高い

---

## 2. 推奨設定値

### 2.1 Daily Limits（毎日の制限）

| 設定 | 推奨値 | 説明 |
|------|--------|------|
| New cards/day | 20〜30 | 初心者は20、慣れたら増やす |
| Maximum reviews/day | 9999 | 制限なし（復習は全てこなす） |

> **重要**: 復習カードは必ず全てこなす。新規カードは調整可能。

### 2.2 Learning Steps（学習ステップ）

#### 推奨設定
```
10m 1d 3d
```

| ステップ | 間隔 | 目的 |
|----------|------|------|
| 1 | 10分 | 短期記憶の確認 |
| 2 | 1日 | 睡眠による記憶定着後の確認 |
| 3 | 3日 | 中期記憶への移行確認 |

#### なぜこの設定か
- **10分**: 即座に忘れないかの確認
- **1日**: 睡眠中の記憶整理後にテスト
- **3日**: 本当に覚えているかの最終確認

### 2.3 Graduating Interval（卒業間隔）

| 設定 | 推奨値 |
|------|--------|
| Graduating interval | 7日 |
| Easy interval | 4日 |

- Learning完了後、最初のReview間隔は7日
- Easyを押した場合は4日後

### 2.4 Reviews（復習設定）

| 設定 | 推奨値 | 説明 |
|------|--------|------|
| Maximum interval | 180〜365日 | これ以上は実用的でない |
| Starting ease | 2.50 (250%) | デフォルト値 |
| Easy bonus | 1.30 (130%) | Easyボタン時の追加倍率 |
| Interval modifier | 1.00 (100%) | 全体の間隔調整 |

### 2.5 Lapses（失敗時の設定）

| 設定 | 推奨値 | 説明 |
|------|--------|------|
| Relearning steps | 10m | 再学習時のステップ |
| New interval | 60% | 失敗時、元の間隔の60%から再開 |
| Minimum interval | 1日 | 最低でも1日は空ける |
| Leech threshold | 8 | 8回失敗でLeech扱い |

#### New Interval 60%の理由
> 「3年間正しく覚えていたカードを1回忘れたからといって、新規カードと同じ扱いにする必要があるか？」
>
> → 完全リセット（0%）は非効率。60%に設定することで、蓄積された記憶を活かす。

---

## 3. 回答ボタンの使い方

### Refold推奨: 2ボタン方式

| ボタン | 使用タイミング | 頻度 |
|--------|---------------|------|
| **Again** | 思い出せなかった、間違えた | 必要時 |
| **Good** | 思い出せた | ほぼ毎回 |

### 4ボタンを使う場合

| ボタン | 使用タイミング | 注意 |
|--------|---------------|------|
| Again | 完全に思い出せない | - |
| Hard | **使用非推奨** | 間隔が不自然に長くなる |
| Good | 少し考えて思い出せた | メインで使用 |
| Easy | 即答でき、完全に定着している | 稀に使用 |

> **警告**: Hardボタンを「失敗」として使うと、間隔計算がおかしくなる。
> 失敗は必ずAgainを押すこと。

---

## 4. カード表示順序

| 設定 | 推奨 | 理由 |
|------|------|------|
| New card gather order | Random | インターリーブ学習効果 |
| Review sort order | Due date | 期限切れ優先 |

### インターリーブ学習とは
- 似たカードを連続で見ない
- 異なるトピックを混ぜて学習
- 長期記憶への定着率が向上

---

## 5. FSRSを使う場合

### 設定手順
1. Anki 23.10以上にアップデート
2. デッキオプション → FSRS を有効化
3. Desired retention（目標保持率）を設定
   - 推奨: 90%（デフォルト）
   - 難しい内容: 85%
   - 簡単な内容: 95%
4. 「Optimize」ボタンをクリック

### FSRSのメリット
- 個人の記憶パターンに自動最適化
- Ease Factor地獄を回避
- より正確な復習スケジューリング

---

## 6. 効率を測定する指標

### True Retention（真の保持率）
- 目標: 85〜90%
- 低すぎる（<80%）: 間隔が長すぎる
- 高すぎる（>95%）: 間隔が短すぎる、時間の無駄

### 理想的なバランス
```
保持率 90% = 効率的
保持率 100% = 復習しすぎ（時間の無駄）
保持率 70% = 復習不足（忘れすぎ）
```

---

## 7. よくある間違い

### ❌ 避けるべき設定・行動

1. **Hardボタンを失敗として使う**
   - 間隔が異常に長くなる
   - → Againを使う

2. **Learning stepsを1ステップだけにする**
   - 記憶定着が不十分
   - → 最低3ステップ推奨

3. **Maximum intervalを短くしすぎる**
   - 復習地獄になる
   - → 180日以上推奨

4. **New intervalを0%にする**
   - 失敗時に完全リセット
   - → 60%で蓄積を活かす

5. **復習をスキップする**
   - 間隔反復の効果が台無し
   - → 復習は毎日必ずこなす

---

## 8. 本アプリへの実装方針

上記ベストプラクティスを踏まえ、以下の設定で実装する：

```typescript
const SETTINGS = {
  // Learning Steps
  learningSteps: [10, 1440, 4320], // 10分, 1日, 3日（分単位）

  // Graduating
  graduatingInterval: 7,  // 7日
  easyInterval: 4,        // 4日

  // Reviews
  startingEase: 2.5,
  easyBonus: 1.3,
  maximumInterval: 365,

  // Lapses
  relearningSteps: [10],  // 10分
  newInterval: 0.6,       // 60%
  minimumInterval: 1,

  // Daily Limits
  newCardsPerDay: 20,
  maxReviewsPerDay: 9999,

  // Buttons
  useSimplifiedButtons: true, // Again/Good の2択
};
```

---

## 9. 参考: デフォルト設定との比較

| 設定 | Ankiデフォルト | 推奨値 | 変更理由 |
|------|---------------|--------|----------|
| Learning steps | 1m 10m | 10m 1d 3d | より確実な定着 |
| Graduating interval | 1日 | 7日 | 早すぎる卒業を防ぐ |
| New interval | 0% | 60% | 蓄積を活かす |
| Maximum interval | 36500日 | 365日 | 現実的な上限 |

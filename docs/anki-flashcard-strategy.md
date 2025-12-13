# Anki風単語帳機能 - 実装戦略ドキュメント

## 1. 概要

TOPIK単語リスト（1,671語）を使用した、間隔反復学習（Spaced Repetition）による単語帳機能を実装する。

## 2. 間隔反復アルゴリズム

### 2.1 採用アルゴリズム: 簡易SM-2

Ankiの基本となるSM-2アルゴリズムを簡略化して実装する。

#### カードの状態

| 状態 | 説明 |
|------|------|
| **New** | まだ学習していないカード |
| **Learning** | 学習中（短期間隔で復習） |
| **Review** | 復習段階（長期間隔で復習） |
| **Relearning** | 復習で失敗し、再学習中 |

#### Ease Factor（難易度係数）

- 初期値: 2.5
- 最小値: 1.3
- 回答に応じて調整:
  - Again: -0.2
  - Hard: -0.15
  - Good: ±0
  - Easy: +0.15

#### 間隔計算

```
新しい間隔 = 前回の間隔 × Ease Factor × 間隔修正係数
```

### 2.2 学習ステップ

#### Learningフェーズ
1. 1分
2. 10分
3. → Review昇格（初回間隔: 1日）

#### 回答ボタンの動作

| ボタン | Learning時 | Review時 |
|--------|-----------|----------|
| **Again** | ステップ1に戻る | Relearningへ |
| **Hard** | 現在のステップを繰り返す | 間隔 × 1.2 |
| **Good** | 次のステップへ | 間隔 × Ease |
| **Easy** | 即座にReviewへ | 間隔 × Ease × 1.3 |

## 3. データ構造

### 3.1 単語データ

```typescript
type Word = {
  id: number;
  korean: string;      // 韓国語
  japanese: string;    // 日本語訳
};
```

### 3.2 学習進捗データ

```typescript
type CardProgress = {
  wordId: number;
  state: 'new' | 'learning' | 'review' | 'relearning';
  easeFactor: number;        // 難易度係数 (1.3-2.5)
  interval: number;          // 次の復習までの日数
  dueDate: string;           // 次の復習日 (ISO string)
  learningStep: number;      // Learning中のステップ (0, 1, 2...)
  repetitions: number;       // 連続正解回数
  lapses: number;            // 失敗回数
  lastReview: string | null; // 最終復習日
};
```

### 3.3 セッションデータ

```typescript
type StudySession = {
  date: string;
  newCardsStudied: number;
  reviewsCompleted: number;
  correctCount: number;
  incorrectCount: number;
};
```

## 4. 機能仕様

### 4.1 学習モード

1. **今日の学習**
   - 期限が来た復習カード
   - 新規カード（1日あたりの上限設定可能、デフォルト: 20枚）

2. **カードの表示順序**
   - 復習カード（期限切れ）を優先
   - 次に新規カード
   - Learning中のカードは短い間隔で繰り返し

### 4.2 カード表示

```
┌─────────────────────────────┐
│                             │
│         감사합니다           │  ← 韓国語（問題）
│                             │
│     [タップして答えを見る]    │
│                             │
└─────────────────────────────┘

↓ タップ後

┌─────────────────────────────┐
│                             │
│         감사합니다           │
│      ありがとうございます      │  ← 日本語（答え）
│                             │
│  [Again] [Hard] [Good] [Easy]│
│                             │
└─────────────────────────────┘
```

### 4.3 統計表示

- 今日の進捗（新規/復習/完了）
- 連続学習日数
- 総学習カード数
- 正答率

## 5. UI/UXデザイン

### 5.1 画面構成

1. **ホーム画面**（既存の活用トレーニングと共存）
   - タブまたはナビゲーションで切り替え

2. **単語帳メイン画面**
   - 今日の学習ボタン
   - 統計サマリー
   - デッキ情報（残りカード数）

3. **学習画面**
   - カード表示
   - 回答ボタン
   - 進捗バー

4. **統計画面**
   - 学習履歴グラフ
   - カード状態の分布

### 5.2 デザイン方針

- 現在のアプリのシンプルなデザインを踏襲
- 集中できるミニマルなカードUI
- 明確な視覚フィードバック

## 6. 技術実装

### 6.1 データ永続化

- **localStorage** を使用
- キー: `anki-progress`, `anki-sessions`
- JSON形式で保存

### 6.2 ファイル構成

```
src/
├── components/
│   └── flashcard/
│       ├── FlashcardHome.tsx      # メイン画面
│       ├── FlashcardStudy.tsx     # 学習画面
│       ├── FlashcardCard.tsx      # カードコンポーネント
│       ├── FlashcardStats.tsx     # 統計画面
│       └── AnswerButtons.tsx      # 回答ボタン
├── hooks/
│   ├── useFlashcardProgress.ts    # 進捗管理
│   └── useSpacedRepetition.ts     # SRアルゴリズム
├── utils/
│   └── spacedRepetition.ts        # 間隔計算ロジック
├── types/
│   └── flashcard.ts               # 型定義
└── data/
    └── topik-words.ts             # 単語データ（JSONから変換）
```

### 6.3 状態管理

- React useState/useReducer
- localStorage同期

## 7. 実装フェーズ

### Phase 1: 基盤構築
- [ ] 単語データの読み込み・パース
- [ ] 型定義
- [ ] 基本的なカードUI

### Phase 2: SRアルゴリズム
- [ ] 間隔計算ロジック
- [ ] カード状態管理
- [ ] localStorage永続化

### Phase 3: 学習機能
- [ ] 学習セッション管理
- [ ] 回答ボタンの実装
- [ ] 進捗表示

### Phase 4: 統計・設定
- [ ] 学習統計
- [ ] 設定画面（1日の新規カード数など）

### Phase 5: 仕上げ
- [ ] アニメーション
- [ ] レスポンシブ対応
- [ ] パフォーマンス最適化

## 8. 設定オプション

| 設定項目 | デフォルト値 | 説明 |
|----------|-------------|------|
| 1日の新規カード数 | 20 | 1日に学習する新規カードの上限 |
| 1日の復習カード数 | 100 | 1日に復習するカードの上限 |
| 学習ステップ | [1, 10] | Learning時の間隔（分） |
| 卒業間隔 | 1 | Reviewへの昇格時の初期間隔（日） |
| Easy間隔 | 4 | Easy回答時の初期間隔（日） |
| 最大間隔 | 365 | 復習間隔の上限（日） |

## 9. 今後の拡張案

- 音声再生機能（韓国語の発音）
- 逆方向学習（日本語→韓国語）
- タグ/カテゴリによるフィルタリング
- エクスポート/インポート機能
- 学習リマインダー通知

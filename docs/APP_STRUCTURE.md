# アプリ構成ドキュメント

韓国語活用トレーニングアプリの機能と動線をまとめたドキュメントです。

## ルーティング（5画面）

| パス | 画面 | 説明 |
|------|------|------|
| `/` | ホーム | 統計・動詞リスト・ナビゲーション |
| `/conjugation` | 活用トレーニング | 動詞の9活用形を入力練習 |
| `/typing` | タイピング練習 | 例文をハングル入力 |
| `/words` | 韓→日単語帳 | フラッシュカード形式 |
| `/words-reverse` | 日→韓単語帳 | 入力形式 |

---

## ユーザーフロー図

```
ホーム (/)
├── 動詞クリック ────────→ 活用トレーニング (/conjugation)
│                              ├── 9活用形を入力
│                              ├── 全正解 → confetti → 次の動詞
│                              └── 「タイピング練習」→ /typing
│
├── 「韓→日」ボタン ────→ 単語帳ホーム (/words)
│                              ├── 「学習を始める」→ 学習画面
│                              │      └── カード表示 → Good/Again
│                              └── 「単語一覧」→ 検索・フィルター
│
├── 「日→韓」ボタン ────→ 逆単語帳ホーム (/words-reverse)
│                              └── 韓国語を入力 → 自動採点
│
└── 「タイピング」ボタン ─→ タイピング練習 (/typing)
                               ├── 通常モード（動詞別）
                               └── ランダムモード（全例文シャッフル）
```

---

## 各機能の詳細

### 1. ホーム画面 (`/`)

**表示内容:**
- ヘッダー: アプリタイトル「韓国語活用トレーニング」
- ナビゲーションボタン: 「韓→日」「日→韓」「タイピング」
- 統計情報セクション（ActivityGraph）
  - 総練習回数
  - 今日の練習回数
  - 連続練習日数
  - 練習日のカレンダー表示
- 動詞リスト（練習回数でソート、クリックで活用トレーニングへ）

---

### 2. 活用トレーニング (`/conjugation`)

**機能:**
- 動詞の9つの活用形を順番に入力練習
  - 基本形（base）
  - 現在形（present）、過去形（past）、未来形（future）
  - 連用形（go/seo）
  - 否定形（negative_an/negative_jian）
  - 可能形（possible）

**UI:**
- 動詞セレクト（ドロップダウン）
- 各フィールド: 入力 → 「採点」/「答えを見る」
- 全正解で confetti アニメーション → 「次の問題へ」

**進捗保存:** `localStorage.verbProgress`

---

### 3. タイピング練習 (`/typing`)

**2つのモード:**
1. **通常モード** - 選択した動詞の例文8つを順番に
2. **ランダムモード** - 全動詞の全例文をシャッフル

**機能:**
- ハングル字母単位での判定（Hangul-js使用）
- リアルタイムカラー表示（正解:緑、入力中:青、誤字:ピンク）
- 単語クリックで音声再生
- スキップ機能

---

### 4. 韓→日 単語帳 (`/words`)

**画面構成:**
1. **ホーム画面** (`FlashcardHome`)
   - 今日の学習統計（新規/学習中/復習）
   - 「学習を始める」ボタン
   - 全体進捗バー
   - 「単語一覧」ボタン

2. **学習画面** (`FlashcardStudy`)
   - カード表示 → タップで裏返す
   - 「もう一回」(Again) / 「OK」(Good) ボタン

3. **カード** (`FlashcardCard`)
   - 表面: 韓国語
   - 裏面: 日本語
   - 音声再生ボタン
   - メモ機能（クリップボード貼り付け対応）
   - 検索リンク（例文/画像）

4. **単語一覧** (`WordList`)
   - 全TOPIK単語を表示
   - テキスト検索・状態フィルター

**アルゴリズム:** SM-2 Spaced Repetition

**進捗保存:** `localStorage.flashcardProgress`

---

### 5. 日→韓 単語帳 (`/words-reverse`)

**画面構成:** 韓→日版と同様

**違い:**
- 問題: 日本語を表示
- 回答: 韓国語を入力
- 自動採点（正解→Good / 不正解→Again）
- 同じ日本語の意味が複数ある場合、ヒント（最初の1文字）を表示

**進捗保存:** `localStorage.reverseFlashcardProgress`

---

## データ保存（localStorage）

| キー | 内容 | 使用箇所 |
|------|------|----------|
| `verbProgress` | 活用練習の完了回数・練習日 | App.tsx |
| `flashcardProgress` | 韓→日の学習進捗 | useFlashcardProgress |
| `reverseFlashcardProgress` | 日→韓の学習進捗 | useReverseFlashcardProgress |
| `word-memos` | 単語ごとのメモ | useWordMemo |
| `lastPracticeDate` | 最後の練習日 | App.tsx |

---

## ファイル構造

```
/src
├── App.tsx                          # メインアプリ＆ルーティング
├── main.tsx                         # HashRouter セットアップ
│
├── /components
│   ├── InputRow.tsx                 # 活用入力フィールド
│   ├── TypingPractice.tsx           # タイピング練習
│   ├── ActivityGraph.tsx            # 活動グラフ
│   ├── Calendar.tsx                 # カレンダー
│   │
│   └── /flashcard
│       ├── FlashcardHome.tsx        # 韓→日 ホーム
│       ├── FlashcardStudy.tsx       # 韓→日 学習
│       ├── FlashcardCard.tsx        # 韓→日 カード
│       ├── ReverseFlashcardHome.tsx # 日→韓 ホーム
│       ├── ReverseFlashcardStudy.tsx# 日→韓 学習
│       ├── ReverseFlashcardCard.tsx # 日→韓 カード
│       └── WordList.tsx             # 単語一覧
│
├── /hooks
│   ├── useFlashcardProgress.ts      # 韓→日 進捗管理
│   ├── useReverseFlashcardProgress.ts # 日→韓 進捗管理
│   ├── useSpeechSynthesis.ts        # 音声読み上げ
│   └── useWordMemo.ts               # メモ機能
│
├── /data
│   ├── topikWords.ts                # TOPIK単語データ
│   └── verbs.json                   # 動詞データ
│
├── /types
│   ├── types.ts                     # 活用トレーニング型
│   └── flashcard.ts                 # フラッシュカード型
│
└── /utils
    ├── parseCSV.ts                  # CSVパーサー
    └── spacedRepetition.ts          # SM-2アルゴリズム
```

---

## カード状態遷移（Spaced Repetition）

```
new（未学習）
    ↓ [学習開始]
learning（学習中）
    ├── [Again] → learning（ステップ0に戻る）
    └── [Good]  → 次のステップ → 全ステップ完了で review へ

review（復習待機）
    ├── [Again] → relearning（再学習）
    └── [Good]  → review（間隔を延長）

relearning（再学習中）
    ├── [Again] → relearning（ステップ0に戻る）
    └── [Good]  → review（復帰）
```

---

## 技術スタック

- **フレームワーク:** React + TypeScript
- **ルーティング:** React Router (HashRouter)
- **スタイリング:** Tailwind CSS
- **アイコン:** Lucide React
- **ハングル処理:** Hangul-js
- **アニメーション:** canvas-confetti

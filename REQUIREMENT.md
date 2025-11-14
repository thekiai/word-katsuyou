# 🚀 **韓国語活用トレーニング Webアプリ（MVP最新版）

Claude用 実装指示書（CSV埋め込み版 + 複数活用版）**

以下を満たす **React + TypeScript の最小構成アプリ** を作ってください。
CSVのアップロード画面は不要で、CSVは最初からアプリ内部に組み込みます。

---

# =============================

# 🎯 **目的**

# =============================

韓国語の動詞活用を、ユーザーが音声入力で回答し、正誤判定できる Web アプリ（MVP）。
初期データ（動詞リスト）はアプリに埋め込み。
複数の活用欄（現在・過去・未来など）を最初から実装する。

---

# =============================

# 💾 **データ（アプリ同梱）**

# =============================

アプリ内部に、以下の形式の JSON or CSV を同梱してください。
（どちらでも良いが、パースは自動で行うこと）

### TypeScript型

```ts
export type VerbEntry = {
  base: string;        // 動詞の原型
  meaningJa: string;   // 日本語の意味
  present: string;
  past: string;
  future: string;
  go: string;
  seo: string;
  negative_an: string;
  negative_jian: string;
  possible: string;
};
```

---

# =============================

# 🏗 **必須実装：MVP機能**

# =============================

## 1. **動詞データをアプリ内部から読み込む**

* `korean_verbs_with_meaning.csv` を 起動時に読み込んで state に保持.必要に応じて好きなディレクトリにコピーしてしようしてください

---

## 2. **動詞の出題（複数活用）**

* ランダムに1語を選んで出題
* 画面には **日本語の意味（meaningJa）** を表示
* 以下の **複数活用欄** を出題し、ユーザーが回答する：

### 出題する活用欄（MVP）

* 原型（base）
* 現在（present）
* 過去（past）
* 未来（future）
* 連用（고）
* 連用（서）
* 否定（안）
* 否定（지 않아요）
* 可能

全て入力欄を用意。
各欄に **音声入力ボタン（🎤）** を設置。

---

## 3. **音声入力（Web Speech API）**

* Web Speech API（SpeechRecognition / webkitSpeechRecognition）を使用
* 韓国語認識（ko-KR）
* 認識した文章を input に自動セット

```ts
const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
recognition.lang = "ko-KR";
```

---

## 4. **正誤判定**

* 「採点」ボタンを押すと判定

* 各活用欄ごとに

  * ⭕ 正解
  * ❌ 不正解（正しい回答を表示）

* 次の問題へ進むボタンを用意

---

## 5. **読み上げ（SpeechSynthesis API）**

* 各活用欄の右に「🔊 再生ボタン」を置く
* 正しい韓国語を読み上げる

```ts
const utter = new SpeechSynthesisUtterance(text);
utter.lang = "ko-KR";
speechSynthesis.speak(utter);
```

---

# =============================

# 🎨 **画面構成**

# =============================

## ■ メイン画面（1画面構成でOK）

### 表示内容

* 日本語の意味（大きめに表示）
* 活用ごとの入力欄（全9種類）

  * テキスト入力欄
  * 🎤 音声入力ボタン
  * 🔊 正解読み上げボタン

### 下部に

* 「採点する」ボタン
* 判定結果リスト（⭕/❌）
* 「次の問題へ」ボタン

ルーティング不要。SPAの1ページでOK。

---

# =============================

# 🗂 **フォルダ構成（Claudeが書きやすい形）**

# =============================

```
/src
  /components
    InputRow.tsx          // 活用1行（label, input, mic, speak）
    MicButton.tsx
    SpeakButton.tsx
  /hooks
    useSpeechRecognition.ts
    useSpeechSynthesis.ts
  /data
    verbs.csv or verbs.json
  /utils
    parseCSV.ts
  App.tsx
  main.tsx
```

---

# =============================

# 🔧 **実装ルール（Claude向け）**

# =============================

* React + TypeScript + Vite
* CSS：必要最低限でOK（Tailwindがあると便利だが必須ではない）
* 状態管理は useState で完結
* 音声認識はブラウザ標準 Web Speech API
* 読み上げは SpeechSynthesis API
* 画面は1ページ構成でOK（MVP簡略化）

---

# =============================

# ✨ 実装不要（のちの拡張想定）

# =============================

* 学習履歴
* 出題設定（活用のオン/オフ）
* ランダム出題アルゴリズム高度化
* PWA 対応
* UIデザイン強化

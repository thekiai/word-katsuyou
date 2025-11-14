# 韓国語活用トレーニング Webアプリ

韓国語の動詞活用を音声入力で学習できる Web アプリケーションです。

## 機能

- ランダムに韓国語の動詞を出題
- 複数の活用形式に対応：
  - 原型
  - 現在形
  - 過去形
  - 未来形
  - 連用（고）
  - 連用（서）
  - 否定（안）
  - 否定（지 않아요）
  - 可能
- 音声入力機能（Web Speech API を使用）
- 正解の読み上げ機能（SpeechSynthesis API を使用）
- 即時の正誤判定

## セットアップ

### 必要な環境

- Node.js 18.x 以上
- モダンブラウザ（Chrome、Edge、Safari など）

### インストール

```bash
# 依存関係のインストール
npm install
```

### 開発サーバーの起動

```bash
npm run dev
```

ブラウザで `http://localhost:3000` にアクセスしてください。

### ビルド

```bash
npm run build
```

ビルドされたファイルは `dist` ディレクトリに出力されます。

## 使い方

1. アプリを起動すると、日本語の意味が表示されます
2. 各活用形式の入力欄に韓国語を入力します：
   - キーボードで直接入力
   - 🎤 ボタンをクリックして音声入力
3. 🔊 ボタンをクリックすると、正しい韓国語を読み上げます
4. 全て入力したら「採点する」ボタンをクリック
5. 結果が表示されます（⭕ または ❌）
6. 「次の問題へ」ボタンで新しい問題に進みます

## 技術スタック

- React 18
- TypeScript
- Vite
- Web Speech API（音声認識）
- SpeechSynthesis API（音声合成）

## プロジェクト構造

```
src/
├── components/       # UIコンポーネント
│   ├── InputRow.tsx
│   ├── MicButton.tsx
│   └── SpeakButton.tsx
├── hooks/           # カスタムフック
│   ├── useSpeechRecognition.ts
│   └── useSpeechSynthesis.ts
├── data/            # 動詞データ（CSV）
│   └── korean_verbs_with_meaning.csv
├── utils/           # ユーティリティ関数
│   └── parseCSV.ts
├── types.ts         # TypeScript型定義
├── constants.ts     # 定数
├── App.tsx          # メインコンポーネント
└── main.tsx         # エントリーポイント
```

## ブラウザ互換性

- Chrome / Edge: 完全対応
- Safari: 完全対応
- Firefox: 音声認識は非対応（音声合成のみ利用可能）

## ライセンス

ISC

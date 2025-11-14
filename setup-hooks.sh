#!/bin/sh

# Git hooksをセットアップするスクリプト

echo "🔧 Git hooksをセットアップ中..."

# .githooks/pre-commitを.git/hooks/pre-commitにコピー
cp .githooks/pre-commit .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit

echo "✅ Git hooksのセットアップが完了しました！"
echo "📝 コミット前に自動的にビルドチェックが実行されます。"

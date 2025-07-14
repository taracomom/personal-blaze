#!/bin/bash

echo "🚀 Personal Blaze 起動スクリプト"
echo "================================"

# Node.js バージョン確認
if ! command -v node &> /dev/null; then
    echo "❌ Node.js がインストールされていません"
    echo "   https://nodejs.org/ からインストールしてください"
    exit 1
fi

NODE_VERSION=$(node -v)
echo "✅ Node.js $NODE_VERSION 検出"

# 依存関係のインストール
if [ ! -d "node_modules" ]; then
    echo "📦 依存関係をインストール中..."
    npm install --silent
    if [ $? -ne 0 ]; then
        echo "❌ npm install が失敗しました"
        echo "   以下を試してください:"
        echo "   1. rm -rf node_modules package-lock.json"
        echo "   2. npm cache clean --force"
        echo "   3. npm install"
        exit 1
    fi
else
    echo "✅ node_modules 存在確認"
fi

# ビルド実行
echo "🔨 アプリケーションをビルド中..."
npm run build --silent
if [ $? -ne 0 ]; then
    echo "❌ ビルドが失敗しました"
    exit 1
fi

echo "✅ ビルド完了"

# アプリケーション起動
echo "🎯 Personal Blaze を起動中..."
echo ""
echo "📋 使用方法:"
echo "   1. システムトレイのアイコンをダブルクリック"
echo "   2. または http://localhost:9876 をブラウザで開く"
echo "   3. /trigger でスニペットを作成・展開"
echo ""
echo "⏹️  終了: Ctrl+C"
echo ""

npm start
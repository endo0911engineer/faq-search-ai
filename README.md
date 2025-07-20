# faq-search-ai

ナレッジやFAQを簡単に登録・検索できる軽量なナレッジ検索アプリです。現在はテキストデータの手動入力によってナレッジを蓄積していますが、pdfファイルや音声データをナレッジに変換するような拡張も考えております。

## 主な機能
- ユーザー認証
- ナレッジの登録・編集・削
- ナレッジの検索

## システム構成
- **Frontend:** Next.js
- **Backend:** Go 
- **DB:** SQLite (ユーザー・FAQ管理)
- **Vector DB:** Qdrant (類似FAQ検索)
- **LLM:** OpenRouter 経由で Mistral 7B を呼び出し回答を作成。

## デモ
[![Demo Video](https://img.youtube.com/vi/17-H9nIBfpU/hqdefault.jpg)](https://www.youtube.com/watch?v=17-H9nIBfpU)

```
[Frontend (Next.js)]
        |
        | HTTP (Bearer Token)
        v
[Backend (Go API)] -----> [Qdrant (Vector Search)]
        |
        v
[SQLite]     [LLM (Mistral via OpenRouter)]
```

## 主要ディレクトリ構成
```text
faq-search-ai/
├── cmd/
│   └── server/           
│       └── main.go
|       |__ router.go  # 各エンドポイント定義
├── internal/
│   ├── config/             
│   │   ├── config.go
│   │   └── database.go
│   ├── auth/            
│   │   └── middleware.go
|   |   |__ handler.go # 認証関連のハンドラー
|   |   |__ integration_test.go # 認証の一連の機能が動作するかのテスト 
|   |   |__ jwt.go
|   |   |__ hash.go
|   |   |__ model.go
|   |   |__ repository.go
|   |   |__ service.go
|   |  
│   ├── faq/      
│   │   └── handler.go # FAQ関連の処理のハンドラー
|   |   |__ model.go
|   |   |__ repository.go
│   ├── llm/            
│   │   └── llm.go # LLMの設定
│   └── middleware/           
│   |   └── withcors.go
|   |__ vector/
|       |__ qdrant.go # qdrantの設定
|
├── ui/                   
│   └── app/
|       |__knowledge/
|           |__ page.tsx # ナレッジ登録・検索画面
|       |__signin/
|           |__ page.tsx # 
|       |__signup/
|           |__ page.tsx
|       |__ page.tsx # ホーム画面
```

## 環境セットアップ
``` bash
git clone https://github.com//endo0911engineer/faq-search-ai
cd faq-search-ai
```
以下のようなenvファイルを作成

ルートディレクトリの.env
``` bash
PORT=8080
JWT_SECRET=your-very-secure-secret
QDRANT_URL=http://qdrant:6333
DATABASE_URL=file:auth.db?cache=shared&mode=rwc
OPENROUTER_API_KEY=your-api-key
OPENAI_API_KEY=your-api-key
```
フロントエンド用の.env 
./ui/.env
```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
```

Dockerで立ち上げる
```bash
docker compose up --build
```
ブラウザで以下にアクセスしてください:

フロントエンド: http://localhost:3000

バックエンドAPI: http://localhost:8080

Qdrant ダッシュボード: http://localhost:6333/dashboard





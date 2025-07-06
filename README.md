# faq-search-ai

ナレッジやFAQを簡単に登録・検索できる軽量なナレッジ検索アプリです。小規模チームや個人利用に最適です。

## 技術スタック
Frontend: Next.js, TypeScript, Tailwind CSS
Backend: Go, SQLite
LLM/Embedding/VectorDB: mistral,OpenAi embedding, qdrant

## 主な機能
- ユーザー認証
- ナレッジの登録・編集・削
- ナレッジの検索

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
|   |   |__ handler.go
|   |   |__ jwt.go
|   |   |__ hash.go
|   |   |__ model.go
|   |   |__ repository.go
|   |   |__ service.go
|   |  
│   ├── faq/      
│   │   └── handler.go
|   |   |__ model.go
|   |   |__ repository.go
│   ├── llm/            
│   │   └── llm.go
│   └── middleware/           
│   |   └── withcors.go
|   |__ vector/
|       |__ qdrant.go
|
├── ui/                   
│   └── app/
|       |__knowledge/
|           |__ page.tsx
|       |__login/
|           |__ page.tsx
|       |__signup/
|           |__ page.tsx
|       |__ page.tsx 
```

``` bash
git clone https://github.com//endo0911engineer/faq-search-ai
cd faq-search-ai

# 環境変数の設定
cp .env.example .env

# 
```


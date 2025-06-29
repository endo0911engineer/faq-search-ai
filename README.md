アプリの使い方（FAQ作成SaaS）
このアプリの基本的な使い方は以下の通りです：

1. ユーザーはログイン・サインアップする
すでに実装されている /signup および /login を使用します。

2. FAQの作成
任意の質問・回答・言語を入力して POST /faqs に送信することでFAQが登録されます。

例えば「Q: サービスの利用料金は？ / A: 基本無料です」など、よくある質問を登録できます。

3. FAQの取得・一覧表示
全FAQを表示するには GET /faqs

特定のFAQを取得するには GET /faqs/{id}

4. FAQの編集・削除
編集: PUT /faqs/{id}

削除: DELETE /faqs/{id}

このSaaSが提供する価値
企業や個人開発者が自分のWebサービスやAPIのFAQを簡単に作成・管理・表示できるようになります。特に以下のような場面で役立ちます：

プロダクトの問い合わせ対応負担を減らしたい

多言語対応のFAQを管理したい

自動FAQ生成やLLMと組み合わせてアップグレードしたい

UIの起動方法

latency-lens/
├── cmd/
│   └── server/           # アプリケーションのエントリ
│       └── main.go
|       |__ router.go
├── internal/
│   ├── api/              # HTTPハンドラなどAPI層
│   │   ├── handler.go
│   │   └── middleware.go
│   ├── auth/             # APIキー認証などの認証ロジッ
|   |
│   │   └── middleware.go
|   |   |__ handler.go
|   |   |__ jwt.go
|   |   |__ hash.go
|   |   |__ model.go
|   |   |__ repository.go
|   |   |__ service.go
|   |  
│   ├── collector/        # 計測したリクエストの保存・取得
│   │   └── collector.go
│   ├── stats/            # P50, P95, P99 などの統計計算
│   │   └── stats.go
│   └── config/           # 設定・APIキー管理など
│       └── config.go
|       |__ database.go
|   |
|   |__ monitor/
|       |__ handler.go
|       |__ model.go
|       |__ repository.go
|       |__ service.go
|
├── ui/                   
│   └── next.jsコンポーネント
├── go.mod
└── README.md


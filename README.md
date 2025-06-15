1. Go SDK
軽量な Record(label string, startTime time.Time) 関数

HTTPミドルウェアまたはgRPC Interceptor

バッファ＋非同期送信（シンプルなHTTP POST）

2. メトリクス収集API
/v1/collect エンドポイントでレイテンシ情報を受信

payload: { label, duration, timestamp, metadata }

認証はMVPでは簡易なAPIキー方式でOK

3. メトリクス集計・保存
In-Memoryまたは簡易DB（SQLiteなど）で集計

各ラベルに対して、P50 / P95 / P99 / Countを算出

4. フロントエンドUI
ダッシュボードで以下を表示：

ラベル別のP50 / P95 / P99 / Count

自動リフレッシュ（2秒ごと）

手動で /hello 等にリクエストできるUI

5. 簡単なセットアップガイド
READMEまたはWeb UIに以下を明記：

SDK導入方法

データ送信の仕組み

UIの起動方法

latency-lens/
├── cmd/
│   └── server/           # アプリケーションのエントリポイント
│       └── main.go
├── internal/
│   ├── api/              # HTTPハンドラなどAPI層
│   │   ├── handler.go
│   │   └── middleware.go
│   ├── auth/             # APIキー認証などの認証ロジック
│   │   └── middleware.go
│   ├── collector/        # 計測したリクエストの保存・取得
│   │   └── collector.go
│   ├── stats/            # P50, P95, P99 などの統計計算
│   │   └── stats.go
│   └── config/           # 設定・APIキー管理など
│       └── config.go
├── ui/                   
│   └── next.jsコンポーネント
├── go.mod
└── README.md


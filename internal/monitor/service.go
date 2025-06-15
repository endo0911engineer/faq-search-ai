package monitor

import "database/sql"

// 監視対象URLの登録などのビジネスロジックをここに集約
func RegisterMonitoredURL(db *sql.DB, url MonitoredURL) error {
	// 将来的にバリデーションや他の処理をここに追加可能
	return InsertMonitoredURL(db, url)
}

package monitor

import (
	"database/sql"
	"errors"
	"net/url"
)

// 監視対象URLの登録などのビジネスロジック
func RegisterMonitoredURL(db *sql.DB, m MonitoredURL) error {
	if _, err := url.ParseRequestURI(m.URL); err != nil {
		return errors.New("invalid URL format")
	}

	// 重複チェック（同一ユーザーが同じURLを既に登録しているか）
	exists, err := IsURLAlreadyMonitored(db, m.UserID, m.URL)
	if err != nil {
		return err
	}
	if exists {
		return errors.New("URL already monitored")
	}

	return InsertMonitoredURL(db, m)
}

func DeleteMonitoredURL(db *sql.DB, userID int64, url string) error {
	_, err := db.Exec(`
		DELETE FROM monitored_urls
		WHERE user_id = ? AND url = ?
	`, userID, url)
	return err
}

func IsURLAlreadyMonitored(db *sql.DB, userID int64, url string) (bool, error) {
	row := db.QueryRow(`
		SELECT COUNT(1)
		FROM monitored_urls
		WHERE user_id = ? AND url = ?
	`, userID, url)

	var count int
	if err := row.Scan(&count); err != nil {
		return false, err
	}
	return count > 0, nil
}

func ListMonitoredURLs(db *sql.DB, userID int64) ([]MonitoredURL, error) {
	rows, err := db.Query(`
		SELECT id, user_id, url, label
		FROM monitored_urls
		WHERE user_id = ?
	`, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var urls []MonitoredURL
	for rows.Next() {
		var m MonitoredURL
		if err := rows.Scan(&m.ID, &m.UserID, &m.URL, &m.Label); err != nil {
			return nil, err
		}
		urls = append(urls, m)
	}
	return urls, nil
}

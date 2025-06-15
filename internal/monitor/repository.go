package monitor

import "database/sql"

func InsertMonitoredURL(db *sql.DB, url MonitoredURL) error {
	_, err := db.Exec(
		"INSERT INTO monitored_urls (user_id, url, label) VALUES (?, ?, ?)",
		url.UserID, url.URL, url.Label,
	)
	return err
}

func GetMonitoredURLsByUser(db *sql.DB, userID int64) ([]MonitoredURL, error) {
	rows, err := db.Query("SELECT id, user_id, url, label FROM monitored_urls WHERE user_id = ?", userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var urls []MonitoredURL
	for rows.Next() {
		var u MonitoredURL
		if err := rows.Scan(&u.ID, &u.UserID, &u.URL, &u.Label); err != nil {
			return nil, err
		}
		urls = append(urls, u)
	}
	return urls, nil
}

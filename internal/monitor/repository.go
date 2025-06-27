package monitor

import "database/sql"

func InsertMonitoredURL(db *sql.DB, url MonitoredURL) error {
	_, err := db.Exec(
		"INSERT INTO monitored_urls (user_id, url, label, active) VALUES (?, ?, ?, ?)",
		url.UserID, url.URL, url.Label, true,
	)
	return err
}

func GetMonitoredURLsByUser(db *sql.DB, userID int64) ([]MonitoredURL, error) {
	rows, err := db.Query("SELECT id, user_id, url, label, monitored_urls FROM monitored_urls WHERE user_id = ?", userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var urls []MonitoredURL
	for rows.Next() {
		var u MonitoredURL
		if err := rows.Scan(&u.ID, &u.UserID, &u.URL, &u.Label, &u.Active); err != nil {
			return nil, err
		}
		urls = append(urls, u)
	}
	return urls, nil
}

func UpdateMonitoredURLActiveStatus(db *sql.DB, userID int64, urlID int64, active bool) error {
	_, err := db.Exec(`
		UPDATE monitored_urls
		SET active = ?
		WHERE id = ? AND user_id = ?
	`, active, urlID, userID)
	return err
}

func ListActiveMonitoredURLs(db *sql.DB) ([]MonitoredURL, error) {
	rows, err := db.Query(`
		SELECT id, user_id, url, label
		FROM monitored_urls
		WHERE active = 1
	`)
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

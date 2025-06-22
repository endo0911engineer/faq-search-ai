package monitor

type MonitoredURL struct {
	ID     int64  `json:"id"`
	UserID int64  `json:"user_id"`
	URL    string `json:"url"`
	Label  string `json:"label"`
	Active bool   `json:"active"`
}

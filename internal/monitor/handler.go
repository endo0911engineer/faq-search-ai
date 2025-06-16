package monitor

import (
	"database/sql"
	"encoding/json"
	"net/http"
)

// Assume we have a way to get userID from context or middleware
func HandleAddMonitoredURL(db *sql.DB) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// 認証済みユーザーIDを取得する（例: contextから）
		userID, ok := r.Context().Value("userID").(int64)
		if !ok {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}

		var req struct {
			URL   string `json:"url"`
			Label string `json:"label"`
		}
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, "Invalid request body", http.StatusBadRequest)
			return
		}

		err := RegisterMonitoredURL(db, MonitoredURL{
			UserID: userID,
			URL:    req.URL,
			Label:  req.Label,
		})
		if err != nil {
			http.Error(w, "Failed to register URL", http.StatusInternalServerError)
			return
		}

		w.WriteHeader(http.StatusCreated)
	})
}

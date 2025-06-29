package faq

import (
	"database/sql"
	"errors"
)

func GetFAQsByUser(db *sql.DB, userID int64) ([]FAQ, error) {
	rows, err := db.Query(`
		SELECT id, question, answer, created_at, updated_at
		FROM faqs WHERE user_id = ? ORDER BY created_at DESC`, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var faqs []FAQ
	for rows.Next() {
		var f FAQ
		err := rows.Scan(&f.ID, &f.Question, &f.Answer, &f.CreatedAt, &f.UpdatedAt)
		if err != nil {
			return nil, err
		}
		faqs = append(faqs, f)
	}
	return faqs, nil
}

func CreateFAQ(db *sql.DB, userID int64, question, answer string) error {
	_, err := db.Exec(`
		INSERT INTO faqs (user_id, question, answer)
		VALUES (?, ?, ?)`, userID, question, answer)
	return err
}

func GetFAQByID(db *sql.DB, id, userID int64) (*FAQ, error) {
	var f FAQ
	err := db.QueryRow(`SELECT id, user_id, question, answer FROM faqs WHERE id = ? AND user_id = ?`, id, userID).
		Scan(&f.ID, &f.UserID, &f.Question, &f.Answer)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}
	return &f, nil
}

func UpdateFAQ(db *sql.DB, f *FAQ) error {
	result, err := db.Exec(`UPDATE faqs SET question = ?, answer = ? WHERE id = ? AND user_id = ?`, f.Question, f.Answer, f.ID, f.UserID)
	if err != nil {
		return err
	}
	affected, err := result.RowsAffected()
	if err != nil {
		return err
	}
	if affected == 0 {
		return errors.New("no rows updated")
	}
	return nil
}

func DeleteFAQ(db *sql.DB, id, userID int64) error {
	result, err := db.Exec(`DELETE FROM faqs WHERE id = ? AND user_id = ?`, id, userID)
	if err != nil {
		return err
	}
	affected, err := result.RowsAffected()
	if err != nil {
		return err
	}
	if affected == 0 {
		return errors.New("no rows deleted")
	}
	return nil
}

package faq

import (
	"database/sql"
	"errors"
	"faq-search-ai/internal/model"
	"faq-search-ai/internal/vector"
	"fmt"
	"time"

	"github.com/google/uuid"
)

func GetFAQsByUser(db *sql.DB, userID int64) ([]model.FAQ, error) {
	rows, err := db.Query(`
		SELECT id, user_id, question, answer, created_at, updated_at
		FROM faqs WHERE user_id = ? ORDER BY created_at DESC`, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var faqs []model.FAQ
	for rows.Next() {
		var f model.FAQ
		err := rows.Scan(&f.ID, &f.UserID, &f.Question, &f.Answer, &f.CreatedAt, &f.UpdatedAt)
		if err != nil {
			return nil, err
		}
		faqs = append(faqs, f)
	}

	if faqs == nil {
		faqs = []model.FAQ{}
	}
	return faqs, nil
}

func CreateFAQ(db *sql.DB, id string, userID int64, question, answer string) error {
	now := time.Now()
	_, err := db.Exec(`
		INSERT INTO faqs (id, user_id, question, answer, created_at, updated_at)
		VALUES (?, ?, ?, ?, ?, ?)`, id, userID, question, answer, now, now)
	return err
}

func GetFAQByID(db *sql.DB, id string, userID int64) (*model.FAQ, error) {
	var f model.FAQ
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

func UpdateFAQ(db *sql.DB, faq *model.FAQ) error {
	result, err := db.Exec(`UPDATE faqs SET question = ?, answer = ? WHERE id = ? AND user_id = ?`, faq.Question, faq.Answer, faq.ID, faq.UserID)
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

	// 2. Qdrantを更新（再アップサート）
	vectorData, err := vector.GenerateEmbedding(faq.Question)
	if err != nil {
		return err
	}
	return vector.UpsertToQdrant(faq.ID, faq.UserID, faq.Question, faq.Answer, vectorData)
}

func DeleteFAQ(db *sql.DB, id string, userID int64) error {
	// 1. DBから削除
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

	// 2. Qdrantから削除
	if err := vector.DeleteFromQdrant(id); err != nil {
		return fmt.Errorf("deleted from DB but failed to delete from Qdrant: %w", err)
	}

	return nil
}

func CreateFAQWithVector(db *sql.DB, userID int64, question, answer string) error {
	// 1. DBに登録
	id := uuid.New().String()
	if err := CreateFAQ(db, id, userID, question, answer); err != nil {
		return err
	}

	// 2. 質問をベクトル化
	vectorData, err := vector.GenerateEmbedding(question)
	if err != nil {
		return err
	}

	// 3. Qdrantに登録
	if err := vector.UpsertToQdrant(id, userID, question, answer, vectorData); err != nil {
		return err
	}

	return nil
}

package vector

import (
	"bytes"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
)

type QdrantPoint struct {
	ID      string                 `json:"id"`
	Vector  []float64              `json:"vector"`
	Payload map[string]interface{} `json:"payload"`
}

type QdrantUpsertRequest struct {
	Points []QdrantPoint `json:"points"`
}

type EmbeddingRequest struct {
	Input string `json:"input"`
	Model string `json:"model"`
}

type EmbeddingResponse struct {
	Data []struct {
		Embedding []float64 `json:"embedding"`
	} `json:"data"`
}

type QdrantSearchRequest struct {
	Vector      []float64      `json:"vector"`
	Limit       int            `json:"limit"`
	Filter      map[string]any `json:"filter,omitempty"`
	WithPayload bool           `json:"with_payload"`
}

type QdrantSearchResponse struct {
	Result []struct {
		Payload map[string]interface{} `json:"payload"`
	} `json:"result"`
}

type FAQ struct {
	Question string `json:"question"`
	Answer   string `json:"answer"`
}

// GenerateEmbedding converts text to vector via embedding API (e.g., OpenRouter)
func GenerateEmbedding(text string) ([]float64, error) {
	body := EmbeddingRequest{
		Input: text,
		Model: "text-embedding-ada-002",
	}
	b, _ := json.Marshal(body)

	req, _ := http.NewRequest("POST", "https://openrouter.ai/api/v1/embeddings", bytes.NewBuffer(b))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+os.Getenv("OPENROUTER_API_KEY"))

	res, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer res.Body.Close()

	var parsed EmbeddingResponse
	if err := json.NewDecoder(res.Body).Decode(&parsed); err != nil {
		return nil, err
	}

	if len(parsed.Data) == 0 {
		return nil, fmt.Errorf("no embedding returned")
	}
	return parsed.Data[0].Embedding, nil
}

// UpsertToQdrant saves a vector with metadata to Qdrant
func UpsertToQdrant(id string, userID int64, question string, vector []float64) error {
	point := QdrantPoint{
		ID:     id,
		Vector: vector,
		Payload: map[string]interface{}{
			"user_id":  userID,
			"question": question,
		},
	}

	payload := QdrantUpsertRequest{
		Points: []QdrantPoint{point},
	}
	b, _ := json.Marshal(payload)

	url := fmt.Sprintf("http://localhost:6333/collections/faq_vectors/points?wait=true")
	req, _ := http.NewRequest("PUT", url, bytes.NewBuffer(b))
	req.Header.Set("Content-Type", "application/json")

	res, err := http.DefaultClient.Do(req)
	if err != nil {
		return err
	}
	defer res.Body.Close()

	if res.StatusCode != http.StatusOK {
		log.Printf("Qdrant returned status: %d", res.StatusCode)
		return fmt.Errorf("failed to upsert to qdrant")
	}
	return nil
}

// DeleteFromQdrant removes a point from Qdrant by ID
func DeleteFromQdrant(id string) error {
	payload := map[string]interface{}{
		"points": []string{id},
	}
	b, _ := json.Marshal(payload)

	url := "http://localhost:6333/collections/faq_vectors/points/delete?wait=true"
	req, _ := http.NewRequest("POST", url, bytes.NewBuffer(b))
	req.Header.Set("Content-Type", "application/json")

	res, err := http.DefaultClient.Do(req)
	if err != nil {
		return err
	}
	defer res.Body.Close()

	if res.StatusCode != http.StatusOK {
		log.Printf("Qdrant deletion failed: %d", res.StatusCode)
		return fmt.Errorf("failed to delete from Qdrant")
	}
	return nil
}

func SearchSimilarFAQs(vector []float64, userID int64, topK int) ([]string, error) {
	query := map[string]interface{}{
		"vector": vector,
		"filter": map[string]interface{}{
			"must": []map[string]interface{}{
				{
					"key":   "user_id",
					"match": map[string]interface{}{"value": userID},
				},
			},
		},
		"limit": topK,
	}

	body, _ := json.Marshal(query)

	req, _ := http.NewRequest("POST", "http://localhost:6333/collections/faq_vectors/points/search", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")

	res, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer res.Body.Close()

	var result struct {
		Result []struct {
			ID      interface{}            `json:"id"`
			Payload map[string]interface{} `json:"payload"`
		} `json:"result"`
	}

	if err := json.NewDecoder(res.Body).Decode(&result); err != nil {
		return nil, err
	}

	var faqs []string
	for _, r := range result.Result {
		if q, ok := r.Payload["question"].(string); ok {
			faqs = append(faqs, q)
		}
	}
	return faqs, nil
}

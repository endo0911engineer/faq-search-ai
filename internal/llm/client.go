package llm

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
)

const openRouterURL = "https://openrouter.ai/api/v1/chat/completions"
const model = "mistralai/mistral-7b-instruct"

type Message struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

type RequestPayload struct {
	Model    string    `json:"model"`
	Messages []Message `json:"messages"`
}

type ResponsePayload struct {
	Choices []struct {
		Message Message `json:"message"`
	} `json:"choices"`
}

func AnalyzeLatencyWithOpenRouter(prompt string) (string, error) {
	apiKey := os.Getenv("OPENROUTER_API_KEY")
	if apiKey == "" {
		return "", fmt.Errorf("missing OPENROUTER_API_KEY")
	}

	payload := RequestPayload{
		Model: model,
		Messages: []Message{
			{Role: "system", Content: "You are an expert latency performance advisor. Analyze the following latency stats and suggest improvements."},
			{Role: "user", Content: prompt},
		},
	}

	b, err := json.Marshal(payload)
	if err != nil {
		return "", err
	}

	req, err := http.NewRequest("POST", openRouterURL, bytes.NewBuffer(b))
	if err != nil {
		return "", err
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+apiKey)

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		bodyBytes, _ := io.ReadAll(resp.Body)
		return "", fmt.Errorf("OpenRouter API error: %s", string(bodyBytes))
	}

	var res ResponsePayload
	if err := json.NewDecoder(resp.Body).Decode(&res); err != nil {
		return "", err
	}
	if len(res.Choices) == 0 {
		return "", fmt.Errorf("no response from OpenRouter")
	}

	return res.Choices[0].Message.Content, nil
}

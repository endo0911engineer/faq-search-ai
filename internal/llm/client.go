package llm

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"os"
)

type Client interface {
	ExtractURL(message string) (string, error)
}

type MistralClient struct {
	APIKey string
}

type openRouterRequest struct {
	Model    string `json:"model"`
	Messages []struct {
		Role    string `json:"role"`
		Content string `json:"content"`
	} `json:"messages"`
}

type openRouterResponse struct {
	Choices []struct {
		Message struct {
			Content string `json:"content"`
		} `json:"message"`
	} `json:"choices"`
}

func NewClient() *MistralClient {
	return &MistralClient{
		APIKey: os.Getenv("LLM_API_KEY"),
	}
}

func (c *MistralClient) ExtractURL(message string) (string, error) {
	reqBody := openRouterRequest{
		Model: "mistral:7b-instruct", // OpenRouter 経由のモデル名
		Messages: []struct {
			Role    string `json:"role"`
			Content string `json:"content"`
		}{
			{
				Role:    "system",
				Content: "あなたはユーザーからの自然言語を受け取り、文中から1つのURLを抽出するアシスタントです。URL以外の文字列を含めず、1つの完全なURLだけを返してください。",
			},
			{
				Role:    "user",
				Content: message,
			},
		},
	}

	data, err := json.Marshal(reqBody)
	if err != nil {
		return "", err
	}

	req, err := http.NewRequest("POST", "https://openrouter.ai/api/v1/chat/completions", bytes.NewBuffer(data))
	if err != nil {
		return "", err
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", c.APIKey))

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		bodyBytes, _ := io.ReadAll(resp.Body)
		return "", fmt.Errorf("LLM API error: %s", string(bodyBytes))
	}

	var response openRouterResponse
	if err := json.NewDecoder(resp.Body).Decode(&response); err != nil {
		return "", err
	}

	if len(response.Choices) == 0 {
		return "", errors.New("no response from LLM")
	}

	url := response.Choices[0].Message.Content
	return url, nil
}

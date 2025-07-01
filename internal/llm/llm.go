package llm

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
)

type MistralRequest struct {
	Model    string    `json:"model"`
	Messages []Message `json:"messages"`
}

type Message struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

type MistralResponse struct {
	Choices []struct {
		Message Message `json:"message"`
	} `json:"choices"`
}

// GenerateAnswerWithMistral takes a question and relevant FAQs, and returns an answer from the LLM
func GenerateAnswerWithMistral(question string, faqs []string) (string, error) {
	context := "以下はユーザーから登録されたFAQです：\n\n"
	for _, faq := range faqs {
		context += "- " + faq + "\n"
	}

	context += "\nユーザーの質問に対して、上記FAQを参考にわかりやすく回答してください。\n\n"

	reqBody := MistralRequest{
		Model: "mistralai/mistral-7b-instruct:free", // OpenRouterで使用可能なモデル名
		Messages: []Message{
			{
				Role:    "system",
				Content: "あなたはFAQの知識ベースに基づいて質問に回答するAIアシスタントです。",
			},
			{
				Role:    "user",
				Content: context + "質問: " + question,
			},
		},
	}

	b, _ := json.Marshal(reqBody)

	req, _ := http.NewRequest("POST", "https://openrouter.ai/api/v1/chat/completions", bytes.NewBuffer(b))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+os.Getenv("OPENROUTER_API_KEY"))

	res, err := http.DefaultClient.Do(req)
	if err != nil {
		return "", err
	}
	defer res.Body.Close()

	bodyBytes, err := io.ReadAll(res.Body)
	if err != nil {
		return "", err
	}

	if res.StatusCode != http.StatusOK {
		return "", fmt.Errorf("OpenRouter error: %s", string(bodyBytes))
	}

	var parsed MistralResponse
	if err := json.Unmarshal(bodyBytes, &parsed); err != nil {
		return "", err
	}

	if len(parsed.Choices) == 0 {
		return "", fmt.Errorf("no response from Mistral")
	}

	return parsed.Choices[0].Message.Content, nil
}

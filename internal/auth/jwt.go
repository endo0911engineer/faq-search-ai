package auth

import (
	"fmt"
	"os"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

func GenerateJWT(userID int64, username string) (string, error) {
	secret := os.Getenv("JWT_SECRET")
	claims := jwt.MapClaims{
		"user_id":  userID,
		"username": username,
		"exp":      time.Now().Add(time.Hour * 72).Unix(),
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(secret))
}

func ParseJWT(tokenStr string) (int64, string, error) {
	secret := os.Getenv("JWT_SECRET")
	token, err := jwt.Parse(tokenStr, func(token *jwt.Token) (interface{}, error) {
		return []byte(secret), nil
	})
	if err != nil || !token.Valid {
		return 0, "", err
	}

	if claims, ok := token.Claims.(jwt.MapClaims); ok {
		userIDFloat, ok := claims["user_id"].(float64)
		if !ok {
			return 0, "", fmt.Errorf("user_id not found or not float64")
		}
		username, _ := claims["username"].(string)
		return int64(userIDFloat), username, nil
	}
	return 0, "", fmt.Errorf("invalid token claims")
}

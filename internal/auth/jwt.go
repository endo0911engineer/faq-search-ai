package auth

import (
	"os"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

func GenerateJWT(userID string, username string) (string, error) {
	secret := os.Getenv("JWT_SECRET")
	claims := jwt.MapClaims{
		"user_id":  userID,
		"username": username,
		"exp":      time.Now().Add(time.Hour * 72).Unix(),
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(secret))
}

func ParseJWT(tokenStr string) (string, string, error) {
	secret := os.Getenv("JWT_SECRET")
	token, err := jwt.Parse(tokenStr, func(token *jwt.Token) (interface{}, error) {
		return []byte(secret), nil
	})
	if err != nil || !token.Valid {
		return "", "", err
	}

	if claims, ok := token.Claims.(jwt.MapClaims); ok {
		userID, _ := claims["user_id"].(string)
		username, _ := claims["username"].(string)
		return userID, username, nil
	}
	return "", "", err
}

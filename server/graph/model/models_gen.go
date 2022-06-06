// Code generated by github.com/99designs/gqlgen, DO NOT EDIT.

package model

type Market struct {
	LeftCoin  string `json:"leftCoin"`
	RightCoin string `json:"rightCoin"`
}

type NewSession struct {
	Signature string `json:"signature"`
	Message   string `json:"message"`
}

type NewStopLossFollower struct {
	TradeID              string  `json:"tradeID"`
	IfollowUpPercent     float64 `json:"ifollowUpPercent"`
	InitialStopLossPrice float64 `json:"initialStopLossPrice"`
}

type NewTrade struct {
	LeftCoin       string   `json:"leftCoin"`
	RightCoin      string   `json:"rightCoin"`
	AmountLeftCoin float64  `json:"amountLeftCoin"`
	MarketBuy      bool     `json:"marketBuy"`
	BuyPrice       *float64 `json:"buyPrice"`
}

type StopLossFollower struct {
	Trade                *Trade  `json:"trade"`
	FollowUpPercent      float64 `json:"followUpPercent"`
	InitialStopLossPrice float64 `json:"initialStopLossPrice"`
	CurrentStopLossPrice float64 `json:"currentStopLossPrice"`
	SoldTime             *string `json:"soldTime"`
}

type Todo struct {
	ID   string `json:"id"`
	Text string `json:"text"`
	Done bool   `json:"done"`
	User *User  `json:"user"`
}

type Trade struct {
	ID             string  `json:"id"`
	LeftCoin       string  `json:"leftCoin"`
	RightCoin      string  `json:"rightCoin"`
	AmountLeftCoin float64 `json:"amountLeftCoin"`
	CreationTime   string  `json:"creationTime"`
	BuyPrice       float64 `json:"buyPrice"`
}

type User struct {
	ID   string `json:"id"`
	Name string `json:"name"`
}

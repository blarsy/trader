package data

import (
	"blarsy/traderServer/graph/model"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"time"

	"github.com/google/uuid"
)

type DataFacade struct {
	LocalFile *LocalFile
}

func (dataFacade *DataFacade) Init() {
	var localFile = LocalFile{FileName: "./data/data.json"}
	localFile.Init()
	dataFacade.LocalFile = &localFile
}

type LocalFile struct {
	FileName    string
	FileContent RootData
}

type RootData struct {
	Markets []MarketData `json:"markets"`
	Trades  []TradeData  `json:"trades"`
}

type TradeData struct {
	Id             string  `json:"id"`
	LeftCoin       string  `json:"leftCoin"`
	RightCoin      string  `json:"rightCoin"`
	AmountLeftCoin float64 `json:"amountLeftCoin"`
	CreationTime   int64   `json:"creationTime"`
	BuyPrice       float64 `json:"buyPrice"`
}

type MarketData struct {
	LeftCoin  string
	RightCoin string
}

func (marketData *MarketData) UnmarshalJSON(data []byte) error {
	var val []interface{}
	if err := json.Unmarshal(data, &val); err != nil {
		fmt.Printf("Error while decoding market data %v\n", err)
		return err
	}
	marketData.LeftCoin = val[0].(string)
	marketData.RightCoin = val[1].(string)
	return nil
}

func (localFile *LocalFile) Init() {
	err := localFile.loadFileContent(localFile.FileName)
	if err != nil {
		panic(fmt.Errorf("error loading data file: %v", err))
	}
}

func (localFile *LocalFile) GetTrades() ([]*model.Trade, error) {
	result := make([]*model.Trade, 0, len(localFile.FileContent.Trades))
	for _, rawTrade := range localFile.FileContent.Trades {
		result = append(result, &model.Trade{
			LeftCoin:       rawTrade.LeftCoin,
			RightCoin:      rawTrade.RightCoin,
			ID:             string(rawTrade.Id),
			AmountLeftCoin: rawTrade.AmountLeftCoin,
			CreationTime:   string(rune(rawTrade.CreationTime)),
			BuyPrice:       rawTrade.BuyPrice,
		})
	}
	return result, nil
}

func (localFile *LocalFile) CreateTrade(newTrade *model.NewTrade) (string, error) {
	id := uuid.New().String()
	localFile.FileContent.Trades = append(localFile.FileContent.Trades, TradeData{
		Id:             id,
		LeftCoin:       newTrade.LeftCoin,
		RightCoin:      newTrade.RightCoin,
		AmountLeftCoin: newTrade.AmountLeftCoin,
		BuyPrice:       *newTrade.BuyPrice,
		CreationTime:   time.Now().Unix() * 1000,
	})
	contentToWrite, err := json.MarshalIndent(localFile.FileContent, "", "  ")
	if err != nil {
		return "", err
	}
	ioutil.WriteFile(localFile.FileName, contentToWrite, 0644)
	return id, nil
}

func (localFile *LocalFile) GetMarkets() ([]*model.Market, error) {
	result := make([]*model.Market, 0, len(localFile.FileContent.Markets))
	for _, rawMarket := range localFile.FileContent.Markets {
		result = append(result, &model.Market{LeftCoin: rawMarket.LeftCoin, RightCoin: rawMarket.RightCoin})
	}
	return result, nil
}

func (localFile *LocalFile) loadFileContent(fileName string) error {
	content, err := ioutil.ReadFile(fileName)
	if err != nil {
		return err
	}

	err = json.Unmarshal(content, &localFile.FileContent)
	if err != nil {
		return err
	}
	return nil
}

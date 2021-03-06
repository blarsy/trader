package data

import (
	"blarsy/traderServer/graph/model"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"strconv"
	"time"

	"github.com/google/uuid"
)

type DataFacade struct {
	LocalFile *LocalFile
	Binance   *BinanceFacade
}

func (dataFacade *DataFacade) Init() error {
	var localFile = LocalFile{FileName: "./data/data.json"}
	localFile.Init()
	dataFacade.LocalFile = &localFile

	var binance = BinanceFacade{}
	binanceInitErr := binance.Init()
	if binanceInitErr != nil {
		return binanceInitErr
	}
	dataFacade.Binance = &binance
	return nil
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
	Market         string  `json:"market"`
	AmountLeftCoin float64 `json:"amountLeftCoin"`
	CreationTime   int64   `json:"creationTime"`
	BuyPrice       float64 `json:"buyPrice"`
}

type MarketData struct {
	Coin string `json:"coin"`
	Pair string `json:"pair"`
}

func (localFile *LocalFile) Init() {
	err := localFile.loadFileContent(localFile.FileName)
	if err != nil {
		panic(fmt.Errorf("error loading data file: %v", err))
	}

}

func (localFile *LocalFile) GetTrades(id *string) ([]*model.Trade, error) {
	var result []*model.Trade

	if id != nil {
		for _, rawTrade := range localFile.FileContent.Trades {
			if rawTrade.Id == *id {
				result = []*model.Trade{{
					Market:         rawTrade.Market,
					ID:             string(rawTrade.Id),
					AmountLeftCoin: rawTrade.AmountLeftCoin,
					CreationTime:   strconv.FormatInt(rawTrade.CreationTime, 10),
					BuyPrice:       rawTrade.BuyPrice,
				}}
				break
			}
		}
	} else {
		result = make([]*model.Trade, 0, len(localFile.FileContent.Trades))
		for _, rawTrade := range localFile.FileContent.Trades {
			result = append(result, &model.Trade{
				Market:         rawTrade.Market,
				ID:             string(rawTrade.Id),
				AmountLeftCoin: rawTrade.AmountLeftCoin,
				CreationTime:   strconv.FormatInt(rawTrade.CreationTime, 10),
				BuyPrice:       rawTrade.BuyPrice,
			})
		}
	}
	return result, nil
}

func (localFile *LocalFile) CreateTrade(newTrade *model.NewTrade) (string, error) {
	id := uuid.New().String()
	localFile.FileContent.Trades = append(localFile.FileContent.Trades, TradeData{
		Id:             id,
		Market:         newTrade.Market,
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
		result = append(result, &model.Market{
			Coin: rawMarket.Coin,
			Pair: rawMarket.Pair,
		})
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

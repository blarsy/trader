package data

import (
	"blarsy/traderServer/binance"
	"blarsy/traderServer/graph/model"
	"context"
	"io/ioutil"
	"strconv"
	"strings"
)

type BinanceFacade struct {
	client *binance.Client
}

func (binanceFacade *BinanceFacade) Init() error {
	content, err := ioutil.ReadFile("binanceKeys.secret")
	if err != nil {
		return err
	}
	keys := strings.Split(string(content), "\n")
	binanceFacade.client = binance.NewClient(keys[0], keys[1])
	return nil
}

func (binanceFacade *BinanceFacade) GetPrices(ctx context.Context, markets []*string) ([]*model.Price, error) {
	service := binanceFacade.client.NewListPricesService()
	prices, err := service.Symbols(markets).Do(ctx)
	if err != nil {
		return nil, err
	}
	result := make([]*model.Price, len(prices))
	for i, priceData := range prices {
		price, err := strconv.ParseFloat(priceData.Price, 64)
		if err != nil {
			return nil, err
		}
		result[i] = &model.Price{Market: priceData.Symbol, Price: &price}
	}
	return result, nil
}

func (BinanceFacade *BinanceFacade) GetBalances(ctx context.Context) ([]*model.Balance, error) {
	service := BinanceFacade.client.NewGetAccountService()
	account, err := service.Do(ctx)
	if err != nil {
		return nil, err
	}
	result := make([]*model.Balance, len(account.Balances))

	for i, balanceData := range account.Balances {
		free, err := strconv.ParseFloat(balanceData.Free, 64)
		if err != nil {
			return nil, err
		}
		locked, err := strconv.ParseFloat(balanceData.Locked, 64)
		if err != nil {
			return nil, err
		}
		coins := free + locked
		balance := model.Balance{Coin: balanceData.Asset, Free: &free, AmountCoins: &coins}
		result[i] = &balance
	}

	return result, nil
}

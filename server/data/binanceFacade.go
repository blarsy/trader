package data

import (
	"io/ioutil"
	"strings"

	"github.com/adshao/go-binance/v2"
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

// func (binanceFacade *BinanceFacade) GetPrices(ctx context.Context, markets []model.Market) ([]*model.Price, error) {
// 	service := binanceFacade.client.NewListPricesService()
// 	service.Symbol("BTCUSDT")
// 	prices, err := service.Do(ctx)
// 	if err != nil {
// 		return nil, err
// 	}
// 	result := make([]*model.Price, len(prices))
// 	for i, price := range prices {
// 		result[i] = *model.Price { Market: &model.Market { LeftCoin: , RightCoin: } }
// 	}
// 	return prices, nil
// }

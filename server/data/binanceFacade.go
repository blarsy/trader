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
	client         *binance.Client
	executionQueue *ExecutionQueue
}

func (binanceFacade *BinanceFacade) Init() error {
	content, err := ioutil.ReadFile("binanceKeys.secret")
	if err != nil {
		return err
	}
	keys := strings.Split(string(content), "\n")
	binanceFacade.client = binance.NewClient(keys[0], keys[1])

	var queue = ExecutionQueue{}
	queueInitErr := queue.Init(2000)
	if queueInitErr != nil {
		return queueInitErr
	}
	binanceFacade.executionQueue = &queue
	return nil
}

func (binanceFacade *BinanceFacade) GetPrices(ctx context.Context, markets []*string, market *string) ([]*model.Price, error) {
	outputChannel := binanceFacade.executionQueue.QueueOperation(binanceFacade.getPrices, ctx, &markets, market)
	result := <-outputChannel
	if result.Error != nil {
		return nil, result.Error
	}
	return result.Output.([]*model.Price), nil
}

func (binanceFacade *BinanceFacade) getPrices(input []interface{}) (interface{}, error) {
	service := binanceFacade.client.NewListPricesService()
	var prices []*binance.SymbolPrice
	var err error
	context := input[0].(context.Context)
	symbols := *input[1].(*[]*string)
	if len(symbols) > 0 {
		prices, err = service.Symbols(symbols).Do(context)
		if err != nil {
			return nil, err
		}
	} else {
		prices, err = service.Symbol(*input[2].(*string)).Do(context)
		if err != nil {
			return nil, err
		}
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
	outputChannel := BinanceFacade.executionQueue.QueueOperation(BinanceFacade.getBalances, ctx)
	result := <-outputChannel
	if result.Error != nil {
		return nil, result.Error
	}
	return result.Output.([]*model.Balance), nil
}

func (BinanceFacade *BinanceFacade) getBalances(input []interface{}) (interface{}, error) {
	service := BinanceFacade.client.NewGetAccountService()
	account, err := service.Do(input[0].(context.Context))
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

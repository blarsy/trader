package graph

// This file will be automatically regenerated based on the schema, any resolver implementations
// will be copied through when generating and any unknown code will be moved to the end.

import (
	"blarsy/traderServer/auth"
	"blarsy/traderServer/graph/generated"
	"blarsy/traderServer/graph/model"
	"context"
	"fmt"

	"github.com/vektah/gqlparser/v2/gqlerror"
)

func (r *mutationResolver) CreateSession(ctx context.Context, input model.NewSession) (string, error) {
	reqCtx := auth.ForContext(ctx)
	sessionId, err := reqCtx.SessionManager.CreateSession(input.Signature, input.Message)
	if err != nil {
		return "", gqlerror.Errorf("Error %v", err)
	} else {
		return sessionId, nil
	}
}

func (r *mutationResolver) CreateTrade(ctx context.Context, input *model.NewTrade) (string, error) {
	if input.MarketBuy {
		//TODO: First buy from the market, then fill the buyprice and creationTime accordingly
	} else {
		//TODO: check whether there are actually <AmountLeftCoin> present and available on the underlying exchange account
	}
	reqCtx := auth.ForContext(ctx)
	idNewTrade, err := reqCtx.DataFacade.LocalFile.CreateTrade(input)
	if err != nil {
		return "", err
	}
	return idNewTrade, nil
}

func (r *mutationResolver) CreateStopLossFollower(ctx context.Context, input model.NewStopLossFollower) (*model.StopLossFollower, error) {
	fmt.Printf("%#v\n", input)
	panic(fmt.Errorf("not implemented"))
}

func (r *queryResolver) Trades(ctx context.Context, id *string) ([]*model.Trade, error) {
	reqCtx := auth.ForContext(ctx)
	trades, err := reqCtx.DataFacade.LocalFile.GetTrades(id)
	if err != nil {
		return nil, err
	}
	return trades, nil
}

func (r *queryResolver) Markets(ctx context.Context) ([]*model.Market, error) {
	reqCtx := auth.ForContext(ctx)
	return reqCtx.DataFacade.LocalFile.GetMarkets()
}

func (r *queryResolver) Prices(ctx context.Context, markets []*string, market *string) ([]*model.Price, error) {
	reqCtx := auth.ForContext(ctx)
	prices, err := reqCtx.DataFacade.Binance.GetPrices(ctx, markets, market)
	if err != nil {
		return nil, err
	}
	return prices, nil
}

func (r *queryResolver) Balances(ctx context.Context) ([]*model.Balance, error) {
	reqCtx := auth.ForContext(ctx)
	balances, err := reqCtx.DataFacade.Binance.GetBalances(ctx)
	if err != nil {
		return nil, err
	}
	return balances, nil
}

// Mutation returns generated.MutationResolver implementation.
func (r *Resolver) Mutation() generated.MutationResolver { return &mutationResolver{r} }

// Query returns generated.QueryResolver implementation.
func (r *Resolver) Query() generated.QueryResolver { return &queryResolver{r} }

type mutationResolver struct{ *Resolver }
type queryResolver struct{ *Resolver }

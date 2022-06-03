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

func (r *mutationResolver) CreateTrade(ctx context.Context, input *model.NewTrade) (*model.Trade, error) {
	fmt.Printf("%#v\n", input)
	panic(fmt.Errorf("not implemented"))
}

func (r *mutationResolver) CreateStopLossFollower(ctx context.Context, input model.NewStopLossFollower) (*model.StopLossFollower, error) {
	fmt.Printf("%#v\n", input)
	panic(fmt.Errorf("not implemented"))
}

func (r *queryResolver) Todos(ctx context.Context) ([]*model.Todo, error) {
	panic(fmt.Errorf("not implemented"))
}

// Mutation returns generated.MutationResolver implementation.
func (r *Resolver) Mutation() generated.MutationResolver { return &mutationResolver{r} }

// Query returns generated.QueryResolver implementation.
func (r *Resolver) Query() generated.QueryResolver { return &queryResolver{r} }

type mutationResolver struct{ *Resolver }
type queryResolver struct{ *Resolver }

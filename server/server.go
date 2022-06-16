package main

import (
	"blarsy/traderServer/auth"
	"blarsy/traderServer/data"
	"blarsy/traderServer/graph"
	"blarsy/traderServer/graph/generated"
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/99designs/gqlgen/graphql/handler"
	"github.com/99designs/gqlgen/graphql/playground"
	"github.com/go-chi/chi"
	"github.com/rs/cors"
)

const defaultPort = "8080"

func Start() {
	sessionManager := auth.SessionManager{}
	err := sessionManager.Init()
	if err != nil {
		panic(err)
	}

	dataFacade := data.DataFacade{}
	dataInitErr := dataFacade.Init()
	if dataInitErr != nil {
		log.Panicf("Error initializing data facade. %s", dataInitErr)
	}

	router := chi.NewRouter()

	router.Use(cors.New(cors.Options{
		AllowedOrigins:   []string{"http://localhost:3000"},
		AllowCredentials: true,
		AllowedHeaders:   []string{"Authorization", "Content-Type"},
	}).Handler)
	router.Use(auth.Middleware(&sessionManager, &dataFacade))

	srv := handler.NewDefaultServer(generated.NewExecutableSchema(generated.Config{Resolvers: &graph.Resolver{}}))
	router.Handle("/", playground.Handler("GraphQL playground", "/query"))
	router.Handle("/query", srv)

	port := os.Getenv("PORT")
	if port == "" {
		port = defaultPort
	}

	log.Printf("connect to http://localhost:%s/ for GraphQL playground", port)

	errServe := http.ListenAndServe(fmt.Sprintf(":%s", port), router)
	if errServe != nil {
		panic(errServe)
	}
}

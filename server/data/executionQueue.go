package data

import (
	"blarsy/traderServer/binance"
	"fmt"
	"io/ioutil"
	"strconv"
	"strings"
	"sync"
	"time"
)

type OperationResult struct {
	Output interface{}
	Error  error
}

type Operation struct {
	function func(input []interface{}) (interface{}, error)
	channel  chan *OperationResult
	input    interface{}
}

type ExecutionQueue struct {
	client *binance.Client
	ops    []Operation
	ticker time.Ticker
	lock   sync.RWMutex
}

func loopQueue(ticker *time.Ticker, queue *ExecutionQueue) {
	for now := range ticker.C {
		if len(queue.ops) > 0 {
			queue.lock.Lock()
			operation := queue.ops[0]
			output, err := operation.function(operation.input.([]interface{}))
			operation.channel <- &OperationResult{Output: output, Error: err}
			queue.ops = queue.ops[1:]
			queue.lock.Unlock()
			if err != nil {
				fmt.Printf("%s: Dequeued and executed an operation with %d parameters, which ended ended with error return %+v", now, len(operation.input.([]interface{})), err)
			}
		}
	}
}

func (queue *ExecutionQueue) Init(intervalInMilliseconds int) error {
	content, err := ioutil.ReadFile("binanceKeys.secret")
	if err != nil {
		return err
	}
	keys := strings.Split(string(content), "\n")
	queue.client = binance.NewClient(keys[0], keys[1])

	tickerDuration, err := time.ParseDuration(strconv.Itoa(intervalInMilliseconds) + "ms")
	if err != nil {
		return err
	}
	queue.ticker = *time.NewTicker(tickerDuration)

	go loopQueue(&queue.ticker, queue)

	return nil
}

func (queue *ExecutionQueue) Cleanup() {
	queue.ticker.Stop()
}

func (queue *ExecutionQueue) QueueOperation(function func([]interface{}) (interface{}, error), input ...interface{}) chan *OperationResult {
	channel := make(chan *OperationResult)
	queue.ops = append(queue.ops, Operation{input: input, function: function, channel: channel})
	return channel
}

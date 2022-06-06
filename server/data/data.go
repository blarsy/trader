package data

import (
	"blarsy/traderServer/graph/model"
	"encoding/json"
	"fmt"
	"io/ioutil"
)

type DataFacade struct {
	LocalFile *LocalFile
}

func (dataFacade *DataFacade) Init() {
	var localFile = LocalFile{fileName: "./data/data.json"}
	localFile.Init()
	dataFacade.LocalFile = &localFile
}

type LocalFile struct {
	fileName    string
	fileContent map[string]interface{}
}

func (localFile *LocalFile) Init() {
	err := localFile.loadFileContent(localFile.fileName)
	if err != nil {
		panic(fmt.Errorf("error loading data file: %v", err))
	}
}

func (localFile *LocalFile) GetTrades() ([]*model.Trade, error) {
	fmt.Println(localFile.fileContent["trades"])
	return nil, nil
}

func (localFile *LocalFile) GetMarkets() ([]*model.Market, error) {
	rawMarkets := localFile.fileContent["markets"].([]interface{})
	result := make([]*model.Market, 0, len(rawMarkets))
	for _, rawMarket := range rawMarkets {
		result = append(result, &model.Market{LeftCoin: rawMarket.([]interface{})[0].(string), RightCoin: rawMarket.([]interface{})[1].(string)})
	}
	return result, nil
}

func (localFile *LocalFile) loadFileContent(fileName string) error {
	if localFile.fileContent == nil {
		content, err := ioutil.ReadFile(fileName)
		if err != nil {
			return err
		}

		err = json.Unmarshal(content, &localFile.fileContent)
		if err != nil {
			return err
		}
	}
	return nil
}

package auth

import (
	"context"
	"fmt"
	"io/ioutil"
	"net/http"
	"time"

	"blarsy/traderServer/data"

	"github.com/ethereum/go-ethereum/accounts"
	"github.com/ethereum/go-ethereum/common/hexutil"
	"github.com/ethereum/go-ethereum/crypto"
	"github.com/google/uuid"
)

type SessionManager struct {
	AuthorizedAddress   string
	ActiveSessionsNonce map[string]int64
}

type RequestContext struct {
	SessionManager *SessionManager
	DataFacade     *data.DataFacade
	SessionId      string
	Nonce          int64
}

type sessionCtxKey string

const SessionKey = sessionCtxKey("session")

func (sessionManager *SessionManager) Init() (err error) {
	content, err := ioutil.ReadFile("authorizedAddress.secret")
	if err != nil {
		return err
	}
	sessionManager.AuthorizedAddress = string(content)
	sessionManager.ActiveSessionsNonce = make(map[string]int64)
	return nil
}

func (sessionManager *SessionManager) CreateSession(sigHex string, msg string) (string, error) {
	sig := hexutil.MustDecode(sigHex)

	binMsg := accounts.TextHash([]byte(msg))
	sig[crypto.RecoveryIDOffset] -= 27 // Transform yellow paper V from 27/28 to 0/1

	recovered, err := crypto.SigToPub(binMsg, sig)
	if err != nil {
		return "", err
	}

	recoveredAddr := crypto.PubkeyToAddress(*recovered)

	//TODO: verify the timestamp is later than the last one
	if sessionManager.AuthorizedAddress != recoveredAddr.Hex() {
		return "", fmt.Errorf("signature invalid")
	}

	sessionId := uuid.New().String()

	sessionManager.ActiveSessionsNonce[sessionId] = time.Now().Unix() * 1000

	return sessionId, nil
}

func Middleware(sessionManager *SessionManager, dataFacade *data.DataFacade) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			sessionUuidCookie, err := r.Cookie("auth-cookie")

			requestContext := RequestContext{
				SessionManager: sessionManager,
				DataFacade:     dataFacade,
			}

			// Allow unauthenticated users in
			if err == nil && sessionUuidCookie != nil {
				nonce, found := sessionManager.ActiveSessionsNonce[uuid.MustParse(sessionUuidCookie.Value).String()]
				if !found {
					http.Error(w, "Invalid cookie", http.StatusForbidden)
					return
				} else {
					// put it in context
					requestContext.Nonce = nonce
					requestContext.SessionId = sessionUuidCookie.Value
				}
			}

			ctx := context.WithValue(r.Context(), SessionKey, requestContext)

			// and call the next with our new context
			r = r.WithContext(ctx)

			next.ServeHTTP(w, r)
		})
	}
}

// ForContext finds the user from the context. REQUIRES Middleware to have run.
func ForContext(ctx context.Context) *RequestContext {
	raw, _ := ctx.Value(SessionKey).(RequestContext)
	return &raw
}

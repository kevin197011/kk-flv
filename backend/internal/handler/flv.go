package handler

import (
	"context"
	"io"
	"log/slog"
	"net"
	"net/http"
	"net/url"
	"strings"
	"time"
)

const (
	flvContentType        = "video/x-flv"
	proxyConnectTimeout   = 10 * time.Second
	proxyResponseHeaderTimeout = 15 * time.Second
)

// FLVProxy handles GET /api/v1/flv/proxy?url=...
// It fetches the given http(s) URL on behalf of the client and streams the response back.
func FLVProxy(w http.ResponseWriter, r *http.Request) {
	rawURL := r.URL.Query().Get("url")
	if rawURL == "" {
		writeJSONError(w, http.StatusBadRequest, "missing url query parameter")
		return
	}

	parsed, err := url.Parse(rawURL)
	if err != nil {
		writeJSONError(w, http.StatusBadRequest, "invalid url")
		return
	}

	scheme := strings.ToLower(parsed.Scheme)
	if scheme != "http" && scheme != "https" {
		writeJSONError(w, http.StatusBadRequest, "url must be http or https")
		return
	}

	// No overall Timeout so streaming can run until client or upstream closes.
	// Only connect and response-header are limited to avoid hanging.
	client := &http.Client{
		Transport: &http.Transport{
			DialContext: func(ctx context.Context, network, addr string) (net.Conn, error) {
				d := net.Dialer{Timeout: proxyConnectTimeout}
				return d.DialContext(ctx, network, addr)
			},
			ResponseHeaderTimeout: proxyResponseHeaderTimeout,
		},
		CheckRedirect: func(req *http.Request, via []*http.Request) error {
			if len(via) >= 3 {
				return http.ErrUseLastResponse
			}
			return nil
		},
	}

	// Use request context so upstream request is tied to client lifetime.
	// When client disconnects (refresh, navigate, or switch to another FLV), context is cancelled
	// and the next write to w fails; handler returns and defer resp.Body.Close() recycles upstream.
	ctx := r.Context()
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, parsed.String(), nil)
	if err != nil {
		writeJSONError(w, http.StatusBadRequest, "invalid request")
		return
	}

	// Forward Range header for seeking if upstream supports it
	if rangeH := r.Header.Get("Range"); rangeH != "" {
		req.Header.Set("Range", rangeH)
	}

	resp, err := client.Do(req)
	if err != nil {
		slog.Warn("flv proxy upstream request failed", "err", err, "host", parsed.Host)
		writeJSONError(w, http.StatusBadGateway, "failed to fetch stream")
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK && resp.StatusCode != http.StatusPartialContent {
		slog.Warn("flv proxy upstream non-2xx", "status", resp.StatusCode, "host", parsed.Host)
		writeJSONError(w, http.StatusBadGateway, "upstream returned error")
		return
	}

	// Prefer upstream Content-Type, default to video/x-flv
	contentType := resp.Header.Get("Content-Type")
	if contentType == "" {
		contentType = flvContentType
	}
	w.Header().Set("Content-Type", contentType)

	// Forward Content-Length if present for better UX
	if cl := resp.Header.Get("Content-Length"); cl != "" {
		w.Header().Set("Content-Length", cl)
	}

	// Support Range response
	if resp.StatusCode == http.StatusPartialContent {
		w.WriteHeader(http.StatusPartialContent)
		if cr := resp.Header.Get("Content-Range"); cr != "" {
			w.Header().Set("Content-Range", cr)
		}
	}

	_, err = io.Copy(w, resp.Body)
	if err != nil {
		slog.Warn("flv proxy copy body failed", "err", err)
		return
	}
}

func writeJSONError(w http.ResponseWriter, code int, message string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(code)
	_, _ = w.Write([]byte(`{"code":"` + http.StatusText(code) + `","message":"` + escapeJSON(message) + `"}`))
}

func escapeJSON(s string) string {
	var b []byte
	for _, r := range s {
		switch r {
		case '"', '\\':
			b = append(b, '\\', byte(r))
		case '\n':
			b = append(b, '\\', 'n')
		case '\r':
			b = append(b, '\\', 'r')
		case '\t':
			b = append(b, '\\', 't')
		default:
			if r < 32 {
				continue
			}
			b = append(b, byte(r))
		}
	}
	return string(b)
}

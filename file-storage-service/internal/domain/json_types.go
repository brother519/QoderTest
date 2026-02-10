package domain

import (
	"database/sql/driver"
	"encoding/json"
	"fmt"
)

// MapJSON is a helper type for JSONB columns storing map[string]interface{}.
type MapJSON map[string]interface{}

func (m MapJSON) Value() (driver.Value, error) {
	if m == nil {
		return json.Marshal(map[string]interface{}{})
	}
	return json.Marshal(m)
}

func (m *MapJSON) Scan(src interface{}) error {
	if src == nil {
		*m = MapJSON{}
		return nil
	}
	var data []byte
	switch v := src.(type) {
	case []byte:
		data = v
	case string:
		data = []byte(v)
	default:
		return fmt.Errorf("unsupported type: %T", src)
	}
	return json.Unmarshal(data, m)
}

// StringSliceJSON is a helper type for JSONB columns storing []string.
type StringSliceJSON []string

func (s StringSliceJSON) Value() (driver.Value, error) {
	if s == nil {
		return json.Marshal([]string{})
	}
	return json.Marshal(s)
}

func (s *StringSliceJSON) Scan(src interface{}) error {
	if src == nil {
		*s = StringSliceJSON{}
		return nil
	}
	var data []byte
	switch v := src.(type) {
	case []byte:
		data = v
	case string:
		data = []byte(v)
	default:
		return fmt.Errorf("unsupported type: %T", src)
	}
	return json.Unmarshal(data, s)
}

// ChunkInfoSliceJSON is a helper type for JSONB columns storing []ChunkInfo.
type ChunkInfoSliceJSON []ChunkInfo

func (c ChunkInfoSliceJSON) Value() (driver.Value, error) {
	if c == nil {
		return json.Marshal([]ChunkInfo{})
	}
	return json.Marshal(c)
}

func (c *ChunkInfoSliceJSON) Scan(src interface{}) error {
	if src == nil {
		*c = ChunkInfoSliceJSON{}
		return nil
	}
	var data []byte
	switch v := src.(type) {
	case []byte:
		data = v
	case string:
		data = []byte(v)
	default:
		return fmt.Errorf("unsupported type: %T", src)
	}
	return json.Unmarshal(data, c)
}

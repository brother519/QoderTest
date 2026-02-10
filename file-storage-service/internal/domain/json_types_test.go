package domain

import (
	"database/sql/driver"
	"encoding/json"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestMapJSON_Value(t *testing.T) {
	m := MapJSON{"key": "value", "num": float64(42)}
	val, err := m.Value()
	require.NoError(t, err)

	b, ok := val.([]byte)
	require.True(t, ok)

	var decoded map[string]interface{}
	err = json.Unmarshal(b, &decoded)
	require.NoError(t, err)
	assert.Equal(t, "value", decoded["key"])
	assert.Equal(t, float64(42), decoded["num"])
}

func TestMapJSON_Value_Nil(t *testing.T) {
	var m MapJSON
	val, err := m.Value()
	require.NoError(t, err)

	b, ok := val.([]byte)
	require.True(t, ok)
	assert.Equal(t, "{}", string(b))
}

func TestMapJSON_Scan(t *testing.T) {
	var m MapJSON
	err := m.Scan([]byte(`{"hello":"world"}`))
	require.NoError(t, err)
	assert.Equal(t, "world", m["hello"])
}

func TestMapJSON_Scan_Nil(t *testing.T) {
	var m MapJSON
	err := m.Scan(nil)
	require.NoError(t, err)
	assert.NotNil(t, m)
}

func TestStringSliceJSON_Value(t *testing.T) {
	s := StringSliceJSON{"image/png", "image/jpeg"}
	val, err := s.Value()
	require.NoError(t, err)

	b, ok := val.([]byte)
	require.True(t, ok)

	var decoded []string
	err = json.Unmarshal(b, &decoded)
	require.NoError(t, err)
	assert.Equal(t, []string{"image/png", "image/jpeg"}, decoded)
}

func TestStringSliceJSON_Scan(t *testing.T) {
	var s StringSliceJSON
	err := s.Scan([]byte(`["a","b"]`))
	require.NoError(t, err)
	assert.Equal(t, StringSliceJSON{"a", "b"}, s)
}

func TestChunkInfoSliceJSON_RoundTrip(t *testing.T) {
	chunks := ChunkInfoSliceJSON{
		{ChunkNumber: 1, ETag: "etag1"},
		{ChunkNumber: 2, ETag: "etag2"},
	}

	val, err := chunks.Value()
	require.NoError(t, err)

	var decoded ChunkInfoSliceJSON
	err = decoded.Scan(val.(driver.Value))
	// Scan expects []byte or string
	b, _ := val.([]byte)
	err = decoded.Scan(b)
	require.NoError(t, err)
	assert.Len(t, decoded, 2)
	assert.Equal(t, 1, decoded[0].ChunkNumber)
	assert.Equal(t, "etag2", decoded[1].ETag)
}

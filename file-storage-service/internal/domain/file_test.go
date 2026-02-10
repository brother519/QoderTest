package domain

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestPagination_Offset(t *testing.T) {
	tests := []struct {
		page     int
		pageSize int
		expected int
	}{
		{1, 20, 0},
		{2, 20, 20},
		{3, 10, 20},
		{1, 100, 0},
	}
	for _, tt := range tests {
		p := Pagination{Page: tt.page, PageSize: tt.pageSize}
		assert.Equal(t, tt.expected, p.Offset())
	}
}

func TestPagination_Limit(t *testing.T) {
	p := Pagination{Page: 1, PageSize: 50}
	assert.Equal(t, 50, p.Limit())
}

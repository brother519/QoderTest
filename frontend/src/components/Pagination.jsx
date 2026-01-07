export default function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    pages.push(i);
  }

  return (
    <div style={styles.container}>
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        style={{
          ...styles.button,
          ...(currentPage === 1 ? styles.buttonDisabled : {})
        }}
      >
        上一页
      </button>
      
      <div style={styles.pages}>
        {pages.map(page => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            style={{
              ...styles.pageButton,
              ...(page === currentPage ? styles.pageButtonActive : {})
            }}
          >
            {page}
          </button>
        ))}
      </div>
      
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        style={{
          ...styles.button,
          ...(currentPage === totalPages ? styles.buttonDisabled : {})
        }}
      >
        下一页
      </button>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '0.5rem',
    margin: '2rem 0'
  },
  button: {
    padding: '0.5rem 1rem',
    backgroundColor: '#3498db',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer'
  },
  buttonDisabled: {
    backgroundColor: '#bdc3c7',
    cursor: 'not-allowed'
  },
  pages: {
    display: 'flex',
    gap: '0.25rem'
  },
  pageButton: {
    padding: '0.5rem 0.75rem',
    backgroundColor: 'white',
    color: '#3498db',
    border: '1px solid #3498db',
    borderRadius: '4px',
    cursor: 'pointer',
    minWidth: '40px'
  },
  pageButtonActive: {
    backgroundColor: '#3498db',
    color: 'white'
  }
};

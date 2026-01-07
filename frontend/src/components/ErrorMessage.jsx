export default function ErrorMessage({ message }) {
  if (!message) return null;

  return (
    <div style={styles.container}>
      <p style={styles.message}>{message}</p>
    </div>
  );
}

const styles = {
  container: {
    backgroundColor: '#fee',
    border: '1px solid #fcc',
    borderRadius: '4px',
    padding: '1rem',
    margin: '1rem 0'
  },
  message: {
    color: '#c33',
    margin: 0,
    fontSize: '0.95rem'
  }
};

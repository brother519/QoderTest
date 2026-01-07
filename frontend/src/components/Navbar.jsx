import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav style={styles.nav}>
      <div style={styles.container}>
        <Link to="/" style={styles.logo}>
          <h1 style={styles.title}>博客系统</h1>
        </Link>
        <div style={styles.links}>
          <Link to="/" style={styles.link}>首页</Link>
          <Link to="/articles/create" style={styles.linkButton}>创建文章</Link>
        </div>
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    backgroundColor: '#2c3e50',
    padding: '1rem 0',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 1rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  logo: {
    textDecoration: 'none',
    color: 'white'
  },
  title: {
    margin: 0,
    fontSize: '1.5rem'
  },
  links: {
    display: 'flex',
    gap: '1rem',
    alignItems: 'center'
  },
  link: {
    color: 'white',
    textDecoration: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '4px',
    transition: 'background-color 0.3s'
  },
  linkButton: {
    color: 'white',
    textDecoration: 'none',
    padding: '0.5rem 1rem',
    backgroundColor: '#3498db',
    borderRadius: '4px',
    transition: 'background-color 0.3s'
  }
};

import { useState } from 'react';
import { useArticles } from '../hooks/useArticles';
import ArticleCard from '../components/ArticleCard';
import Pagination from '../components/Pagination';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';

export default function ArticleListPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const { articles, totalPages, loading, error, deleteArticle } = useArticles(currentPage, 10);

  const handleDelete = async (id) => {
    if (window.confirm('确定要删除这篇文章吗？')) {
      try {
        await deleteArticle(id);
      } catch (err) {
        alert('删除失败: ' + err.message);
      }
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <h1 style={styles.title}>文章列表</h1>

        {error && <ErrorMessage message={error} />}
        
        {loading ? (
          <Loading />
        ) : (
          <>
            {articles.length === 0 ? (
              <p style={styles.noArticles}>暂无文章，点击导航栏的"创建文章"开始写作吧！</p>
            ) : (
              articles.map(article => (
                <ArticleCard
                  key={article.id}
                  article={article}
                  onDelete={handleDelete}
                />
              ))
            )}

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: 'calc(100vh - 80px)',
    backgroundColor: '#f5f5f5',
    padding: '2rem 1rem'
  },
  content: {
    maxWidth: '900px',
    margin: '0 auto'
  },
  title: {
    fontSize: '2rem',
    color: '#2c3e50',
    marginBottom: '1.5rem'
  },
  noArticles: {
    textAlign: 'center',
    color: '#7f8c8d',
    fontSize: '1.1rem',
    padding: '3rem',
    backgroundColor: 'white',
    borderRadius: '8px'
  }
};

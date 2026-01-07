import { useForm } from 'react-hook-form';

export default function ArticleForm({ article, onSubmit, isSubmitting }) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: article || {
      title: '',
      content: '',
      author: '',
      status: 'draft'
    }
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} style={styles.form}>
      <div style={styles.formGroup}>
        <label style={styles.label}>标题 *</label>
        <input
          {...register('title', {
            required: '标题是必填项',
            maxLength: { value: 200, message: '标题不能超过200个字符' }
          })}
          style={styles.input}
          placeholder="请输入文章标题"
        />
        {errors.title && <span style={styles.error}>{errors.title.message}</span>}
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label}>内容 *</label>
        <textarea
          {...register('content', {
            required: '内容是必填项'
          })}
          style={styles.textarea}
          placeholder="请输入文章内容"
          rows="15"
        />
        {errors.content && <span style={styles.error}>{errors.content.message}</span>}
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label}>作者</label>
        <input
          {...register('author', {
            maxLength: { value: 100, message: '作者名称不能超过100个字符' }
          })}
          style={styles.input}
          placeholder="请输入作者名称（默认为 Anonymous）"
        />
        {errors.author && <span style={styles.error}>{errors.author.message}</span>}
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label}>状态</label>
        <select {...register('status')} style={styles.select}>
          <option value="draft">草稿</option>
          <option value="published">已发布</option>
        </select>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        style={{
          ...styles.submitButton,
          ...(isSubmitting ? styles.submitButtonDisabled : {})
        }}
      >
        {isSubmitting ? '提交中...' : (article ? '更新文章' : '创建文章')}
      </button>
    </form>
  );
}

const styles = {
  form: {
    backgroundColor: 'white',
    padding: '2rem',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  formGroup: {
    marginBottom: '1.5rem'
  },
  label: {
    display: 'block',
    marginBottom: '0.5rem',
    fontWeight: 'bold',
    color: '#2c3e50'
  },
  input: {
    width: '100%',
    padding: '0.75rem',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '1rem',
    boxSizing: 'border-box'
  },
  textarea: {
    width: '100%',
    padding: '0.75rem',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '1rem',
    fontFamily: 'inherit',
    resize: 'vertical',
    boxSizing: 'border-box'
  },
  select: {
    width: '100%',
    padding: '0.75rem',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '1rem',
    boxSizing: 'border-box'
  },
  error: {
    display: 'block',
    color: '#e74c3c',
    fontSize: '0.9rem',
    marginTop: '0.25rem'
  },
  submitButton: {
    padding: '0.75rem 2rem',
    backgroundColor: '#27ae60',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '1rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    width: '100%'
  },
  submitButtonDisabled: {
    backgroundColor: '#95a5a6',
    cursor: 'not-allowed'
  }
};

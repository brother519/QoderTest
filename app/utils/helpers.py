import markdown
import bleach


def render_markdown(text):
    if not text:
        return ''
    
    allowed_tags = [
        'p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'blockquote', 'code', 'pre', 'ul', 'ol', 'li', 'a', 'img', 'hr',
        'table', 'thead', 'tbody', 'tr', 'th', 'td'
    ]
    
    allowed_attributes = {
        'a': ['href', 'title'],
        'img': ['src', 'alt', 'title'],
        'code': ['class']
    }
    
    html = markdown.markdown(
        text,
        extensions=['fenced_code', 'tables', 'nl2br', 'sane_lists']
    )
    
    clean_html = bleach.clean(
        html,
        tags=allowed_tags,
        attributes=allowed_attributes,
        strip=True
    )
    
    return clean_html

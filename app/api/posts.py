from flask import jsonify, request
from flask_login import login_required, current_user
from app.api import api_bp
from app.models import Post, Tag, Category
from app.extensions import db


@api_bp.route('/posts', methods=['GET'])
def get_posts():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    category = request.args.get('category', type=str)
    tag = request.args.get('tag', type=str)
    author = request.args.get('author', type=str)
    
    query = Post.query.filter_by(is_published=True)
    
    if category:
        cat = Category.query.filter_by(slug=category).first()
        if cat:
            query = query.filter_by(category_id=cat.id)
    
    if tag:
        tag_obj = Tag.query.filter_by(slug=tag).first()
        if tag_obj:
            query = query.filter(Post.tags.contains(tag_obj))
    
    if author:
        from app.models import User
        user = User.query.filter_by(username=author).first()
        if user:
            query = query.filter_by(author_id=user.id)
    
    pagination = query.order_by(Post.created_at.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )
    
    posts = [{
        'id': p.id,
        'title': p.title,
        'summary': p.summary,
        'slug': p.slug,
        'author': p.author.username,
        'category': p.category.name if p.category else None,
        'tags': [t.name for t in p.tags],
        'created_at': p.created_at.isoformat(),
        'view_count': p.view_count
    } for p in pagination.items]
    
    return jsonify({
        'success': True,
        'data': {
            'posts': posts,
            'total': pagination.total,
            'page': page,
            'per_page': per_page,
            'pages': pagination.pages
        }
    })


@api_bp.route('/posts/<int:id>', methods=['GET'])
def get_post(id):
    post = Post.query.get_or_404(id)
    
    if not post.is_published:
        return jsonify({
            'success': False,
            'error': {'code': 'NOT_FOUND', 'message': '文章不存在或未发布'}
        }), 404
    
    return jsonify({
        'success': True,
        'data': {
            'id': post.id,
            'title': post.title,
            'content': post.content,
            'summary': post.summary,
            'slug': post.slug,
            'author': post.author.username,
            'category': post.category.name if post.category else None,
            'tags': [t.name for t in post.tags],
            'created_at': post.created_at.isoformat(),
            'updated_at': post.updated_at.isoformat(),
            'view_count': post.view_count
        }
    })


@api_bp.route('/posts', methods=['POST'])
@login_required
def create_post():
    data = request.get_json()
    
    if not data or 'title' not in data or 'content' not in data:
        return jsonify({
            'success': False,
            'error': {'code': 'VALIDATION_ERROR', 'message': '标题和内容为必填项'}
        }), 400
    
    post = Post(
        title=data['title'],
        content=data['content'],
        summary=data.get('summary', ''),
        author_id=current_user.id,
        is_published=data.get('is_published', False)
    )
    
    if 'category_id' in data:
        post.category_id = data['category_id']
    
    post.generate_slug()
    db.session.add(post)
    
    if 'tag_ids' in data:
        tags = Tag.query.filter(Tag.id.in_(data['tag_ids'])).all()
        post.tags = tags
    
    db.session.commit()
    
    return jsonify({
        'success': True,
        'data': {'id': post.id, 'slug': post.slug},
        'message': '文章创建成功'
    }), 201


@api_bp.route('/posts/<int:id>', methods=['PUT'])
@login_required
def update_post(id):
    post = Post.query.get_or_404(id)
    
    if current_user.id != post.author_id and not current_user.is_admin:
        return jsonify({
            'success': False,
            'error': {'code': 'FORBIDDEN', 'message': '无权限修改此文章'}
        }), 403
    
    data = request.get_json()
    
    if 'title' in data:
        post.title = data['title']
    if 'content' in data:
        post.content = data['content']
    if 'summary' in data:
        post.summary = data['summary']
    if 'category_id' in data:
        post.category_id = data['category_id']
    if 'is_published' in data:
        post.is_published = data['is_published']
    if 'tag_ids' in data:
        tags = Tag.query.filter(Tag.id.in_(data['tag_ids'])).all()
        post.tags = tags
    
    db.session.commit()
    
    return jsonify({
        'success': True,
        'message': '文章更新成功'
    })


@api_bp.route('/posts/<int:id>', methods=['DELETE'])
@login_required
def delete_post(id):
    post = Post.query.get_or_404(id)
    
    if current_user.id != post.author_id and not current_user.is_admin:
        return jsonify({
            'success': False,
            'error': {'code': 'FORBIDDEN', 'message': '无权限删除此文章'}
        }), 403
    
    db.session.delete(post)
    db.session.commit()
    
    return jsonify({
        'success': True,
        'message': '文章删除成功'
    })

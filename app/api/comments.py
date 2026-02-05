from flask import jsonify, request
from flask_login import login_required, current_user
from app.api import api_bp
from app.models import Comment, Post
from app.extensions import db


@api_bp.route('/posts/<int:post_id>/comments', methods=['GET'])
def get_comments(post_id):
    post = Post.query.get_or_404(post_id)
    comments = Comment.query.filter_by(post_id=post_id, is_approved=True, parent_id=None)\
        .order_by(Comment.created_at.desc()).all()
    
    def serialize_comment(comment):
        return {
            'id': comment.id,
            'content': comment.content,
            'author': comment.author.username,
            'created_at': comment.created_at.isoformat(),
            'replies': [serialize_comment(reply) for reply in comment.replies.filter_by(is_approved=True).all()]
        }
    
    return jsonify({
        'success': True,
        'data': [serialize_comment(c) for c in comments]
    })


@api_bp.route('/posts/<int:post_id>/comments', methods=['POST'])
@login_required
def create_comment(post_id):
    post = Post.query.get_or_404(post_id)
    data = request.get_json()
    
    if not data or 'content' not in data:
        return jsonify({
            'success': False,
            'error': {'code': 'VALIDATION_ERROR', 'message': '评论内容不能为空'}
        }), 400
    
    comment = Comment(
        content=data['content'],
        post_id=post_id,
        user_id=current_user.id,
        parent_id=data.get('parent_id')
    )
    
    db.session.add(comment)
    db.session.commit()
    
    return jsonify({
        'success': True,
        'data': {'id': comment.id},
        'message': '评论发表成功'
    }), 201


@api_bp.route('/comments/<int:id>', methods=['DELETE'])
@login_required
def delete_comment(id):
    comment = Comment.query.get_or_404(id)
    
    if current_user.id != comment.user_id and not current_user.is_admin:
        return jsonify({
            'success': False,
            'error': {'code': 'FORBIDDEN', 'message': '无权限删除此评论'}
        }), 403
    
    db.session.delete(comment)
    db.session.commit()
    
    return jsonify({
        'success': True,
        'message': '评论删除成功'
    })

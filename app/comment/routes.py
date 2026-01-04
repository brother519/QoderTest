from flask import redirect, url_for, flash, request, abort
from flask_login import login_required, current_user
from app.comment import comment_bp
from app.models import Comment, Post
from app.extensions import db


@comment_bp.route('/create/<int:post_id>', methods=['POST'])
@login_required
def comment_create(post_id):
    post = Post.query.get_or_404(post_id)
    content = request.form.get('content')
    parent_id = request.form.get('parent_id', type=int)
    
    if not content or len(content.strip()) == 0:
        flash('评论内容不能为空', 'danger')
        return redirect(url_for('blog.post_detail', slug=post.slug))
    
    if len(content) > 1000:
        flash('评论内容过长（最多1000字符）', 'danger')
        return redirect(url_for('blog.post_detail', slug=post.slug))
    
    comment = Comment(
        content=content.strip(),
        post_id=post_id,
        user_id=current_user.id,
        parent_id=parent_id
    )
    
    db.session.add(comment)
    db.session.commit()
    flash('评论已发表', 'success')
    return redirect(url_for('blog.post_detail', slug=post.slug) + f'#comment-{comment.id}')


@comment_bp.route('/delete/<int:id>', methods=['POST'])
@login_required
def comment_delete(id):
    comment = Comment.query.get_or_404(id)
    post = comment.post
    
    if current_user.id != comment.user_id and not current_user.is_admin:
        abort(403)
    
    db.session.delete(comment)
    db.session.commit()
    flash('评论已删除', 'success')
    return redirect(url_for('blog.post_detail', slug=post.slug))


@comment_bp.route('/approve/<int:id>', methods=['POST'])
@login_required
def comment_approve(id):
    if not current_user.is_admin:
        abort(403)
    
    comment = Comment.query.get_or_404(id)
    comment.is_approved = not comment.is_approved
    db.session.commit()
    
    status = '已批准' if comment.is_approved else '已取消批准'
    flash(f'评论{status}', 'success')
    return redirect(url_for('blog.post_detail', slug=comment.post.slug))

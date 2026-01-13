from flask import render_template, redirect, url_for, flash, request, abort
from flask_login import login_required, current_user
from app.blog import blog_bp
from app.blog.forms import PostForm
from app.models import Post, Category, Tag
from app.extensions import db


@blog_bp.route('/')
def index():
    page = request.args.get('page', 1, type=int)
    category_id = request.args.get('category', type=int)
    tag_id = request.args.get('tag', type=int)
    
    query = Post.query.filter_by(is_published=True)
    
    if category_id:
        query = query.filter_by(category_id=category_id)
    if tag_id:
        tag = Tag.query.get_or_404(tag_id)
        query = query.filter(Post.tags.contains(tag))
    
    pagination = query.order_by(Post.created_at.desc()).paginate(
        page=page, 
        per_page=10, 
        error_out=False
    )
    
    posts = pagination.items
    categories = Category.query.all()
    tags = Tag.query.all()
    
    return render_template('blog/post_list.html', 
                         posts=posts, 
                         pagination=pagination,
                         categories=categories,
                         tags=tags)


@blog_bp.route('/post/<slug>')
def post_detail(slug):
    post = Post.query.filter_by(slug=slug).first_or_404()
    
    if not post.is_published and (not current_user.is_authenticated or 
                                  (current_user.id != post.author_id and not current_user.is_admin)):
        abort(403)
    
    post.view_count += 1
    db.session.commit()
    
    comments = post.comments.filter_by(is_approved=True, parent_id=None).order_by(
        db.text('created_at desc')
    ).all()
    
    return render_template('blog/post_detail.html', post=post, comments=comments)


@blog_bp.route('/post/new', methods=['GET', 'POST'])
@login_required
def post_create():
    form = PostForm()
    form.category.choices = [(0, '无分类')] + [(c.id, c.name) for c in Category.query.all()]
    form.tags.choices = [(t.id, t.name) for t in Tag.query.all()]
    
    if form.validate_on_submit():
        post = Post(
            title=form.title.data,
            content=form.content.data,
            summary=form.summary.data,
            author_id=current_user.id,
            category_id=form.category.data if form.category.data != 0 else None,
            is_published=form.is_published.data
        )
        post.generate_slug()
        
        if form.tags.data:
            tags = Tag.query.filter(Tag.id.in_(form.tags.data)).all()
            post.tags = tags
        
        db.session.add(post)
        db.session.commit()
        flash('文章创建成功！', 'success')
        return redirect(url_for('blog.post_detail', slug=post.slug))
    
    return render_template('blog/post_form.html', form=form, title='创建文章')


@blog_bp.route('/post/<int:id>/edit', methods=['GET', 'POST'])
@login_required
def post_edit(id):
    post = Post.query.get_or_404(id)
    
    if current_user.id != post.author_id and not current_user.is_admin:
        abort(403)
    
    form = PostForm()
    form.category.choices = [(0, '无分类')] + [(c.id, c.name) for c in Category.query.all()]
    form.tags.choices = [(t.id, t.name) for t in Tag.query.all()]
    
    if form.validate_on_submit():
        post.title = form.title.data
        post.content = form.content.data
        post.summary = form.summary.data
        post.category_id = form.category.data if form.category.data != 0 else None
        post.is_published = form.is_published.data
        
        if form.tags.data:
            tags = Tag.query.filter(Tag.id.in_(form.tags.data)).all()
            post.tags = tags
        else:
            post.tags = []
        
        db.session.commit()
        flash('文章更新成功！', 'success')
        return redirect(url_for('blog.post_detail', slug=post.slug))
    
    form.title.data = post.title
    form.content.data = post.content
    form.summary.data = post.summary
    form.category.data = post.category_id if post.category_id else 0
    form.tags.data = [t.id for t in post.tags]
    form.is_published.data = post.is_published
    
    return render_template('blog/post_form.html', form=form, title='编辑文章', post=post)


@blog_bp.route('/post/<int:id>/delete', methods=['POST'])
@login_required
def post_delete(id):
    post = Post.query.get_or_404(id)
    
    if current_user.id != post.author_id and not current_user.is_admin:
        abort(403)
    
    db.session.delete(post)
    db.session.commit()
    flash('文章已删除', 'success')
    return redirect(url_for('blog.index'))

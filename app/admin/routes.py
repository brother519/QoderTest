from flask import render_template, redirect, url_for, flash, request
from flask_login import login_required
from app.admin import admin_bp
from app.admin.forms import CategoryForm, TagForm
from app.models import Category, Tag, Post, User, Comment
from app.extensions import db
from app.utils.decorators import admin_required


@admin_bp.route('/dashboard')
@login_required
@admin_required
def dashboard():
    post_count = Post.query.count()
    user_count = User.query.count()
    comment_count = Comment.query.count()
    category_count = Category.query.count()
    tag_count = Tag.query.count()
    
    recent_posts = Post.query.order_by(Post.created_at.desc()).limit(5).all()
    recent_comments = Comment.query.order_by(Comment.created_at.desc()).limit(5).all()
    
    return render_template('admin/dashboard.html',
                         post_count=post_count,
                         user_count=user_count,
                         comment_count=comment_count,
                         category_count=category_count,
                         tag_count=tag_count,
                         recent_posts=recent_posts,
                         recent_comments=recent_comments)


@admin_bp.route('/categories')
@login_required
@admin_required
def category_list():
    categories = Category.query.all()
    return render_template('admin/categories.html', categories=categories)


@admin_bp.route('/categories/new', methods=['GET', 'POST'])
@login_required
@admin_required
def category_create():
    form = CategoryForm()
    if form.validate_on_submit():
        category = Category(
            name=form.name.data,
            slug=form.slug.data,
            description=form.description.data
        )
        db.session.add(category)
        db.session.commit()
        flash('分类创建成功！', 'success')
        return redirect(url_for('admin.category_list'))
    
    return render_template('admin/category_form.html', form=form, title='创建分类')


@admin_bp.route('/categories/<int:id>/edit', methods=['GET', 'POST'])
@login_required
@admin_required
def category_edit(id):
    category = Category.query.get_or_404(id)
    form = CategoryForm()
    
    if form.validate_on_submit():
        category.name = form.name.data
        category.slug = form.slug.data
        category.description = form.description.data
        db.session.commit()
        flash('分类更新成功！', 'success')
        return redirect(url_for('admin.category_list'))
    
    form.name.data = category.name
    form.slug.data = category.slug
    form.description.data = category.description
    
    return render_template('admin/category_form.html', form=form, title='编辑分类')


@admin_bp.route('/categories/<int:id>/delete', methods=['POST'])
@login_required
@admin_required
def category_delete(id):
    category = Category.query.get_or_404(id)
    db.session.delete(category)
    db.session.commit()
    flash('分类已删除', 'success')
    return redirect(url_for('admin.category_list'))


@admin_bp.route('/tags')
@login_required
@admin_required
def tag_list():
    tags = Tag.query.all()
    return render_template('admin/tags.html', tags=tags)


@admin_bp.route('/tags/new', methods=['GET', 'POST'])
@login_required
@admin_required
def tag_create():
    form = TagForm()
    if form.validate_on_submit():
        tag = Tag(
            name=form.name.data,
            slug=form.slug.data
        )
        db.session.add(tag)
        db.session.commit()
        flash('标签创建成功！', 'success')
        return redirect(url_for('admin.tag_list'))
    
    return render_template('admin/tag_form.html', form=form, title='创建标签')


@admin_bp.route('/tags/<int:id>/edit', methods=['GET', 'POST'])
@login_required
@admin_required
def tag_edit(id):
    tag = Tag.query.get_or_404(id)
    form = TagForm()
    
    if form.validate_on_submit():
        tag.name = form.name.data
        tag.slug = form.slug.data
        db.session.commit()
        flash('标签更新成功！', 'success')
        return redirect(url_for('admin.tag_list'))
    
    form.name.data = tag.name
    form.slug.data = tag.slug
    
    return render_template('admin/tag_form.html', form=form, title='编辑标签')


@admin_bp.route('/tags/<int:id>/delete', methods=['POST'])
@login_required
@admin_required
def tag_delete(id):
    tag = Tag.query.get_or_404(id)
    db.session.delete(tag)
    db.session.commit()
    flash('标签已删除', 'success')
    return redirect(url_for('admin.tag_list'))

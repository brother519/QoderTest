from flask import jsonify, request
from flask_login import login_user, logout_user, current_user
from app.api import api_bp
from app.models import User
from app.extensions import db


@api_bp.route('/auth/register', methods=['POST'])
def register():
    data = request.get_json()
    
    if not data or 'username' not in data or 'email' not in data or 'password' not in data:
        return jsonify({
            'success': False,
            'error': {'code': 'VALIDATION_ERROR', 'message': '用户名、邮箱和密码为必填项'}
        }), 400
    
    if User.query.filter_by(username=data['username']).first():
        return jsonify({
            'success': False,
            'error': {'code': 'VALIDATION_ERROR', 'message': '用户名已存在'}
        }), 400
    
    if User.query.filter_by(email=data['email']).first():
        return jsonify({
            'success': False,
            'error': {'code': 'VALIDATION_ERROR', 'message': '邮箱已被注册'}
        }), 400
    
    user = User(username=data['username'], email=data['email'])
    user.set_password(data['password'])
    db.session.add(user)
    db.session.commit()
    
    return jsonify({
        'success': True,
        'data': {'user': {'id': user.id, 'username': user.username, 'email': user.email}},
        'message': '注册成功'
    }), 201


@api_bp.route('/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    
    if not data or 'username' not in data or 'password' not in data:
        return jsonify({
            'success': False,
            'error': {'code': 'VALIDATION_ERROR', 'message': '用户名和密码为必填项'}
        }), 400
    
    user = User.query.filter_by(username=data['username']).first()
    
    if not user or not user.check_password(data['password']):
        return jsonify({
            'success': False,
            'error': {'code': 'AUTHENTICATION_ERROR', 'message': '用户名或密码错误'}
        }), 401
    
    login_user(user, remember=data.get('remember', False))
    
    return jsonify({
        'success': True,
        'data': {'user': {'id': user.id, 'username': user.username, 'email': user.email}},
        'message': '登录成功'
    })


@api_bp.route('/auth/logout', methods=['POST'])
def logout():
    logout_user()
    return jsonify({
        'success': True,
        'message': '登出成功'
    })


@api_bp.route('/auth/me', methods=['GET'])
def get_current_user():
    if not current_user.is_authenticated:
        return jsonify({
            'success': False,
            'error': {'code': 'UNAUTHORIZED', 'message': '未登录'}
        }), 401
    
    return jsonify({
        'success': True,
        'data': {
            'user': {
                'id': current_user.id,
                'username': current_user.username,
                'email': current_user.email,
                'is_admin': current_user.is_admin
            }
        }
    })

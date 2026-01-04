from flask import Blueprint

comment_bp = Blueprint('comment', __name__)

from app.comment import routes

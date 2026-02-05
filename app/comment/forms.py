from flask_wtf import FlaskForm
from wtforms import TextAreaField, SubmitField
from wtforms.validators import DataRequired, Length


class CommentForm(FlaskForm):
    content = TextAreaField('评论内容', validators=[
        DataRequired(message='评论内容不能为空'),
        Length(1, 1000, message='评论内容长度必须在1-1000个字符之间')
    ])
    submit = SubmitField('提交评论')

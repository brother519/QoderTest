from flask_wtf import FlaskForm
from wtforms import StringField, TextAreaField, SubmitField
from wtforms.validators import DataRequired, Length


class CategoryForm(FlaskForm):
    name = StringField('分类名称', validators=[DataRequired(), Length(1, 64)])
    slug = StringField('URL别名', validators=[DataRequired(), Length(1, 64)])
    description = TextAreaField('描述')
    submit = SubmitField('提交')


class TagForm(FlaskForm):
    name = StringField('标签名称', validators=[DataRequired(), Length(1, 64)])
    slug = StringField('URL别名', validators=[DataRequired(), Length(1, 64)])
    submit = SubmitField('提交')

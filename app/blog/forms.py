from flask_wtf import FlaskForm
from wtforms import StringField, TextAreaField, BooleanField, SelectField, SelectMultipleField, SubmitField
from wtforms.validators import DataRequired, Length


class PostForm(FlaskForm):
    title = StringField('标题', validators=[DataRequired(), Length(1, 200)])
    content = TextAreaField('内容', validators=[DataRequired()])
    summary = StringField('摘要', validators=[Length(0, 500)])
    category = SelectField('分类', coerce=int)
    tags = SelectMultipleField('标签', coerce=int)
    is_published = BooleanField('发布')
    submit = SubmitField('提交')

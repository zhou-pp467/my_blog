from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _


class Category(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=20, unique=True)

    class Meta:
        managed = True


class User(AbstractUser):
    id = models.AutoField(primary_key=True)
    username = models.CharField(max_length=60,unique=True)
    password = models.TextField(null=False)
    email = models.EmailField(null=True)
    phone = models.CharField(null=True, max_length=20)
    avatar = models.URLField(null=True)
    privilege = models.PositiveSmallIntegerField(default=2)
    USERNAME_FIELD = 'username'

    class Meta:
        managed = True


def validate_title_length(value):
    if len(value) < 5 or len(value) > 100:
        raise ValidationError(
            _('length of %(value) should be between 5 and 100 '),
            params={'value': value},
        )


class Articles(models.Model):
    id = models.AutoField(primary_key=True)
    time = models.DateTimeField(auto_now_add=True)
    userId = models.ForeignKey(User, on_delete=models.CASCADE)
    title = models.TextField(validators=[validate_title_length])
    content = models.TextField(max_length=30000)
    upvoteNum = models.IntegerField(default=0)
    commentNum = models.IntegerField(default=0)
    readNum = models.IntegerField(default=0)
    category = models.ForeignKey(Category, null=True, on_delete=models.SET_NULL)

    class Meta:
        managed = True


class Comments(models.Model):
    id = models.AutoField(primary_key=True)
    time = models.DateTimeField(auto_now_add=True)
    upvoteNum = models.IntegerField(default=0)
    userId = models.ForeignKey(User, null=True, on_delete=models.SET_NULL)
    articleId = models.ForeignKey(Articles, on_delete=models.CASCADE)
    content = models.CharField(max_length=500)
    replyUserId = models.IntegerField()
    replyUserName = models.CharField(max_length=100, default='未知用户')
    ifDeleted = models.IntegerField(default=0)
    type = models.IntegerField() # 评论0；回复1

    class Meta:
        managed = True


class Follow(models.Model):
    id = models.AutoField(primary_key=True)
    followerId = models.ForeignKey(User, on_delete=models.CASCADE)
    followedId = models.IntegerField()

    class Meta:
        managed = True

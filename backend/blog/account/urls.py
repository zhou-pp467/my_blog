# by zhou_pp
from django.urls import path
from rest_framework.urlpatterns import format_suffix_patterns

from . import views
from rest_framework_simplejwt.views import (
    TokenRefreshView, TokenObtainPairView
)

urlpatterns = [
    path('token', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh', TokenRefreshView.as_view(), name='token_refresh'),
    path('user/register', views.register, name='register'),
    path('login', views.login, name='login'),
    path('logout', views.logout, name='logout'),
    path('addTag', views.add_tag, name='add_tag'),
    path('modifyTag', views.modify_tag, name='modify_tag'),
    path('deleteTagById', views.delete_tag_by_id, name='delete_tag_by_id'),
    path('getTags', views.get_tags, name='get_tags'),
    path('blog', views.add_blog, name='add_blog'),
    path('mapBlogById', views.map_blog_by_id, name='map_blog_by_id'),
    path('modify/blog', views.modify_blog, name='modify_blog'),
    path('deleteBlogById', views.delete_blog_by_Id, name='delete_blog_by_Id'),
    path('comment', views.add_comment, name='add_comment'),
    path('deleteCommentById', views.delete_comment_by_Id, name='delete_comment_by_Id'),
    path('upload/avatar', views.upload, name='upload'),
    path('modify/userInfo', views.modify_userinfo, name='modify_userinfo'),
    path('modify/password', views.modify_password, name='modify_password'),
    path('getBlogDetail', views.get_blog_detail, name='get_blog_detail'),
    path('getUserInfo', views.get_user_info, name='get_user_info'),
    path('getPersonalCenter', views.get_personal_center, name='get_personal_center'),
    path('query/info', views.get_other_info, name='get_other_info'),
    path('getCategoryMenu', views.get_category_menu, name='get_category_menu'),
    path('forkUser', views.fork_user, name='fork_user'),
    path('cancel/fork', views.cancel_fork, name='cancel_fork'),
]


urlpatterns = format_suffix_patterns(urlpatterns)
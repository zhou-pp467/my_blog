import uuid
import qiniu
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from rest_framework.authentication import BasicAuthentication, TokenAuthentication
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.views.decorators.csrf import csrf_exempt
from django.db.models import Q
from django.contrib.auth import get_user_model
from django.contrib.auth.hashers import make_password
from qiniu import Auth


from .serializer import UserSerializer, CategorySerializer, \
    ArticleSerializer, CommentSerializer, FollowSerializer
from .models import Category, Articles, Comments, Follow
from .utils import get_userid_from_token

User = get_user_model()

AUTH = Auth('Ii7G8QcRCj3bsNquTxr2RegKImtlvI5_8QRt7Ca7',
            'FYT9M2KChn_V3BJAWRnlkuFkbBqH4cThBuL8MtVh')
BUCKET_NAME = 'zhou-pp'
pre_url = 'http://img.aryazdp.cn/'


@api_view(['POST'])
@authentication_classes([BasicAuthentication])
@permission_classes((AllowAny,))
def register(request):
    if request.method == 'POST':
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({'businessCode': 1000, 'content': True})
        return Response({'businessCode': 1001, 'content': False,
                         'message': serializer.errors})


@api_view(['POST'])
@csrf_exempt
# @permission_classes((AllowAny,))
def upload(request):
    key = f'{uuid.uuid1().hex}'
    token = AUTH.upload_token(BUCKET_NAME, key, 3600 * 24)
    photo = request.FILES.get('file')
    ret, info = qiniu.put_data(token, key, photo)
    if info.status_code == 200:
        full_url = ret['key']
        return Response({"businessCode": 1000, "content": pre_url + full_url})
    else:
        return Response({"businessCode": 1001, "content": info.exception})


@api_view(['POST'])
@authentication_classes([BasicAuthentication])
@permission_classes((AllowAny,))
def login(request):
    try:
        username = request.data['username']
        password = request.data['password']
        user = User.objects.get(Q(username=username) | Q(email=username) |
                                Q(phone=username))
        if user.check_password(password):
            return Response({"businessCode": 1000, "content": True})
        else:
            return Response({"businessCode": 1001, "content": False, "msg": "用户名或密码错误"})
    except Exception as e:
        return Response({"businessCode": 1001, "content": False, "msg": str(e)})


@api_view(['POST'])
@permission_classes((IsAuthenticated,))
def logout(request):
    try:
        token = RefreshToken(request.data.get('refresh'))
        token.blacklist()
        return Response({"businessCode": 1000, "content": True})
    except Exception as e:
        return Response({"businessCode": 1001, "content": False})


@api_view(['POST'])
@permission_classes((IsAdminUser,))
def add_tag(request):
    name = request.data['tagName']
    serializer = CategorySerializer(data={"name": name})
    if serializer.is_valid():
        serializer.save()
        return Response({'businessCode': 1000, 'content': True})
    return Response({'businessCode': 1001, 'content': False, 'msg': serializer.errors})


@api_view(['POST'])
@permission_classes((IsAdminUser,))
def modify_tag(request):
    try:
        tag = Category.objects.get(pk=request.data['tagId'])
    except Exception:
        return Response({'businessCode': 1001, 'content': False, 'msg': 'not exist'})
    name = request.data['tagName']
    serializer = CategorySerializer(tag, data={"name": name})
    if serializer.is_valid():
        serializer.save()
        return Response({'businessCode': 1000, 'content': True})
    return Response({'businessCode': 1001, 'content': False, 'msg': serializer.errors})


@api_view(['POST'])
@permission_classes((IsAdminUser,))
def delete_tag_by_id(request):
    try:
        tag = Category.objects.get(pk=request.data['tagId'])
    except Exception:
        return Response({'businessCode': 1001, 'content': False, 'msg': 'not exist'})
    tag.delete()
    return Response({'businessCode': 1000, 'content': True})


@api_view(['GET'])
# @authentication_classes([BasicAuthentication])
# @permission_classes((AllowAny,))
def get_tags(request):
    try:
        tag_list = Category.objects.all().order_by('id')
        serializer = CategorySerializer(tag_list, many=True)
    except Exception:
        return Response({'businessCode': 1001, 'content': False, 'msg': 'not exist'})
    return Response({'businessCode': 1000, 'content': serializer.data})


@api_view(['POST'])
@permission_classes((IsAuthenticated,))
def add_blog(request):
    try:
        token = str(request.auth)
        title = request.data['blogTitle']
        content = request.data['blogContent']
        tagId = request.data['tagId']
        user_id = get_userid_from_token(token)
        serializer = ArticleSerializer(data={"userId": user_id, 'title': title, 'content': content, 'category': tagId})
    except Exception:
        return Response({'businessCode': 1001, 'content': False, 'msg': 'invalid data'})
    if serializer.is_valid():
        serializer.save()
        return Response({'businessCode': 1000, 'content': True})
    return Response({'businessCode': 1001, 'content': False, 'msg': serializer.errors})


@api_view(['POST'])
@permission_classes((IsAuthenticated,))
def modify_blog(request):
    try:
        blog = Articles.objects.get(pk=request.data['blogId'])
    except Exception:
        return Response({'businessCode': 1001, 'content': False, 'msg': 'not exist'})
    try:
        token = str(request.auth)
        user_id = get_userid_from_token(token)
        userId = User.objects.get(pk=user_id)
        if blog.userId == userId:  # 实际为username
            try:
                token = str(request.auth)
                title = request.data['blogTitle']
                content = request.data['blogContent']
                tagId = request.data['tagId']
                user_id = get_userid_from_token(token)
                serializer = ArticleSerializer(blog, data={"userId": user_id, 'title': title, 'content': content,
                                                           'category': tagId})
            except Exception:
                return Response({'businessCode': 1001, 'content': False, 'msg': 'invalid data'})
            if serializer.is_valid():
                serializer.save()
                return Response({'businessCode': 1000, 'content': True})
            return Response({'businessCode': 1001, 'content': False, 'msg': serializer.errors})
        else:
            return Response({'businessCode': 1001, 'content': False, 'msg': 'not permitted'})
    except Exception as e:
        return Response({'businessCode': 1001, 'content': False, 'msg': str(e)})


@api_view(['POST'])
@permission_classes((IsAuthenticated,))
def delete_blog_by_Id(request):
    try:
        blog = Articles.objects.get(pk=request.data['blogId'])
    except Exception:
        return Response({'businessCode': 1001, 'content': False, 'msg': 'not exist'})
    try:
        token = str(request.auth)
        user_id = get_userid_from_token(token)
        userId = User.objects.get(pk=user_id)
        if blog.userId == userId:  # 实际为username
            blog.delete()
            return Response({'businessCode': 1000, 'content': True})
        else:
            return Response({'businessCode': 1001, 'content': False, 'msg': 'not permitted'})
    except Exception:
        return Response({'businessCode': 1001, 'content': False})


@api_view(['POST'])
@permission_classes((IsAuthenticated,))
def map_blog_by_id(request):
    try:
        blog = Articles.objects.get(pk=request.data['blogId'])
    except Exception:
        return Response({'businessCode': 1001, 'content': False, 'msg': 'not exist'})
    try:
        token = str(request.auth)
        user_id = get_userid_from_token(token)
        userId = User.objects.get(pk=user_id)
        if blog.userId == userId:  # 实际为username
            tag_id = ArticleSerializer(blog).data['category']
            tag = Category.objects.get(pk=tag_id)
            tag_name = CategorySerializer(tag).data['name']
            content = {
                "blogTitle": ArticleSerializer(blog).data['title'],
                "blogId": ArticleSerializer(blog).data['id'],
                "blogContent": ArticleSerializer(blog).data['content'],
                "tagName": tag_name,
                "tagId": tag_id,
            }
            return Response({'businessCode': 1000, 'content': content})
        else:
            return Response({'businessCode': 1001, 'content': False, 'msg': 'not permitted'})
    except Exception as e:
        return Response({'businessCode': 1001, 'content': str(e)})


@api_view(['POST'])
@permission_classes((IsAuthenticated,))
def add_comment(request):
    try:
        token = str(request.auth)
        content = request.data['commentContent']
        replyUserId = request.data['replyUserId']
        replyUserName = request.data['replyUserName']
        articleId = request.data['articleId']
        type = request.data['type']
        user_id = get_userid_from_token(token)
        serializer = CommentSerializer(
            data={"userId": user_id, 'articleId': articleId, 'content': content, 'replyUserId': replyUserId,
                  'replyUserName': replyUserName, 'type': type})
    except Exception:
        return Response({'businessCode': 1001, 'content': False, 'msg': 'invalid data'})
    if serializer.is_valid():
        serializer.save()
        return Response({'businessCode': 1000, 'content': True})
    return Response({'businessCode': 1001, 'content': False, 'msg': serializer.errors})


@api_view(['POST'])
@permission_classes((IsAuthenticated,))
def delete_comment_by_Id(request):
    try:
        comment_m = Comments.objects.get(pk=request.data['commentId'])
        comment = CommentSerializer(comment_m).data
        article = Articles.objects.get(pk=comment['articleId'])
        article = ArticleSerializer(article).data
    except Exception:
        return Response({'businessCode': 1001, 'content': False, 'msg': 'not exist'})
    try:
        token = str(request.auth)
        user_id = get_userid_from_token(token)
        userId = UserSerializer(User.objects.get(pk=user_id)).data['id'] # username
        username = UserSerializer(User.objects.get(pk=user_id)).data['username']
        article_userId = article['userId']
        if comment['userId'] == userId or article_userId == userId:
            serializer = CommentSerializer(comment_m,
                data={"userId": comment['userId'], 'articleId': comment['articleId'], 'content': '评论已被'+f'{username}'+'删除',
                      'replyUserId': comment['replyUserId'], 'replyUserName': comment['replyUserName'], 'ifDeleted': 1})
            if serializer.is_valid():
                serializer.save()
                return Response({'businessCode': 1000, 'content': True})
        else:
            return Response({'businessCode': 1001, 'content': False, 'msg': 'not permitted'})
    except Exception as e:
        return Response({'businessCode': 1001, 'content': str(e)})


@api_view(['POST'])
@permission_classes((IsAuthenticated,))
def modify_password(request):
    try:
        token = str(request.auth)
        user_id = get_userid_from_token(token)
        user = User.objects.get(pk=user_id)
        oldPwd = request.data['oldPwd']
        newPwd = request.data['newPwd']
    except Exception:
        return Response({'businessCode': 1001, 'content': False, 'msg': 'not exist'})
    try:
        correct = user.check_password(oldPwd)
        if correct:
            try:
                password = make_password(newPwd)
                serializer = UserSerializer(user, data={'password': password, 'username': user.username})
            except Exception:
                return Response({'businessCode': 1005, 'content': False, 'msg': 'invalid data'})
            if serializer.is_valid():
                serializer.save()
                return Response({'businessCode': 1000, 'content': True})
            return Response({'businessCode': 1004, 'content': False, 'msg': serializer.errors})
        else:
            return Response({'businessCode': 1003, 'content': False, 'msg': 'not permitted'})
    except Exception as e:
        return Response({'businessCode': 1002, 'content': False, 'msg': str(e)})


@api_view(['POST'])
@permission_classes((IsAuthenticated,))
def modify_userinfo(request):
    try:
        token = str(request.auth)
        user_id = get_userid_from_token(token)
        user = User.objects.get(pk=user_id)
    except Exception:
        return Response({'businessCode': 1001, 'content': False, 'msg': 'not exist'})
    try:
        username = request.data['userName']
        if user.username == username:
            try:
                email = request.data['email']
                avatar = request.data['avatar']
                mobile = request.data['mobile']
                serializer = UserSerializer(user, data={'username':user.username,'password':user.password, 'email': email, 'phone': mobile, 'avatar': avatar})
            except Exception:
                return Response({'businessCode': 1005, 'content': False, 'msg': 'invalid data'})
            if serializer.is_valid():
                serializer.save()
                return Response({'businessCode': 1000, 'content': True})
            return Response({'businessCode': 1004, 'content': False, 'msg': serializer.errors})
        else:
            return Response({'businessCode': 1003, 'content': False, 'msg': 'not permitted'})
    except Exception as e:
        return Response({'businessCode': 1002, 'content': False, 'msg': str(e)})


@api_view(['POST'])
@permission_classes((IsAuthenticated,))
def fork_user(request):
    try:
        token = str(request.auth)
        follower_id = get_userid_from_token(token)
        followed_id = request.data['userId']
    except Exception:
        return Response({'businessCode': 1001, 'content': False, 'msg': 'not exist'})
    serializer = FollowSerializer(data={'followerId': follower_id, 'followedId': followed_id})
    if serializer.is_valid():
        serializer.save()
        return Response({'businessCode': 1000, 'content': True})
    return Response({'businessCode': 1004, 'content': False, 'msg': serializer.errors})


@api_view(['POST'])
@permission_classes((IsAuthenticated,))
def cancel_fork(request):
    try:
        token = str(request.auth)
        follower_id = get_userid_from_token(token)
        followed_id = request.data['userId']
        follow = Follow.objects.filter(Q(followerId=follower_id)&Q(followedId=followed_id))
    except Exception:
        return Response({'businessCode': 1001, 'content': False, 'msg': 'not exist'})
    follow.delete()
    return Response({'businessCode': 1000, 'content': True})


@api_view(['GET'])
# @authentication_classes([BasicAuthentication, TokenAuthentication])
# @permission_classes((AllowAny,))
def get_blog_detail(request):
    try:
        if request.auth:
            token = str(request.auth)
        else:
            token = None
        if token:
            my_id = get_userid_from_token(token)
        blog_id = request.query_params['blogId']
        blog = Articles.objects.get(pk=blog_id)
        blog = ArticleSerializer(blog).data
        author_id = blog['userId']  # name
        author = User.objects.get(pk=author_id)
        author = UserSerializer(author).data
        comment_list = Comments.objects.filter(articleId=blog_id).order_by('time')
        comment_list = CommentSerializer(comment_list, many=True).data

        def map_function(x):
            c_user = User.objects.get(pk=x['userId'])
            c_user = UserSerializer(c_user).data
            comment = Comments.objects.get(id=x['id'])
            comment = CommentSerializer(comment).data
            return {
                'userId': c_user['id'],
                'userName': c_user['username'],
                'userAvatar': c_user['avatar'],
                'commentContent': comment['content'],
                'commentId': comment['id'],
                'commentDate': comment['time'],
                'replyUserName': comment['replyUserName'],
                'replyUserId': comment['replyUserId'],
                'ifDeleted': comment['ifDeleted'],
                'type': comment['type'],
            }
        comment_list_json = list(map(map_function, comment_list))
        # userInfo
        user = User.objects.get(id=author['id'])
        user_serializer = UserSerializer(user).data
        username = user_serializer['username']
        userId = user_serializer['id']
        avatar = user_serializer['avatar']
        create_time = user_serializer['date_joined']
        role = user_serializer['role']
        fork_number = Follow.objects.filter(followerId=author['id']).count()
        follower_number = Follow.objects.filter(followedId=author['id']).count()
        if token:
            is_forked = Follow.objects.filter(followerId=my_id).filter(followedId=userId).count() > 0
        else:
            is_forked = False
        user_info = {
            "userId": userId,
            "username": username,
            "avatar": avatar,
            "createTime": create_time,
            "forkNumber": fork_number,
            "followerNumber": follower_number,
            "role": role,
            "isForked": is_forked,
        }
        content = {
            "userInfo": user_info,
            "blogId": blog['id'],
            "blogTitle": blog['title'],
            "blogContent": blog['content'],
            "createTime": blog['time'],
            "userId": author['id'],
            "avatar": author['avatar'],
            "userName": author['username'],
            "commentList": comment_list_json
        }
        return Response({'businessCode': 1000, 'content': content})
    except Exception as e:
        return Response({'businessCode': 1001, 'content': False, 'msg': str(e)})


@api_view(['POST'])
@permission_classes((IsAuthenticated,))
def get_user_info(request):
    try:
        print(request)
        token = str(request.auth)
        print(token, '========token')
        user_id = get_userid_from_token(token)
        print(user_id,'------------------')
        user = User.objects.get(id=user_id)
    except Exception as e:
        return Response({'businessCode': 1001, 'content': False, 'msg': str(e)})
    serializer = UserSerializer(user)
    content = {
        "username": serializer.data['username'],
        "userId": serializer.data['id'],
        "email": serializer.data['email'],
        "mobile": serializer.data['phone'],
        "avatar": serializer.data['avatar'],
        "role": serializer.data['role']
    }
    return Response({'businessCode': 1000, 'content': content})


@api_view(['GET'])
# @authentication_classes([BasicAuthentication, TokenAuthentication])
# @permission_classes((AllowAny,))
def get_category_menu(request):
    try:
        tags = Category.objects.all()
        tag_list = CategorySerializer(tags, many=True)
        content = []
        for tag in tag_list.data:
            articles = Articles.objects.filter(category=tag['id'])
            article_list = ArticleSerializer(articles, many=True)
            article_item = []
            for article in article_list.data:
                comment_amount = Comments.objects.filter(articleId=article['id']).count()
                user = User.objects.get(id=article['userId'])
                user_serializer = UserSerializer(user)
                avatar = user_serializer.data['avatar']
                article_item.append({
                    'blogTitle': article['title'],
                    'blogContent': article['content'],
                    'blogId': article['id'],
                    'commentAmount': comment_amount,
                    'createTime': article['time'],
                    'avatar': avatar
                })
            content.append({
                'tagName': tag['name'],
                'blogList': article_item,
                'tagId': tag['id']
            })
        return Response({'businessCode': 1000, 'content': content})
    except Exception as e:
        return Response({'businessCode': 1001, 'content': False, 'msg': str(e)})


@api_view(['POST'])
@permission_classes((IsAuthenticated,))
def get_personal_center(request):
    try:
        token = str(request.auth)
        user_id = get_userid_from_token(token)
        articles = Articles.objects.filter(userId=user_id)
        article_list = ArticleSerializer(articles, many=True)
        blog_list = []
        for article in article_list.data:
            comment_amount = Comments.objects.filter(articleId=article['id']).count()
            user = User.objects.get(id=article['userId'])
            user_serializer = UserSerializer(user)
            avatar = user_serializer.data['avatar']
            blog_list.append({
                'blogTitle': article['title'],
                'blogContent': article['content'],
                'blogId': article['id'],
                'commentAmount': comment_amount,
                'createTime': article['time'],
                'avatar': avatar
            })

        # forkList
        forks = Follow.objects.filter(followerId=user_id)
        forks_ids = FollowSerializer(forks, many=True).data

        def get_fork_list(item):
            id = item['followedId']
            user = User.objects.get(id=id)
            user_serializer = UserSerializer(user).data
            isForked = Follow.objects.filter(followerId=user_id).filter(followedId=id).count()>0
            return {
                'username': user_serializer['username'],
                'avatar': user_serializer['avatar'],
                'isForked': isForked,
                'userId': user_serializer['id']
            }
        fork_list = map(get_fork_list, forks_ids)

        # followerList
        followers = Follow.objects.filter(followedId=user_id)
        followers_ids = FollowSerializer(followers, many=True).data

        def get_follower_list(item):
            id = item['followerId']
            user = User.objects.get(id=id)
            user_serializer = UserSerializer(user).data
            isForked = Follow.objects.filter(followerId=user_id).filter(followedId=id).count() > 0
            return {
                'username': user_serializer['username'],
                'avatar': user_serializer['avatar'],
                'isForked': isForked,
                'userId': user_serializer['id']
            }

        follower_list = map(get_follower_list, followers_ids)

        # asideMenu
        user = User.objects.get(id=user_id)
        user_serializer = UserSerializer(user).data
        is_manager = user_serializer['is_staff']
        aside_menu = [
            {"menuName": '博客中心', "menuId": 1, "menuType": 'blog'},
            {"menuName": '设置中心', "menuId": 2, "menuType": 'settings'}
        ]
        if is_manager:
            aside_menu.append({"menuName": '管理中心', "menuId": 3, "menuType": 'admin'})

        # createTime
        createTime = user_serializer['date_joined']

        return Response({'businessCode': 1000, 'content': {
            "myBlogList": blog_list,
            "forkList": fork_list,
            "followerList": follower_list,
            "asideMenu": aside_menu,
            "createTime": createTime
        }})
    except Exception as e:
        return Response({'businessCode': 1001, 'content': False, 'msg': str(e)})


@api_view(['GET'])
# @authentication_classes([BasicAuthentication, TokenAuthentication])
# @permission_classes((AllowAny,))
def get_other_info(request):
    try:
        user_id = request.query_params['userId']
        token = str(request.auth) or None
        print(request.auth,token,'================')
        if token:
            my_id = get_userid_from_token(token)

        # blogList
        articles = Articles.objects.filter(userId=user_id)
        article_list = ArticleSerializer(articles, many=True)
        blog_list = []
        for article in article_list.data:
            comment_amount = Comments.objects.filter(articleId=article['id']).count()
            user = User.objects.get(id=article['userId'])
            user_serializer = UserSerializer(user)
            avatar = user_serializer.data['avatar']
            blog_list.append({
                'blogTitle': article['title'],
                'blogContent': article['content'],
                'blogId': article['id'],
                'commentAmount': comment_amount,
                'createTime': article['time'],
                'avatar': avatar
            })

        # userInfo
        user = User.objects.get(id=user_id)
        user_serializer = UserSerializer(user).data
        username = user_serializer['username']
        role = user_serializer['role']
        avatar = user_serializer['avatar']
        create_time = user_serializer['date_joined']
        fork_number = Follow.objects.filter(followerId=user_id).count()
        follower_number = Follow.objects.filter(followedId=user_id).count()
        if token :
            is_forked = Follow.objects.filter(followerId=my_id).filter(followedId=user_id).count() >0
        else:
            is_forked = False
        user_info = {
            "userId": user_id,
            "username": username,
            "avatar": avatar,
            "createTime": create_time,
            "forkNumber": fork_number,
            "followerNumber": follower_number,
            "role": role,
            "isForked": is_forked,
        }

        return Response({'businessCode': 1000, 'content': {
            "myBlogList": blog_list,
            "userInfo": user_info
        }})
    except Exception as e:
        return Response({'businessCode': 1001, 'content': False, 'msg': str(e)})
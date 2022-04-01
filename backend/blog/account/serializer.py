# by zhou_pp
from rest_framework import serializers
from .models import Articles, User, Category, Comments, Follow


class UserSerializer(serializers.ModelSerializer):
    role = serializers.SerializerMethodField(required=False)
    date_joined = serializers.DateTimeField(format='%Y-%m-%d',required=False)

    class Meta:
        model = User
        fields = ('id', 'username','password', 'avatar', 'is_superuser',
                  'role', 'email', 'phone','date_joined', 'is_staff')
        extra_kwargs = {
            'password': {
                'write_only': True
            }
        }

    def create(self, validated_data):
        user = User(**validated_data)
        user.set_password(validated_data['password'])
        user.save()
        return user

    def get_role(self, obj):
        if obj.is_staff == 1:
            return 0
        elif obj.is_staff == 0:
            return 1
        else:
            return ''


class CategorySerializer(serializers.ModelSerializer):

    tagId = serializers.SerializerMethodField()
    tagName = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = '__all__'

    def get_tagId(self, obj):
        return obj.id

    def get_tagName(self, obj):
        return obj.name


class ArticleSerializer(serializers.ModelSerializer):

    time = serializers.DateTimeField(
        format='%Y-%m-%d %H:%M:%S',
        required=False
    )

    class Meta:
        model = Articles
        fields = "__all__"


class CommentSerializer(serializers.ModelSerializer):

    time = serializers.DateTimeField(
        format='%Y-%m-%d %H:%M:%S',
        required=False
    )

    class Meta:
        model = Comments
        fields = '__all__'


class FollowSerializer(serializers.ModelSerializer):

    class Meta:
        model = Follow
        fields = '__all__'

from rest_framework import serializers
from .models import UserStrategy , TemplateStrategy

class BaseModelSerializer(serializers.ModelSerializer):
    class Meta:
        fields = ['id' , 'title', 'description']
        abstract = True

class UserSerializer(BaseModelSerializer):
    author = serializers.StringRelatedField()

    class Meta(BaseModelSerializer.Meta):
        model = UserStrategy
        fields = BaseModelSerializer.Meta.fields + ['author','code']

class UserListSerializer(BaseModelSerializer):
    class Meta(BaseModelSerializer.Meta):
        model  = UserStrategy
        fields = BaseModelSerializer.Meta.fields

class TemplateSerializer(BaseModelSerializer):
    class Meta(BaseModelSerializer.Meta):
        model = TemplateStrategy
        fields = BaseModelSerializer.Meta.fields + ['code']

class TemplateListSerializer(BaseModelSerializer):
    class Meta(BaseModelSerializer.Meta):
        model  = TemplateStrategy 
        fields = BaseModelSerializer.Meta.fields + ['tags']

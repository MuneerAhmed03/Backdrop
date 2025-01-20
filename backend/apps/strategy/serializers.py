from rest_framework import serializers
from .models import UserStrategy , TemplateStrategy

class BaseModelSerializer(serializers.ModelSerializer):
    class Meta:
        fields = ['id' , 'title', 'description', 'code' , 'created_at', 'updated_at']
        abstract = True

class UserSerializer(BaseModelSerializer):
    authors = serializers.StringRelatedField()

    class Meta(BaseModelSerializer.Meta):
        model = UserStrategy
        fields = BaseModelSerializer.Meta.fields + ['author']


class TemplateSerializer(BaseModelSerializer):
    class Meta(BaseModelSerializer.Meta):
        model = TemplateStrategy
        fields = BaseModelSerializer.Meta.fields + ['tags'] 

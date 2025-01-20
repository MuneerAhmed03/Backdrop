from django.db import models
from django.contrib.auth import get_user_model

# Create your models here
User = get_user_model()

class BaseStrategy(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True,null=True)
    code = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateField(auto_now=True)

    class Meta:
        abstract = True

    def __str__(self):
        return self.title
    

class UserStrategy(BaseStrategy):
    author = models.ForeignKey(User, on_delete=models.CASCADE,related_name='user_strategies')

class TemplateStrategy(BaseStrategy):
    tags = models.CharField(max_length=100, blank=True,null=True)

    
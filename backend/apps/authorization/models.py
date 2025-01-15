from django.db import models
from django.contrib.auth.models import AbstractUser

# Create your models here.
class User(AbstractUser):
    username=models.CharField(max_length=255,blank=True)
    email=models.EmailField(unique=True)
    profile_pictue=models.URLField(blank=True,null=True)

    USERNAME_FIELD = 'email' 
    REQUIRED_FIELDS = []

    def __str__(self):
        return self.email


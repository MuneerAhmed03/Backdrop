from django.db import models
from django.contrib.postgres.indexes import GinIndex
from django.contrib.postgres.search import SearchVectorField
from django.contrib.postgres.search import SearchVector
# Create your models here.

class StockData(models.Model):
    symbol = models.CharField(max_length=10, unique=True)
    stock_name= models.CharField(null=True,blank=True)
    start_date = models.DateField(null=True)
    latest_date = models.DateField(null=True)
    isEtf = models.BooleanField(default=False)
    source_file = models.CharField(max_length=255)
    search_vector = SearchVectorField(null=True,blank =True)

    class Meta:
        indexes = [GinIndex(fields =['search_vector'])]

    def save(self, *args,**kwargs):
        super().save(*args,**kwargs)

        StockData.objects.filter(pk=self.pk).update(
        search_vector=(
            SearchVector('symbol', weight='A', config='english') +
            SearchVector('stock_name', weight='B', config='english')
        )
    )
        

    def __str__(self):
        return f"{self.symbol} ({self.stock_name})"
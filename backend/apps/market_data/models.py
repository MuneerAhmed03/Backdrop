from django.db import models
from django.contrib.postgres.indexes import GinIndex
from django.contrib.postgres.search import SearchVectorField
from django.contrib.postgres.search import SearchVector

class StockData(models.Model):
    symbol = models.CharField(max_length=10, unique=True)
    stock_name= models.CharField(null=True,blank=True)
    start_date = models.DateField(null=True)
    latest_date = models.DateField(null=True)
    isEtf = models.BooleanField(default=False)
    source_file = models.CharField(max_length=255)

    class Meta:
        indexes = [ 
                    GinIndex(name="stockdata_trgm_symbol_idx", fields=["symbol"], opclasses=["gin_trgm_ops"]),
                    GinIndex(name="stockdata_trgm_stock_name_idx", fields=["stock_name"], opclasses=["gin_trgm_ops"])
                ] 


    def __str__(self):
        return f"{self.symbol} ({self.stock_name})"
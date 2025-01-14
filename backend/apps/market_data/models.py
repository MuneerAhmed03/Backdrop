from django.db import models

# Create your models here.

class StockData(models.Model):
    symbol = models.CharField(max_length=10, unique=True)
    start_date = models.DateField(null=True)
    latest_date = models.DateField(null=True)
    source_file = models.CharField(max_length=255)

    def __str__(self):
        return f"{self.symbol} ({self.start_date} - {self.latest_date})"
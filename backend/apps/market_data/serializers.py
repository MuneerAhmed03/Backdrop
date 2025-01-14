from rest_framework import serializers
from .models import StockData

class StockDataSerializer(serializers.ModelSerializer):
    class Meta:
        model = StockData
        fields = ['symbol', 'source_file', 'start_date', 'latest_date', 'stock_name', 'isEtf']

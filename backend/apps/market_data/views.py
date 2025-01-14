from django.shortcuts import render
import requests
from django.http import JsonResponse
from .models import StockData
# Create your views here.

import requests
from django.http import JsonResponse
from apps.market_data.models import StockData

def fetch_and_store_stock_data(request):
    url = "https://api.github.com/repositories/644013567/contents/daily"
    try:
        response = requests.get(url)  
        response.raise_for_status()  
        
        data = response.json()

        for item in data:
            name = item.get("name", "")
            
            if "_" not in name:  
                source_file = name
                symbol = name.replace(".csv", "").upper() 
                StockData.objects.update_or_create(
                    symbol=symbol,
                    defaults={
                        "source_file": source_file,
                        "start_date": None, 
                        "latest_date": None
                    }
                )
            else:
                print(f"Skipping file with underscore: {name}")

        return JsonResponse({"message": "Stock data processed and stored successfully."}, status=200)

    except requests.exceptions.RequestException as e:
        return JsonResponse({"error": f"Failed to fetch data: {str(e)}"}, status=500)

    except Exception as e:
        return JsonResponse({"error": f"An unexpected error occurred: {str(e)}"}, status=500)

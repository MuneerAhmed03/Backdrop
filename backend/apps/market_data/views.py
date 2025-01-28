import requests
from rest_framework.response import Response
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.permissions import AllowAny
from .models import StockData
from .utils import prepare_dict,prepare_list
import os
from dotenv import load_dotenv
from .serializers import StockDataSerializer
from django.contrib.postgres.search import  TrigramSimilarity
from django.db.models import Q,  FloatField
from django.db.models.functions import  Greatest, Coalesce

@api_view(['GET'])
@authentication_classes([])
@permission_classes([AllowAny])
def search(request):
    query = request.GET.get('q', '').strip()
    if not query:
        return Response({"error": "invalid query"}, status=400)

    stock_list = StockData.objects.annotate(
        symbol_similarity=TrigramSimilarity('symbol', query),
        stock_name_similarity=TrigramSimilarity('stock_name', query),

        max_similarity=Greatest(
            Coalesce('symbol_similarity', 0.0, output_field=FloatField()),
            Coalesce('stock_name_similarity', 0.0, output_field=FloatField())
        )
    ).filter(
        Q(symbol_similarity__gt=0.3) | Q(stock_name_similarity__gt=0.3)
    ).order_by(
        '-max_similarity',  
        '-symbol_similarity', '-stock_name_similarity' 
    )

    serializer = StockDataSerializer(stock_list, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@authentication_classes([])
@permission_classes([AllowAny])
def fetch_and_store_stock_data(request):
    try:
        load_dotenv()
        nse_dict = prepare_dict(os.getenv('names_url'), "SYMBOL", "NAME OF COMPANY", " DATE OF LISTING", "%d-%b-%Y")
        etf_dict = prepare_dict(os.getenv('etf_url'), "Symbol", "SecurityName", "DateofListing", "%d-%b-%y")

        print(os.getenv('url'))
        data = prepare_list(os.getenv('url'))

        for item in data:
            name = item.get("path", "")
            if "_" not in name:  
                source_file = name
                symbol = name.replace(".csv", "").upper() 

                stock_name,start_date = nse_dict.get(symbol,("",None)) 
                isEtf=False
                if not stock_name:
                    stock_name,start_date = etf_dict.get(symbol,("",None)) 
                    isEtf = True if stock_name!="" else False

                stock_data = {
                    "symbol": symbol,
                    "source_file": source_file,
                    "start_date": start_date,
                    "latest_date": None,
                    "stock_name": stock_name,
                    "isEtf": isEtf,                   
                }

                serializer = StockDataSerializer(data=stock_data)

                if serializer.is_valid():
                    serializer.save()
                
            else:
                print(f"Skipping file with underscore: {name}")

        return Response({"message": "Stock data processed and stored successfully."}, status=200)

    except requests.exceptions.RequestException as e:
        return Response({"error": f"Failed to fetch data: {str(e)}"}, status=500)

    except Exception as e:
        return Response({"error": f"An unexpected error occurred: {str(e)}"}, status=500)



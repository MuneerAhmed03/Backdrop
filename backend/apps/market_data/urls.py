from django.urls import path, include
from . import views
app_name="apps.market_data"
urlpatterns = [
    path('fetch-stock-data/',views.fetch_and_store_stock_data,name='fetch_stock_data'),
    path('search/',views.search,name='search')
]
from django.urls import path
from . import views

urlpatterns = [
    # admin only add template
    path('add/template/', views.AddTemplateView.as_view(), name='add-template'),
    
    # add or update user startegy
    path('add/', views.AddOrUpdateUserStrategyView.as_view(), name='add-or-update-strategy'),
    
    # get user strategy
    path('retrieve/', views.GetUserStrategiesView.as_view(), name='get-strategies'),
    
    # get user strategy by id
    path('retrieve/<int:pk>/', views.GetUserStrategyByIdView.as_view(), name='get-strategy'),
    
    # get all templates publix
    path('templates/', views.GetTemplateMetadatView.as_view(), name='get-templates'),
    
    # get template by id (public)
    path('template/<int:pk>/', views.GetTemplateStrategyByIdView.as_view(), name='get-template'),
    
    # delete user start
    path('delete/<int:pk>/', views.DeleteUserStrategyView.as_view(), name='delete-strategy'),
]

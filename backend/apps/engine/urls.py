from django.urls import path
from .views import CodeExecutionView, HealthCheckView, TaskResultView

urlpatterns = [
    path('execute/', CodeExecutionView.as_view(), name='execute-code'),
    path('health/', HealthCheckView.as_view(), name='health-check'),
    path('task/<str:task_id>/', TaskResultView.as_view(), name='task-result'),
] 
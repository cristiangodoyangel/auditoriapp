# dashboard/urls.py
from django.urls import path
from .views import resumen

urlpatterns = [
    path("resumen/", resumen, name="dashboard-resumen"),  # Endpoint para los KPIs
]

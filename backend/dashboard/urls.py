from django.urls import path
from . import views

urlpatterns = [
    path("resumen/", views.resumen, name="dashboard-resumen"),
    path("kpis/", views.dashboard_kpis, name="dashboard_kpis"),
]

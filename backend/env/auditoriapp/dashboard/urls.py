from django.urls import path
from .views import resumen

urlpatterns = [
    path("resumen/", resumen, name="dashboard-resumen"),  # La ruta está correctamente definida
]

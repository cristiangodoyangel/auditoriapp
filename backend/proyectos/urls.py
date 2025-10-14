from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'proyectos', views.ProyectoViewSet, basename='proyecto')
router.register(r'periodos', views.PeriodoViewSet, basename='periodo')
router.register(r'socios', views.SocioViewSet, basename='socio')

urlpatterns = [
    path('', include(router.urls)),
]
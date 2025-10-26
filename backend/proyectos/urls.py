from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'proyectos', views.ProyectoViewSet, basename='proyecto')
router.register(r'asambleas', views.AsambleaViewSet, basename='asamblea')

urlpatterns = [
    path('', include(router.urls)),
]
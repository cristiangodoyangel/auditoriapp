from rest_framework.routers import DefaultRouter
from .views import PeriodoViewSet
from django.urls import path, include

router = DefaultRouter()
router.register(r'periodos', PeriodoViewSet, basename='periodo')

urlpatterns = [
    path('', include(router.urls)),
]

from rest_framework.routers import DefaultRouter
from .views import MovimientoViewSet
from django.urls import path, include

router = DefaultRouter()
router.register(r'movimientos', MovimientoViewSet)

urlpatterns = [
    path('', include(router.urls)),
]

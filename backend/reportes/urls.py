from rest_framework.routers import DefaultRouter
from .views import AuditorReporteViewSet
from django.urls import path, include

router = DefaultRouter()
router.register(r'reportes', AuditorReporteViewSet)

urlpatterns = [
    path('', include(router.urls)),
]

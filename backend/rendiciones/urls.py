from rest_framework.routers import DefaultRouter
from .views import RendicionViewSet
from django.urls import path, include

router = DefaultRouter()
router.register(r'', RendicionViewSet, basename='rendicion')

urlpatterns = [
    path('', include(router.urls)),
]

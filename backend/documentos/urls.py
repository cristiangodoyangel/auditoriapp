from rest_framework.routers import DefaultRouter
from .views import DocumentoViewSet
from django.urls import path, include

router = DefaultRouter()
router.register(r'documentos', DocumentoViewSet)

urlpatterns = [
    path('', include(router.urls)),
]

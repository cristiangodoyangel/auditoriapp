from rest_framework.routers import DefaultRouter
from .views import BeneficiarioViewSet
from django.urls import path, include

router = DefaultRouter()
router.register(r'beneficiarios', BeneficiarioViewSet)

urlpatterns = [
    path('', include(router.urls)),
]

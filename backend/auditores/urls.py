from rest_framework.routers import DefaultRouter
from .views import AuditorViewSet
from django.urls import path, include

router = DefaultRouter()
router.register(r'auditores', AuditorViewSet)

urlpatterns = [
    path('', include(router.urls)),
]

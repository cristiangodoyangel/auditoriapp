from rest_framework.routers import DefaultRouter
from .views import SocioViewSet

router = DefaultRouter()
router.register(r'socios', SocioViewSet)

urlpatterns = router.urls

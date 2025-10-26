from rest_framework.routers import DefaultRouter
from .views import ComunidadViewSet, ConsejoViewSet, SocioViewSet

router = DefaultRouter()
router.register(r'comunidades', ComunidadViewSet)
router.register(r'consejos', ConsejoViewSet)
router.register(r'socios', SocioViewSet)

urlpatterns = router.urls

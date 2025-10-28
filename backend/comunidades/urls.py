from rest_framework.routers import DefaultRouter
from .views import ComunidadViewSet, ConsejoViewSet, SocioViewSet

router = DefaultRouter()
router.register(r'comunidades', ComunidadViewSet, basename='comunidad')
router.register(r'consejos', ConsejoViewSet, basename='consejo')
router.register(r'socios', SocioViewSet, basename='socio')

urlpatterns = router.urls

from django.contrib import admin
from django.urls import path, include
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView, SpectacularRedocView
from django.http import HttpResponse
from django.conf import settings
from django.conf.urls.static import static
from usuarios.views import CustomTokenObtainPairView
from rest_framework_simplejwt.views import TokenRefreshView

def home(request):
    return HttpResponse("Bienvenido a Auditoriapp")

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
    path('api/auth/', include('usuarios.urls')),
    path('api/comunidades/', include('comunidades.urls')),
    path('api/periodos/', include('periodos.urls')),
    path('api/finanzas/', include('finanzas.urls')),
    path('api/beneficiarios/', include('beneficiarios.urls')),
    path('api/documentos/', include('documentos.urls')),
    path('api/auditores/', include('auditores.urls')),
    path('api/reportes/', include('reportes.urls')),
    path('api/rendiciones/', include('rendiciones.urls')),
    path('api/', include('proyectos.urls')),
    path('api/dashboard/', include('dashboard.urls')),
    path('', home),
    path('api/token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]

# Servir archivos de media en desarrollo
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

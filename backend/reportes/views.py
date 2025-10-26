from rest_framework import viewsets
from .models import AuditorReporte
from .serializers import AuditorReporteSerializer

class AuditorReporteViewSet(viewsets.ModelViewSet):
	queryset = AuditorReporte.objects.all()
	serializer_class = AuditorReporteSerializer

from rest_framework import viewsets
from .models import Periodo
from .serializers import PeriodoSerializer

class PeriodoViewSet(viewsets.ModelViewSet):
    queryset = Periodo.objects.all()
    serializer_class = PeriodoSerializer

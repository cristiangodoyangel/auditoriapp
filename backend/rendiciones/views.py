from rest_framework import viewsets
from .models import Rendicion
from .serializers import RendicionSerializer

class RendicionViewSet(viewsets.ModelViewSet):
    queryset = Rendicion.objects.all()
    serializer_class = RendicionSerializer

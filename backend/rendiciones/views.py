from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import Rendicion
from .serializers import RendicionSerializer

class RendicionViewSet(viewsets.ModelViewSet):
    queryset = Rendicion.objects.all()
    serializer_class = RendicionSerializer
    permission_classes = [AllowAny]

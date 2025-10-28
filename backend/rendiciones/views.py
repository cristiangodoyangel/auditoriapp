from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import Rendicion
from .serializers import RendicionSerializer

class RendicionViewSet(viewsets.ModelViewSet):
    serializer_class = RendicionSerializer

    def get_queryset(self):
        user = self.request.user
        if hasattr(user, 'comunidad') and user.comunidad:
            return Rendicion.objects.filter(proyecto__comunidad=user.comunidad)
        return Rendicion.objects.none()
    permission_classes = [AllowAny]

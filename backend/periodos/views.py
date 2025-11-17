from rest_framework import viewsets
from .models import Periodo
from .serializers import PeriodoSerializer

from rest_framework.permissions import IsAuthenticated

class PeriodoViewSet(viewsets.ModelViewSet):
    serializer_class = PeriodoSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if hasattr(user, 'comunidad') and user.comunidad:
            return Periodo.objects.filter(comunidad=user.comunidad)
        return Periodo.objects.none()

    def perform_create(self, serializer):
        user = self.request.user
        
        if hasattr(user, 'rol') and user.rol == 'admin' and user.comunidad:
            serializer.save(comunidad=user.comunidad)
        else:
            serializer.save()

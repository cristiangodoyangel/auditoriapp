from rest_framework import viewsets
from .models import Periodo
from .serializers import PeriodoSerializer

from rest_framework.permissions import IsAuthenticated

class PeriodoViewSet(viewsets.ModelViewSet):
    queryset = Periodo.objects.all()
    serializer_class = PeriodoSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        user = self.request.user
        # Si el usuario es admin y tiene comunidad, asignar automáticamente
        if hasattr(user, 'rol') and user.rol == 'admin' and user.comunidad:
            serializer.save(comunidad=user.comunidad)
        else:
            serializer.save()

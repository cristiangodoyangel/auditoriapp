from rest_framework import viewsets
from .models import Auditor
from .serializers import AuditorSerializer

class AuditorViewSet(viewsets.ModelViewSet):
    queryset = Auditor.objects.all()
    serializer_class = AuditorSerializer

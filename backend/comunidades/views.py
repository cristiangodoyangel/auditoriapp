from rest_framework import viewsets
from .models import Comunidad, Consejo, Socio
from .serializers import ComunidadSerializer, ConsejoSerializer, SocioSerializer

class ComunidadViewSet(viewsets.ModelViewSet):
	queryset = Comunidad.objects.all()
	serializer_class = ComunidadSerializer

class ConsejoViewSet(viewsets.ModelViewSet):
	queryset = Consejo.objects.all()
	serializer_class = ConsejoSerializer

class SocioViewSet(viewsets.ModelViewSet):
	queryset = Socio.objects.all()
	serializer_class = SocioSerializer

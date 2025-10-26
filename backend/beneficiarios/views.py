from rest_framework import viewsets
from .models import Beneficiario
from .serializers import BeneficiarioSerializer

class BeneficiarioViewSet(viewsets.ModelViewSet):
	queryset = Beneficiario.objects.all()
	serializer_class = BeneficiarioSerializer

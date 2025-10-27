from rest_framework import serializers
from .models import Rendicion
from documentos.serializers import DocumentoSerializer

class RendicionSerializer(serializers.ModelSerializer):
    documento = DocumentoSerializer(read_only=True)
    class Meta:
        model = Rendicion
        fields = '__all__'

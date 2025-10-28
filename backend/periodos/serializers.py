from rest_framework import serializers
from .models import Periodo

class PeriodoSerializer(serializers.ModelSerializer):
    comunidad_nombre = serializers.CharField(source='comunidad.nombre', read_only=True)
    class Meta:
        model = Periodo
        fields = ['id', 'nombre', 'fecha_inicio', 'fecha_fin', 'comunidad', 'comunidad_nombre', 'monto_asignado', 'monto_anterior', 'activo']

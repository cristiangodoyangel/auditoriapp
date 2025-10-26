from rest_framework import serializers
from .models import AuditorReporte

class AuditorReporteSerializer(serializers.ModelSerializer):
    class Meta:
        model = AuditorReporte
        fields = '__all__'

from rest_framework import serializers
from .models import Comunidad, Consejo, Socio

class ComunidadSerializer(serializers.ModelSerializer):
    class Meta:
        model = Comunidad
        fields = '__all__'

class ConsejoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Consejo
        fields = '__all__'

class SocioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Socio
        fields = '__all__'

from rest_framework import serializers
from .models import Proyecto, Asamblea

class ProyectoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Proyecto
        fields = '__all__'

class AsambleaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Asamblea
        fields = '__all__'
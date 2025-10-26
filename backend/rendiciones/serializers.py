from rest_framework import serializers
from .models import Rendicion

class RendicionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Rendicion
        fields = '__all__'

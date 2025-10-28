from rest_framework import serializers
from .models import Proyecto, Asamblea

class ProyectoSerializer(serializers.ModelSerializer):
    acta_url = serializers.SerializerMethodField()

    class Meta:
        model = Proyecto
        fields = '__all__'
        extra_fields = ['acta_url']

    def get_acta_url(self, obj):
        # Buscar asamblea asociada a este proyecto
        asamblea = Asamblea.objects.filter(proyectos_propuestos=obj).first()
        if asamblea and asamblea.acta:
            request = self.context.get('request')
            if request is not None:
                return request.build_absolute_uri(asamblea.acta.url)
            return asamblea.acta.url
        return None

class AsambleaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Asamblea
        fields = '__all__'
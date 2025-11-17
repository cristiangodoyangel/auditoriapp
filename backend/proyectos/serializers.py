
from rest_framework import serializers
from .models import Proyecto

class ProyectoSerializer(serializers.ModelSerializer):
   
    acta_url = serializers.SerializerMethodField()
    cotizaciones_url = serializers.SerializerMethodField()
    elegido_url = serializers.SerializerMethodField()

    class Meta:
        model = Proyecto
        fields = '__all__' 
        extra_kwargs = {
            'acta': {'required': False},
            'cotizaciones': {'required': False},
            'elegido': {'required': False},
        }


    def _get_file_url(self, obj, field_name):
        request = self.context.get('request')
        field = getattr(obj, field_name)
        if field and hasattr(field, 'url'):
            if request is not None:
                return request.build_absolute_uri(field.url)
            return field.url
        return None

    def get_acta_url(self, obj):
        return self._get_file_url(obj, 'acta')

    def get_cotizaciones_url(self, obj):
        return self._get_file_url(obj, 'cotizaciones')

    def get_elegido_url(self, obj):
        return self._get_file_url(obj, 'elegido')
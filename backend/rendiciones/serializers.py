# rendiciones/serializers.py
from rest_framework import serializers
from .models import Rendicion
from documentos.serializers import DocumentoSerializer
from documentos.models import Documento 

class RendicionSerializer(serializers.ModelSerializer):
    
    documentos_adjuntos = DocumentoSerializer(many=True, read_only=True)
    
    # --- 1. AÑADE ESTA LÍNEA ---
    # Esto le pide a Django el 'nombre' del 'proyecto' relacionado
    proyecto_nombre = serializers.CharField(source='proyecto.nombre', read_only=True)
    # ------------------------

    documentos_ids = serializers.PrimaryKeyRelatedField(
        many=True,
        write_only=True,
        queryset=Documento.objects.all(),
        source='documentos_adjuntos'
    )

    class Meta:
        model = Rendicion
        fields = [
            'id', 
            'proyecto', 
            'proyecto_nombre', # <-- 2. AÑADE ESTE CAMPO A LA LISTA
            'descripcion', 
            'monto_rendido', 
            'fecha_rendicion', 
            'documentos_adjuntos', 
            'documentos_ids'       
        ]
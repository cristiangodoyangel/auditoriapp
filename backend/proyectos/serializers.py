from rest_framework import serializers
from .models import Proyecto, Periodo, Socio
from comunidades.models import Comunidad

class PeriodoSerializer(serializers.ModelSerializer):
    comunidad_nombre = serializers.CharField(source='comunidad.nombre', read_only=True)
    monto_gastado = serializers.SerializerMethodField()
    monto_disponible = serializers.SerializerMethodField()
    
    class Meta:
        model = Periodo
        fields = ['id', 'comunidad', 'comunidad_nombre', 'año', 'monto_asignado', 
                 'saldo_anterior', 'monto_total', 'monto_gastado', 'monto_disponible', 
                 'activo', 'creado_en']
        read_only_fields = ['id', 'monto_total', 'monto_gastado', 'monto_disponible']
    
    def get_monto_gastado(self, obj):
        return sum(p.presupuesto_asignado for p in obj.proyecto_set.filter(estado__in=['Aprobado', 'En Ejecución', 'Finalizado']))
    
    def get_monto_disponible(self, obj):
        return obj.monto_total - self.get_monto_gastado(obj)

class ProyectoSerializer(serializers.ModelSerializer):
    comunidad_nombre = serializers.CharField(source='comunidad.nombre', read_only=True)
    periodo_año = serializers.CharField(source='periodo.año', read_only=True)
    aprobado_por_nombre = serializers.CharField(source='aprobado_por.nombre', read_only=True)
    
    class Meta:
        model = Proyecto
        fields = ['id', 'nombre', 'comunidad', 'comunidad_nombre', 'periodo', 'periodo_año',
                 'estado', 'presupuesto_asignado', 'fecha_inicio', 'fecha_fin', 'descripcion',
                 'aprobado_por', 'aprobado_por_nombre', 'fecha_aprobacion', 'comentarios_aprobacion',
                 'documento_asamblea', 'documento_cotizaciones', 'documento_elegido',
                 'creado_en', 'actualizado_en']
        read_only_fields = ['id', 'aprobado_por', 'fecha_aprobacion']

class SocioSerializer(serializers.ModelSerializer):
    comunidad_nombre = serializers.CharField(source='comunidad.nombre', read_only=True)
    
    class Meta:
        model = Socio
        fields = ['id', 'comunidad', 'comunidad_nombre', 'nombre_completo', 'rut', 
                 'direccion', 'telefono', 'fecha_socio', 'activo', 'creado_en']
        read_only_fields = ['id']
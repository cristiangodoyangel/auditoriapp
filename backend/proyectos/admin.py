from django.contrib import admin
from .models import Periodo, Proyecto

@admin.register(Periodo)
class PeriodoAdmin(admin.ModelAdmin):
    list_display = ('comunidad', 'año', 'monto_asignado', 'saldo_anterior', 'monto_total', 'activo', 'creado_en')
    search_fields = ('comunidad__nombre', 'año')

@admin.register(Proyecto)
class ProyectoAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'comunidad', 'periodo', 'estado', 'presupuesto_asignado', 'fecha_inicio', 'fecha_fin')
    search_fields = ('nombre', 'comunidad__nombre', 'estado')

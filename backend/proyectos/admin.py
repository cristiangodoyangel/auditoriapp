from django.contrib import admin
from .models import Proyecto, Asamblea

@admin.register(Proyecto)
class ProyectoAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'comunidad', 'estado', 'presupuesto_total', 'fecha_inicio', 'fecha_fin')
    search_fields = ('nombre', 'comunidad__nombre', 'estado')

@admin.register(Asamblea)
class AsambleaAdmin(admin.ModelAdmin):
    list_display = ('comunidad', 'fecha')
    search_fields = ('comunidad__nombre',)

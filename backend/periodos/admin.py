from django.contrib import admin
from .models import Periodo

@admin.register(Periodo)
class PeriodoAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'fecha_inicio', 'fecha_fin', 'comunidad', 'monto_asignado', 'monto_anterior')
    search_fields = ('nombre', 'comunidad__nombre')

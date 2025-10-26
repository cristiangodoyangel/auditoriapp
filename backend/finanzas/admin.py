from django.contrib import admin
from .models import Movimiento

@admin.register(Movimiento)
class MovimientoAdmin(admin.ModelAdmin):
    list_display = ('comunidad', 'periodo', 'monto', 'tipo', 'fecha', 'descripcion')
    search_fields = ('comunidad__nombre', 'tipo', 'descripcion')

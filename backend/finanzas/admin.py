from django.contrib import admin
from .models import TipoMovimiento, MovimientoBancario, Gasto

@admin.register(TipoMovimiento)
class TipoMovimientoAdmin(admin.ModelAdmin):
    list_display = ('tipo',)
    search_fields = ('tipo',)

@admin.register(MovimientoBancario)
class MovimientoBancarioAdmin(admin.ModelAdmin):
    list_display = ('comunidad', 'tipo', 'metodo', 'monto', 'fecha', 'referencia', 'conciliado', 'creado_por')
    search_fields = ('comunidad__nombre', 'referencia', 'tipo__tipo')

@admin.register(Gasto)
class GastoAdmin(admin.ModelAdmin):
    list_display = ('proyecto', 'fecha', 'descripcion', 'categoria', 'monto', 'estado')
    search_fields = ('proyecto__nombre', 'categoria', 'estado')

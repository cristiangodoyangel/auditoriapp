from django.contrib import admin
from .models import Rendicion

@admin.register(Rendicion)
class RendicionAdmin(admin.ModelAdmin):
    list_display = ('proyecto', 'documento', 'monto_rendido', 'descripcion', 'estado_aprobacion', 'fecha_rendicion')
    search_fields = ('proyecto__nombre', 'estado_aprobacion')

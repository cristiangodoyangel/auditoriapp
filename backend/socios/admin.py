from django.contrib import admin
from .models import Socio

@admin.register(Socio)
class SocioAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'apellido', 'rut', 'direccion', 'telefono', 'activo')
    search_fields = ('nombre', 'apellido', 'rut')
    list_filter = ('activo',)

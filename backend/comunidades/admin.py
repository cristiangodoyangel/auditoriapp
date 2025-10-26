from django.contrib import admin
from .models import Comunidad

@admin.register(Comunidad)
class ComunidadAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'ciudad', 'rut', 'activa', 'creada_en')
    search_fields = ('nombre', 'ciudad', 'rut')

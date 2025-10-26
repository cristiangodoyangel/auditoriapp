from django.contrib import admin
from .models import Documento

@admin.register(Documento)
class DocumentoAdmin(admin.ModelAdmin):
    list_display = ('entidad', 'tipo', 'archivo', 'subido_por', 'creado_en')
    search_fields = ('entidad', 'tipo', 'subido_por__username')

# Register your models here.

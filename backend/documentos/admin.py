from django.contrib import admin
from .models import Documento

@admin.register(Documento)
class DocumentoAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'tipo', 'archivo', 'descripcion', 'proyecto', 'asamblea')
    search_fields = ('nombre', 'tipo', 'descripcion')

# Register your models here.

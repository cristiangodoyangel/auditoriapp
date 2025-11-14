from django.contrib import admin
from .models import Beneficiario

@admin.register(Beneficiario)
class BeneficiarioAdmin(admin.ModelAdmin):
    list_display = ('comunidad', 'nombre', 'rut', 'tipo')
    search_fields = ('nombre', 'rut', 'tipo', 'comunidad__nombre')

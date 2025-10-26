from django.contrib import admin
from .models import Beneficiario

@admin.register(Beneficiario)
class BeneficiarioAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'rut', 'comunidad', 'monto_beca', 'fecha_pago', 'activo')
    search_fields = ('nombre', 'rut', 'comunidad__nombre')

from django.contrib import admin
from .models import AuditorReporte

@admin.register(AuditorReporte)
class AuditorReporteAdmin(admin.ModelAdmin):
    list_display = ('auditor', 'fecha', 'descripcion')
    search_fields = ('auditor__usuario__username', 'descripcion')

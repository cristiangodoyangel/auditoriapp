from django.contrib import admin
from .models import Periodo

@admin.register(Periodo)
class PeriodoAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'fecha_inicio', 'fecha_fin', 'comunidad', 'monto_asignado', 'monto_anterior', 'activo')
    search_fields = ('nombre', 'comunidad__nombre')

    def save_model(self, request, obj, form, change):
        user = request.user
        if hasattr(user, 'rol') and user.rol == 'admin' and hasattr(user, 'comunidad') and user.comunidad:
            obj.comunidad = user.comunidad
        super().save_model(request, obj, form, change)

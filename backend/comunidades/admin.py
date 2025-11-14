from django.contrib import admin
from .models import Comunidad, Consejo, Socio

@admin.register(Comunidad)
class ComunidadAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'activa', 'creada_en', 'usuario')
    search_fields = ('nombre', 'usuario__username')

@admin.register(Consejo)
class ConsejoAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'comunidad')
    search_fields = ('nombre', 'comunidad__nombre')

@admin.register(Socio)
class SocioAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'rol', 'comunidad', 'consejo')
    search_fields = ('nombre', 'rol', 'comunidad__nombre', 'consejo__nombre')

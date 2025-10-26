from django.contrib import admin
from .models import Auditor

@admin.register(Auditor)
class AuditorAdmin(admin.ModelAdmin):
    list_display = ('usuario', 'especialidad', 'activo')
    search_fields = ('usuario__username', 'especialidad')

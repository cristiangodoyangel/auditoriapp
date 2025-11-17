from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser

@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    model = CustomUser
    list_display = ('username', 'email', 'rol', 'telefono', 'es_auditor', 'is_active', 'is_staff', 'is_superuser', 'comunidad')
    search_fields = ('username', 'email', 'rol', 'telefono')
    fieldsets = UserAdmin.fieldsets + (
        (None, {'fields': ('comunidad', 'rol', 'telefono', 'es_auditor')}),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        (None, {'fields': ('comunidad', 'rol', 'telefono', 'es_auditor')}),
    )


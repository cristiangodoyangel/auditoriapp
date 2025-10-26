from django.contrib import admin
from .models import CustomUser

@admin.register(CustomUser)
class CustomUserAdmin(admin.ModelAdmin):
    list_display = ('username', 'email', 'rol', 'is_active', 'is_staff', 'is_superuser')
    search_fields = ('username', 'email', 'rol')

# Register your models here.

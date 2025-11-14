# documentos/admin.py
from django.contrib import admin
from .models import Documento

# Simplemente registra el modelo, sin 'list_display'
admin.site.register(Documento)
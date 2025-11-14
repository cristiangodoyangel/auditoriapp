# proyectos/admin.py
from django.contrib import admin
from .models import Proyecto

# Simplemente registra el modelo. Sin 'list_display' complicados.
admin.site.register(Proyecto)
# comunidades/models.py
from django.db import models
import uuid

class Comunidad(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    nombre = models.CharField(max_length=255)
    ciudad = models.CharField(max_length=255)
    rut = models.CharField(max_length=255)
    direccion = models.TextField()
    activa = models.BooleanField(default=True)
    creada_en = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.nombre

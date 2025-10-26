from django.db import models

from comunidades.models import Comunidad

class Periodo(models.Model):
    comunidad = models.ForeignKey(Comunidad, on_delete=models.CASCADE, related_name='periodos', null=True, blank=True)
    nombre = models.CharField(max_length=255)
    fecha_inicio = models.DateField()
    fecha_fin = models.DateField()
    monto_asignado = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    monto_anterior = models.DecimalField(max_digits=15, decimal_places=2, default=0)

    def __str__(self):
        return f"{self.nombre} ({self.comunidad.nombre})"

from django.db import models

from comunidades.models import Comunidad


from django.utils import timezone

class PeriodoManager(models.Manager):
    def periodo_actual(self, comunidad):
        hoy = timezone.now().date()
        return self.filter(comunidad=comunidad, activo=True, fecha_inicio__lte=hoy, fecha_fin__gte=hoy).first()

class Periodo(models.Model):
    comunidad = models.ForeignKey(Comunidad, on_delete=models.CASCADE, related_name='periodos', null=True, blank=True)
    nombre = models.CharField(max_length=255)
    fecha_inicio = models.DateField()
    fecha_fin = models.DateField()
    monto_asignado = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    monto_anterior = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    activo = models.BooleanField(default=True)

    objects = PeriodoManager()

    def __str__(self):
        if self.comunidad and self.comunidad.nombre:
            return f"{self.nombre} ({self.comunidad.nombre})"
        return f"{self.nombre}"

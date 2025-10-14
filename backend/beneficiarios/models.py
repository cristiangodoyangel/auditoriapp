from django.db import models

class Beneficiario(models.Model):
    nombre = models.CharField(max_length=255)
    rut = models.CharField(max_length=12)
    comunidad = models.ForeignKey('comunidades.Comunidad', on_delete=models.CASCADE)
    monto_beca = models.DecimalField(max_digits=10, decimal_places=2)
    fecha_pago = models.DateField()
    activo = models.BooleanField(default=True)

    def __str__(self):
        return self.nombre

from django.db import models

class Movimiento(models.Model):
    comunidad = models.ForeignKey('comunidades.Comunidad', on_delete=models.CASCADE)
    periodo = models.ForeignKey('periodos.Periodo', on_delete=models.CASCADE)
    monto = models.DecimalField(max_digits=12, decimal_places=2)
    tipo = models.CharField(max_length=50)
    fecha = models.DateField()
    descripcion = models.TextField()

    def __str__(self):
        return f"{self.comunidad} - {self.monto} - {self.tipo}"

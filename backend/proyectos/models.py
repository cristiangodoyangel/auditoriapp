from django.db import models

class Proyecto(models.Model):
    ESTADOS_CHOICES = [
        ('Pendiente', 'Pendiente'),
        ('En Ejecución', 'En Ejecución'),
        ('Finalizado', 'Finalizado'),
    ]

    nombre = models.CharField(max_length=255)
    comunidad = models.ForeignKey('comunidades.Comunidad', on_delete=models.CASCADE)
    estado = models.CharField(max_length=50, choices=ESTADOS_CHOICES)
    presupuesto_asignado = models.DecimalField(max_digits=12, decimal_places=2)
    fecha_inicio = models.DateField()
    fecha_fin = models.DateField()
    descripcion = models.TextField()

    def __str__(self):
        return self.nombre

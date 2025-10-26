from django.db import models

class Rendicion(models.Model):
    proyecto = models.ForeignKey('proyectos.Proyecto', on_delete=models.CASCADE)
    documento = models.ForeignKey('documentos.Documento', on_delete=models.SET_NULL, null=True, blank=True)
    monto_rendido = models.DecimalField(max_digits=12, decimal_places=2)
    descripcion = models.TextField()
    estado_aprobacion = models.CharField(max_length=50, choices=[
        ('Pendiente', 'Pendiente'),
        ('Aprobado', 'Aprobado'),
        ('Rechazado', 'Rechazado'),
    ], default='Pendiente')
    fecha_rendicion = models.DateField()

    def __str__(self):
        return f"Rendición de {self.proyecto} - {self.monto_rendido}"

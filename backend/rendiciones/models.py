# rendiciones/models.py
from django.db import models

class Rendicion(models.Model):
    proyecto = models.ForeignKey('proyectos.Proyecto', on_delete=models.CASCADE)
    descripcion = models.TextField(blank=True, null=True) # Lo hacemos opcional
    monto_rendido = models.DecimalField(max_digits=12, decimal_places=2)
    fecha_rendicion = models.DateField()
    documentos_adjuntos = models.ManyToManyField('documentos.Documento', related_name='rendiciones_adjuntas', blank=True)

    def __str__(self):
        return f"Rendición de {self.proyecto} - {self.monto_rendido}"
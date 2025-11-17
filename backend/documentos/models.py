from django.db import models


class Documento(models.Model):
    fecha_subida = models.DateTimeField(auto_now_add=True)
    proyecto = models.ForeignKey('proyectos.Proyecto', on_delete=models.SET_NULL, null=True, blank=True)
    nombre = models.CharField(max_length=255)
    tipo = models.CharField(max_length=50)
    archivo = models.FileField(upload_to='documentos/')
    descripcion = models.TextField(blank=True)

    def __str__(self):
        return f"Documento {self.nombre} - {self.tipo}"

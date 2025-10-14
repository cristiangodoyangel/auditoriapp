from django.db import models

class Reporte(models.Model):
    TIPO_CHOICES = [
        ('Ejecución', 'Ejecución'),
        ('Rendición', 'Rendición'),
        ('Estado de Cuenta', 'Estado de Cuenta'),
    ]

    proyecto = models.ForeignKey('proyectos.Proyecto', on_delete=models.CASCADE)
    tipo = models.CharField(max_length=50, choices=TIPO_CHOICES)
    fecha = models.DateField()
    pdf_url = models.URLField()

    def __str__(self):
        return f"Reporte {self.tipo} - {self.proyecto.nombre}"

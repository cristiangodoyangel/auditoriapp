from django.db import models

class AuditorReporte(models.Model):
    auditor = models.ForeignKey('auditores.Auditor', on_delete=models.CASCADE)
    fecha = models.DateField()
    descripcion = models.TextField()

    def __str__(self):
        return f"Reporte Auditor {self.auditor} - {self.fecha}"

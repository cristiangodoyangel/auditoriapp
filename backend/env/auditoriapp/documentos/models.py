# documentos/models.py
from django.db import models

class Documento(models.Model):
    ENTIDAD_CHOICES = [
        ('Proyecto', 'Proyecto'),
        ('Gasto', 'Gasto'),
        ('Beneficiario', 'Beneficiario'),
    ]

    entidad = models.CharField(max_length=50, choices=ENTIDAD_CHOICES)
    entidad_id = models.IntegerField()
    tipo = models.CharField(max_length=50)  # Ejemplo: Factura, Certificado, Transferencia
    archivo = models.FileField(upload_to='documentos/')
    subido_por = models.ForeignKey('usuarios.CustomUser', on_delete=models.CASCADE)  # Cambiar a CustomUser
    creado_en = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Documento {self.tipo} - {self.entidad}"

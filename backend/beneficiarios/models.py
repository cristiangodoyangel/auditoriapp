from django.db import models


class Beneficiario(models.Model):
    comunidad = models.ForeignKey('comunidades.Comunidad', on_delete=models.CASCADE)
    nombre = models.CharField(max_length=255)
    rut = models.CharField(max_length=12)
    tipo = models.CharField(max_length=50, default='general')

    def __str__(self):
        return self.nombre

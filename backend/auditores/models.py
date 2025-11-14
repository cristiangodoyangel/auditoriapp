from django.db import models

class Auditor(models.Model):
    usuario = models.OneToOneField('usuarios.CustomUser', on_delete=models.CASCADE)
    comunidades = models.ManyToManyField('comunidades.Comunidad')
    especialidad = models.CharField(max_length=100)
    activo = models.BooleanField(default=True)

    def __str__(self):
        return f"Auditor: {self.usuario.username}"

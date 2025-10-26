from django.db import models

class Consejo(models.Model):
    comunidad = models.ForeignKey('comunidades.Comunidad', on_delete=models.CASCADE)
    nombre = models.CharField(max_length=255)

    def __str__(self):
        return f"Consejo {self.nombre} - {self.comunidad.nombre}"

class Socio(models.Model):
    comunidad = models.ForeignKey('comunidades.Comunidad', on_delete=models.CASCADE)
    consejo = models.ForeignKey('comunidades.Consejo', on_delete=models.SET_NULL, null=True, blank=True)
    nombre = models.CharField(max_length=255)
    rol = models.CharField(max_length=50)

    def __str__(self):
        return f"Socio {self.nombre} - {self.comunidad.nombre}"
# comunidades/models.py

class Comunidad(models.Model):
    nombre = models.CharField(max_length=255)
    activa = models.BooleanField(default=True)
    creada_en = models.DateTimeField(auto_now_add=True)
    usuario = models.ForeignKey('usuarios.CustomUser', on_delete=models.CASCADE, null=True, blank=True, related_name='comunidades')
    monto_asignado = models.DecimalField(max_digits=15, decimal_places=2, default=0)

    def __str__(self):
        return self.nombre

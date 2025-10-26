from django.db import models
from django.contrib.auth.models import AbstractUser

class CustomUser(AbstractUser):
    nombre = models.CharField(max_length=100, blank=True)
    comunidad = models.ForeignKey('comunidades.Comunidad', on_delete=models.CASCADE, null=True, blank=True)
    rol = models.CharField(max_length=20, choices=[
        ('admin', 'Admin'),
        ('auditor', 'Auditor'),
        ('usuario', 'Usuario')
    ], default='usuario')
    telefono = models.CharField(max_length=20, blank=True)
    es_auditor = models.BooleanField(default=False)

    def __str__(self):
        return self.username

    def has_module_perms(self, app_label):
        return self.is_superuser

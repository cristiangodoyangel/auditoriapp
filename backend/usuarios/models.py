from django.db import models
import uuid
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager

# Manager para el usuario personalizado
class CustomUserManager(BaseUserManager):
    def create_user(self, username, email, nombre, password=None, **extra_fields):
        """
        Crea y guarda un usuario con el username, email y la contraseña dados.
        """
        if not email:
            raise ValueError('El email debe ser establecido')
        email = self.normalize_email(email)  # Normaliza el email
        if not username:
            raise ValueError('El username debe ser establecido')

        # Crear el usuario con el campo 'nombre'
        user = self.model(username=username, email=email, nombre=nombre, **extra_fields)
        user.set_password(password)  # Establecer la contraseña encriptada
        user.save(using=self._db)    # Guardar el usuario en la base de datos
        return user

    def create_superuser(self, username, email, nombre, password=None, **extra_fields):
        """
        Crea y guarda un superusuario con el username, email y la contraseña dados.
        """
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(username, email, nombre, password, **extra_fields)


# Modelo de usuario personalizado
class CustomUser(AbstractBaseUser):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    username = models.CharField(max_length=150, unique=True)  # Campo 'username'
    nombre = models.CharField(max_length=255)  # Campo 'nombre'
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=255)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    is_superuser = models.BooleanField(default=False)
    rol = models.CharField(max_length=50, choices=[
        ('Admin Consejo', 'Admin Consejo'),
        ('Admin Comunidad', 'Admin Comunidad'),
        ('Auditor', 'Auditor'),
        ('Visor', 'Visor')
    ])
    comunidad = models.ForeignKey('comunidades.Comunidad', on_delete=models.CASCADE, null=True, blank=True)
    creado_en = models.DateTimeField(auto_now_add=True)

    objects = CustomUserManager()  # Manager personalizado para el modelo

    USERNAME_FIELD = 'username'  # El 'username' será el campo de autenticación
    REQUIRED_FIELDS = ['email', 'nombre']  # 'email' y 'nombre' son los campos requeridos para crear un superusuario

    def __str__(self):
        return self.username

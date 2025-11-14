import os
import django
import sys

# Configurar Django
sys.path.append('/backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'auditoriapp.settings')
django.setup()

from usuarios.models import CustomUser

# Crear el usuario admin con las credenciales prometidas
print("Creando usuario admin...")
user, created = CustomUser.objects.get_or_create(
    username="admin",
    defaults={
        "email": "admin@admin.cl",
        "nombre": "Administrador Principal",
        "rol": "Admin Consejo",
        "comunidad": None
    }
)

if created or True:  # Siempre actualizar la contraseña
    user.set_password("admin123")
    user.save()
    print(f"✓ Usuario 'admin' {'creado' if created else 'actualizado'} con contraseña 'admin123'")
else:
    print(f"✓ Usuario 'admin' ya existe")

print("\nCredenciales disponibles:")
print("Usuario: admin")
print("Contraseña: admin123")
print("Rol: Admin Consejo")
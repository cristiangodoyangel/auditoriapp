import os
import django
import sys


sys.path.append('/backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'auditoriapp.settings')
django.setup()

from comunidades.models import Comunidad
from usuarios.models import CustomUser
from proyectos.models import Periodo, Proyecto, Socio
from datetime import date


print("Creando comunidades...")
comunidades = [
    {"nombre": "Comunidad Lickanantay Norte", "ciudad": "Calama", "rut": "12345678-9", "direccion": "Calle Principal 123"},
    {"nombre": "Comunidad Lickanantay Sur", "ciudad": "San Pedro", "rut": "98765432-1", "direccion": "Avenida Central 456"},
    {"nombre": "Consejo de Pueblos Atacameños", "ciudad": "Antofagasta", "rut": "11111111-1", "direccion": "Plaza Mayor 789"}
]

comunidades_obj = []
for com_data in comunidades:
    comunidad, created = Comunidad.objects.get_or_create(
        nombre=com_data["nombre"],
        defaults=com_data
    )
    comunidades_obj.append(comunidad)
    print(f"✓ {'Creada' if created else 'Existe'}: {comunidad.nombre}")


print("\nCreando usuarios...")
usuarios = [
    {
        "username": "admin_consejo",
        "email": "admin@consejo.cl",
        "nombre": "Administrador Consejo",
        "password": "123456",
        "rol": "Admin Consejo",
        "comunidad": None
    },
    {
        "username": "auditor1",
        "email": "auditor@auditora.cl",
        "nombre": "Juan Auditor",
        "password": "123456",
        "rol": "Auditor",
        "comunidad": None
    },
    {
        "username": "admin_norte",
        "email": "admin@norte.cl",
        "nombre": "María Administradora Norte",
        "password": "123456",
        "rol": "Admin Comunidad",
        "comunidad": comunidades_obj[0]
    },
    {
        "username": "admin_sur",
        "email": "admin@sur.cl",
        "nombre": "Pedro Administrador Sur",
        "password": "123456",
        "rol": "Admin Comunidad",
        "comunidad": comunidades_obj[1]
    }
]

for user_data in usuarios:
    user, created = CustomUser.objects.get_or_create(
        username=user_data["username"],
        defaults=user_data
    )
    if created:
        user.set_password(user_data["password"])
        user.save()
    print(f"✓ {'Creado' if created else 'Existe'}: {user.username} - {user.rol}")


print("\nCreando periodos...")
for comunidad in comunidades_obj[:2]: 
    periodo, created = Periodo.objects.get_or_create(
        comunidad=comunidad,
        año=2025,
        defaults={
            "monto_asignado": 50000000, 
            "saldo_anterior": 5000000    
        }
    )
    print(f"✓ {'Creado' if created else 'Existe'}: Periodo {periodo.año} - {comunidad.nombre}")


print("\nCreando socios...")
socios_data = [
    {"nombre_completo": "Ana García López", "rut": "12345678-9", "telefono": "+56912345678"},
    {"nombre_completo": "Carlos Mendoza Silva", "rut": "98765432-1", "telefono": "+56987654321"},
    {"nombre_completo": "Elena Rodríguez Torres", "rut": "11223344-5", "telefono": "+56911223344"}
]

for i, socio_data in enumerate(socios_data):
    comunidad = comunidades_obj[i % 2] 
    socio, created = Socio.objects.get_or_create(
        rut=socio_data["rut"],
        defaults={
            **socio_data,
            "comunidad": comunidad,
            "direccion": f"Dirección {i+1}",
            "fecha_socio": date(2024, 1, 15)
        }
    )
    print(f"✓ {'Creado' if created else 'Existe'}: {socio.nombre_completo} - {comunidad.nombre}")


print("\nCreando proyectos...")
periodos = Periodo.objects.all()
for i, periodo in enumerate(periodos):
    proyecto, created = Proyecto.objects.get_or_create(
        nombre=f"Proyecto de Infraestructura {i+1}",
        defaults={
            "comunidad": periodo.comunidad,
            "periodo": periodo,
            "estado": "Borrador",
            "presupuesto_asignado": 10000000,  
            "fecha_inicio": date(2025, 2, 1),
            "fecha_fin": date(2025, 12, 31),
            "descripcion": f"Proyecto de mejoramiento de infraestructura para la {periodo.comunidad.nombre}"
        }
    )
    print(f"✓ {'Creado' if created else 'Existe'}: {proyecto.nombre}")

print("\n🎉 ¡Datos de prueba creados exitosamente!")
print("\nCredenciales de acceso:")
print("- admin_consejo / 123456 (Admin Consejo)")
print("- auditor1 / 123456 (Auditor)")
print("- admin_norte / 123456 (Admin Comunidad Norte)")
print("- admin_sur / 123456 (Admin Comunidad Sur)")
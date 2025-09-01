from django.db import models

# Modelo para el tipo de movimiento bancario (Ingreso/Egreso)
class TipoMovimiento(models.Model):
    INGRESO = 'Ingreso'
    EGRESO = 'Egreso'
    TIPO_CHOICES = [
        (INGRESO, 'Ingreso'),
        (EGRESO, 'Egreso'),
    ]
    tipo = models.CharField(max_length=20, choices=TIPO_CHOICES)

    def __str__(self):
        return self.tipo

class MovimientoBancario(models.Model):
    comunidad = models.ForeignKey('comunidades.Comunidad', on_delete=models.CASCADE)
    
    # Aquí se usa ForeignKey correctamente para asignar una instancia de TipoMovimiento
    tipo = models.ForeignKey('finanzas.TipoMovimiento', on_delete=models.CASCADE)
    
    metodo = models.CharField(max_length=50)  # Ej: Transferencia, Cheque, Efectivo
    monto = models.DecimalField(max_digits=10, decimal_places=2)
    fecha = models.DateField()
    referencia = models.CharField(max_length=255)
    conciliado = models.BooleanField(default=False)
    
    # Cambio a CustomUser para gestionar la creación de movimiento bancario
    creado_por = models.ForeignKey('usuarios.CustomUser', on_delete=models.SET_NULL, null=True)

    def __str__(self):
        return f"{self.tipo} - {self.referencia}"

# Modelo para Gasto relacionado con un proyecto
class Gasto(models.Model):
    PENDIENTE = 'Pendiente'
    APROBADO = 'Aprobado'
    RECHAZADO = 'Rechazado'
    ESTADO_CHOICES = [
        (PENDIENTE, 'Pendiente'),
        (APROBADO, 'Aprobado'),
        (RECHAZADO, 'Rechazado'),
    ]

    proyecto = models.ForeignKey('proyectos.Proyecto', on_delete=models.CASCADE)
    fecha = models.DateField()
    descripcion = models.TextField()
    categoria = models.CharField(max_length=100)  # Categoría del gasto
    monto = models.DecimalField(max_digits=10, decimal_places=2)
    estado = models.CharField(max_length=50, choices=ESTADO_CHOICES, default=PENDIENTE)

    def __str__(self):
        return f"{self.descripcion} - {self.monto}"

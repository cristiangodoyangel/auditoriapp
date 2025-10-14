from django.db import models
import uuid

class Periodo(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    comunidad = models.ForeignKey('comunidades.Comunidad', on_delete=models.CASCADE)
    año = models.IntegerField()
    monto_asignado = models.DecimalField(max_digits=12, decimal_places=2)
    saldo_anterior = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    monto_total = models.DecimalField(max_digits=12, decimal_places=2)  # monto_asignado + saldo_anterior
    activo = models.BooleanField(default=True)
    creado_en = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['comunidad', 'año']
    
    def save(self, *args, **kwargs):
        self.monto_total = self.monto_asignado + self.saldo_anterior
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"{self.comunidad.nombre} - {self.año}"

class Proyecto(models.Model):
    ESTADOS_CHOICES = [
        ('Borrador', 'Borrador'),
        ('Enviado a Revision', 'Enviado a Revisión'),
        ('Aprobado', 'Aprobado'),
        ('Rechazado', 'Rechazado'),
        ('En Ejecución', 'En Ejecución'),
        ('Finalizado', 'Finalizado'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    nombre = models.CharField(max_length=255)
    comunidad = models.ForeignKey('comunidades.Comunidad', on_delete=models.CASCADE)
    periodo = models.ForeignKey(Periodo, on_delete=models.CASCADE, null=True, blank=True)
    estado = models.CharField(max_length=50, choices=ESTADOS_CHOICES, default='Borrador')
    presupuesto_asignado = models.DecimalField(max_digits=12, decimal_places=2)
    fecha_inicio = models.DateField()
    fecha_fin = models.DateField()
    descripcion = models.TextField()
    
    # Campos para aprobación
    aprobado_por = models.ForeignKey('usuarios.CustomUser', on_delete=models.SET_NULL, null=True, blank=True, related_name='proyectos_aprobados')
    fecha_aprobacion = models.DateTimeField(null=True, blank=True)
    comentarios_aprobacion = models.TextField(blank=True)
    
    # Campos para documentos
    documento_asamblea = models.FileField(upload_to='proyectos/asambleas/', null=True, blank=True)
    documento_cotizaciones = models.FileField(upload_to='proyectos/cotizaciones/', null=True, blank=True)
    documento_elegido = models.FileField(upload_to='proyectos/elegidos/', null=True, blank=True)
    
    creado_en = models.DateTimeField(auto_now_add=True)
    actualizado_en = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.nombre

class Socio(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    comunidad = models.ForeignKey('comunidades.Comunidad', on_delete=models.CASCADE)
    nombre_completo = models.CharField(max_length=255)
    rut = models.CharField(max_length=20, unique=True)
    direccion = models.TextField()
    telefono = models.CharField(max_length=20)
    fecha_socio = models.DateField()
    activo = models.BooleanField(default=True)
    creado_en = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.nombre_completo} - {self.comunidad.nombre}"

from django.db import models


class Rendicion(models.Model):
    # id es el pk automático por defecto
    proyecto = models.ForeignKey('proyectos.Proyecto', on_delete=models.CASCADE)
    fecha = models.DateField()
    numero_documento = models.CharField(max_length=100)
    TIPO_DOCUMENTO_CHOICES = [
        ('Factura', 'Factura'),
        ('Boleta', 'Boleta'),
        ('Otro', 'Otro'),
    ]
    tipo_documento = models.CharField(max_length=50, choices=TIPO_DOCUMENTO_CHOICES)
    descripcion = models.TextField()
    monto_rendido = models.DecimalField(max_digits=12, decimal_places=2)
    numero_comprobante_pago = models.CharField(max_length=100)
    TIPO_PAGO_CHOICES = [
        ('Transferencia', 'Transferencia'),
        ('Efectivo', 'Efectivo'),
        ('Cheque', 'Cheque'),
        ('Otro', 'Otro'),
    ]
    tipo_pago = models.CharField(max_length=50, choices=TIPO_PAGO_CHOICES)
    monto_pagado = models.DecimalField(max_digits=12, decimal_places=2)
    fecha_pago = models.DateField()
    rut_proveedor = models.CharField(max_length=20)
    rut_beneficiario = models.CharField(max_length=20)
    documentos_adjuntos = models.ManyToManyField('documentos.Documento', related_name='rendiciones_adjuntas', blank=True)
    estado_aprobacion = models.CharField(max_length=50, choices=[
        ('Pendiente', 'Pendiente'),
        ('Aprobado', 'Aprobado'),
        ('Rechazado', 'Rechazado'),
    ], default='Pendiente')
    fecha_rendicion = models.DateField()

    def __str__(self):
        return f"Rendición de {self.proyecto} - {self.monto_rendido}"

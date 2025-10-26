from django.db import models

class Proyecto(models.Model):
    comunidad = models.ForeignKey('comunidades.Comunidad', on_delete=models.CASCADE)
    periodo = models.ForeignKey('periodos.Periodo', on_delete=models.CASCADE)
    nombre = models.CharField(max_length=255)
    descripcion = models.TextField()
    fecha_inicio = models.DateField()
    fecha_fin = models.DateField()
    presupuesto_total = models.DecimalField(max_digits=12, decimal_places=2)
    estado = models.CharField(max_length=50)
    total_rendido = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    estado_rendicion = models.CharField(max_length=50)

    def __str__(self):
        return self.nombre

class Asamblea(models.Model):
    comunidad = models.ForeignKey('comunidades.Comunidad', on_delete=models.CASCADE)
    proyectos_propuestos = models.ManyToManyField(Proyecto)
    fecha = models.DateField()
    acta = models.FileField(upload_to='asambleas/')

    def __str__(self):
        return f"Asamblea {self.comunidad.nombre} - {self.fecha}"

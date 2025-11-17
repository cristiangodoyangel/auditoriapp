from django.db import models

class Proyecto(models.Model):
    comunidad = models.ForeignKey('comunidades.Comunidad', on_delete=models.CASCADE)
    periodo = models.ForeignKey('periodos.Periodo', on_delete=models.CASCADE)
    nombre = models.CharField(max_length=255)
    descripcion = models.TextField(default='') 
    fecha_inicio = models.DateField(null=True, blank=True) 
    fecha_fin = models.DateField(null=True, blank=True)
    presupuesto_total = models.DecimalField(max_digits=12, decimal_places=2, default=0) 
    

    estado = models.CharField(max_length=50, default='Pendiente')
  
    
    total_rendido = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    
 
    estado_rendicion = models.CharField(max_length=50, default='Pendiente')
    
    
    acta = models.FileField(upload_to='proyectos/actas/', null=True, blank=True)
    cotizaciones = models.FileField(upload_to='proyectos/cotizaciones/', null=True, blank=True)
    elegido = models.FileField(upload_to='proyectos/elegido/', null=True, blank=True)

    def __str__(self):
        return self.nombre
    

from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.db.models import Sum
from .models import Rendicion

@receiver([post_save, post_delete], sender=Rendicion)
def actualizar_total_rendido_proyecto(sender, instance, **kwargs):
    """
    Actualiza el campo 'total_rendido' del Proyecto asociado
    cada vez que una Rendicion se guarda o se borra.
    """
    proyecto = instance.proyecto
    
   
    total = Rendicion.objects.filter(proyecto=proyecto).aggregate(
        total_sum=Sum('monto_rendido')
    )['total_sum']
    
    
    proyecto.total_rendido = total or 0
    proyecto.save(update_fields=['total_rendido'])
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.utils import timezone
# --- CORRECCIÓN ---
# Se eliminó 'Asamblea' de esta línea
from .models import Proyecto
# Se eliminó 'AsambleaSerializer' de esta línea
from .serializers import ProyectoSerializer
# --------------------

class ProyectoViewSet(viewsets.ModelViewSet):
    serializer_class = ProyectoSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        # Permitir que cualquier usuario autenticado vea todos los proyectos
        user = self.request.user
        if hasattr(user, 'comunidad') and user.comunidad:
            return Proyecto.objects.filter(comunidad=user.comunidad)
        return Proyecto.objects.none()
    
    def perform_create(self, serializer):
        # Asignar la comunidad automáticamente si el usuario es Admin Comunidad
        # El frontend envía 'comunidad' también, pero esto lo refuerza en el backend.
        if self.request.user.rol == 'Admin Comunidad':
            serializer.save(comunidad=self.request.user.comunidad)
        else:
            # En un caso real, aquí deberíamos validar
            # que el usuario tenga permiso o que el 'comunidad' ID enviado sea válido.
            # Por ahora, confiamos en el serializer.save()
            serializer.save()
    
    @action(detail=True, methods=['post'])
    def enviar_revision(self, request, pk=None):
        proyecto = self.get_object()
        if proyecto.estado == 'Borrador':
            proyecto.estado = 'Enviado a Revision'
            proyecto.save()
            return Response({'message': 'Proyecto enviado a revisión'})
        return Response({'error': 'El proyecto no está en estado borrador'}, 
                       status=status.HTTP_400_BAD_REQUEST)
    

    # Acción de validación
    @action(detail=True, methods=['post'])
    def validar(self, request, pk=None): # Renombrado de 'aprobar' a 'validar'
        
        # --- CORRECCIÓN DE PERMISOS ---
        # Solo el rol 'Auditor' puede ejecutar esta acción
        if request.user.rol != 'Auditor':
            return Response({'error': 'No tienes permisos para validar proyectos'}, 
                           status=status.HTTP_403_FORBIDDEN)
        # ---------------------------------

        proyecto = self.get_object()
        
        # El estado 'Borrador' (o 'Pendiente' si ya lo cambiaste en el modelo) es el que se valida
        if proyecto.estado == 'Pendiente' or proyecto.estado == 'Borrador': 
            proyecto.estado = 'Validado' # Cambia 'Aprobado' por 'Validado'
            proyecto.save()
            return Response({'message': 'Proyecto validado'})
        
        return Response({'error': 'El proyecto no está pendiente de validación'}, 
                       status=status.HTTP_400_BAD_REQUEST)
    
    # Esta acción 'rechazar' también debe ser solo para 'Auditor'
    @action(detail=True, methods=['post'])
    def rechazar(self, request, pk=None):
        
        # --- CORRECCIÓN DE PERMISOS ---
        if request.user.rol != 'Auditor':
            return Response({'error': 'No tienes permisos para rechazar proyectos'}, 
                           status=status.HTTP_403_FORBIDDEN)
        # ---------------------------------
        
        proyecto = self.get_object()
        if proyecto.estado == 'Pendiente' or proyecto.estado == 'Borrador' or proyecto.estado == 'Enviado a Revision':
            proyecto.estado = 'Rechazado'
            # (Si quieres añadir comentarios de rechazo, asegúrate de añadir
            # un campo 'comentarios_rechazo' al modelo Proyecto)
            # proyecto.comentarios_rechazo = request.data.get('comentarios', '')
            proyecto.save()
            return Response({'message': 'Proyecto rechazado'})
        
        return Response({'error': 'El proyecto no está pendiente de validación'}, 
                       status=status.HTTP_400_BAD_REQUEST)
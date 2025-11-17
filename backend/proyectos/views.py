from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.utils import timezone
from .models import Proyecto
from .serializers import ProyectoSerializer
# --------------------

class ProyectoViewSet(viewsets.ModelViewSet):
    serializer_class = ProyectoSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if hasattr(user, 'comunidad') and user.comunidad:
            return Proyecto.objects.filter(comunidad=user.comunidad)
        return Proyecto.objects.none()
    
    def perform_create(self, serializer):
        
        if self.request.user.rol == 'Admin Comunidad':
            serializer.save(comunidad=self.request.user.comunidad)
        else:
     
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
    

    
    @action(detail=True, methods=['post'])
    def validar(self, request, pk=None): 
        
        
        if request.user.rol != 'Auditor':
            return Response({'error': 'No tienes permisos para validar proyectos'}, 
                           status=status.HTTP_403_FORBIDDEN)
       

        proyecto = self.get_object()
        
       
        if proyecto.estado == 'Pendiente' or proyecto.estado == 'Borrador': 
            proyecto.estado = 'Validado' 
            proyecto.save()
            return Response({'message': 'Proyecto validado'})
        
        return Response({'error': 'El proyecto no está pendiente de validación'}, 
                       status=status.HTTP_400_BAD_REQUEST)
    
   
    @action(detail=True, methods=['post'])
    def rechazar(self, request, pk=None):
        
       
        if request.user.rol != 'Auditor':
            return Response({'error': 'No tienes permisos para rechazar proyectos'}, 
                           status=status.HTTP_403_FORBIDDEN)
       
        
        proyecto = self.get_object()
        if proyecto.estado == 'Pendiente' or proyecto.estado == 'Borrador' or proyecto.estado == 'Enviado a Revision':
            proyecto.estado = 'Rechazado'

            proyecto.save()
            return Response({'message': 'Proyecto rechazado'})
        
        return Response({'error': 'El proyecto no está pendiente de validación'}, 
                       status=status.HTTP_400_BAD_REQUEST)
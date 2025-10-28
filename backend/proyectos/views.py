from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.utils import timezone
from .models import Proyecto, Asamblea
from .serializers import ProyectoSerializer, AsambleaSerializer

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
    def aprobar(self, request, pk=None):
        if request.user.rol not in ['Admin Consejo', 'Auditor']:
            return Response({'error': 'No tienes permisos para aprobar proyectos'}, 
                           status=status.HTTP_403_FORBIDDEN)
        
        proyecto = self.get_object()
        if proyecto.estado == 'Enviado a Revision':
            proyecto.estado = 'Aprobado'
            proyecto.aprobado_por = request.user
            proyecto.fecha_aprobacion = timezone.now()
            proyecto.comentarios_aprobacion = request.data.get('comentarios', '')
            proyecto.save()
            return Response({'message': 'Proyecto aprobado'})
        return Response({'error': 'El proyecto no está en revisión'}, 
                       status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def rechazar(self, request, pk=None):
        if request.user.rol not in ['Admin Consejo', 'Auditor']:
            return Response({'error': 'No tienes permisos para rechazar proyectos'}, 
                           status=status.HTTP_403_FORBIDDEN)
        
        proyecto = self.get_object()
        if proyecto.estado == 'Enviado a Revision':
            proyecto.estado = 'Rechazado'
            proyecto.comentarios_aprobacion = request.data.get('comentarios', '')
            proyecto.save()
            return Response({'message': 'Proyecto rechazado'})
        return Response({'error': 'El proyecto no está en revisión'}, 
                       status=status.HTTP_400_BAD_REQUEST)

class AsambleaViewSet(viewsets.ModelViewSet):
    serializer_class = AsambleaSerializer
    permission_classes = [IsAuthenticated]
    queryset = Asamblea.objects.all()

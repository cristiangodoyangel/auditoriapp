from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.utils import timezone
from .models import Proyecto, Periodo, Socio
from .serializers import ProyectoSerializer, PeriodoSerializer, SocioSerializer

class PeriodoViewSet(viewsets.ModelViewSet):
    serializer_class = PeriodoSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        if self.request.user.rol == 'Admin Comunidad':
            return Periodo.objects.filter(comunidad=self.request.user.comunidad)
        elif self.request.user.rol in ['Admin Consejo', 'Auditor']:
            return Periodo.objects.all()
        return Periodo.objects.none()

class ProyectoViewSet(viewsets.ModelViewSet):
    serializer_class = ProyectoSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        if self.request.user.rol == 'Admin Comunidad':
            return Proyecto.objects.filter(comunidad=self.request.user.comunidad)
        elif self.request.user.rol in ['Admin Consejo', 'Auditor']:
            return Proyecto.objects.all()
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

class SocioViewSet(viewsets.ModelViewSet):
    serializer_class = SocioSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        if self.request.user.rol == 'Admin Comunidad':
            return Socio.objects.filter(comunidad=self.request.user.comunidad)
        elif self.request.user.rol in ['Admin Consejo', 'Auditor']:
            return Socio.objects.all()
        return Socio.objects.none()
    
    def perform_create(self, serializer):
        if self.request.user.rol == 'Admin Comunidad':
            serializer.save(comunidad=self.request.user.comunidad)
        else:
            serializer.save()

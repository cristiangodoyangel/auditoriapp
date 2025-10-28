from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from django.contrib.auth import authenticate
from .serializers import CustomTokenObtainPairSerializer, UserSerializer, CreateUserSerializer
from .models import CustomUser
from periodos.models import Periodo
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def inicio_admin_comunidad(request):
    user = request.user
    # Validar si es admin de la comunidad
    if user.rol != 'admin' or not user.comunidad:
        return Response({'error': 'No tienes permisos de administrador de comunidad.'}, status=status.HTTP_403_FORBIDDEN)

    periodo = Periodo.objects.periodo_actual(user.comunidad)
    if periodo:
        # Hay periodo activo, redireccionar a dashboard
        return Response({'redirect': 'dashboard', 'periodo_id': periodo.id})
    else:
        # No hay periodo activo, redireccionar a crear periodo
        return Response({'redirect': 'crear_periodo'})

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    username = request.data.get('username')
    password = request.data.get('password')
    
    if not username or not password:
        return Response({'error': 'Username y password son requeridos'}, 
                       status=status.HTTP_400_BAD_REQUEST)
    
    user = authenticate(username=username, password=password)
    if user:
        serializer = CustomTokenObtainPairSerializer()
        tokens = serializer.get_token(user)
        
        return Response({
            'access': str(tokens.access_token),
            'refresh': str(tokens),
            'user': {
                'id': str(user.id),
                'username': user.username,
                'nombre': user.nombre,
                'email': user.email,
                'rol': user.rol,
                'comunidad': {
                    'id': str(user.comunidad.id) if user.comunidad else None,
                    'nombre': user.comunidad.nombre if user.comunidad else None
                } if user.comunidad else None
            }
        })
    else:
        return Response({'error': 'Credenciales inválidas'}, 
                       status=status.HTTP_401_UNAUTHORIZED)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def profile_view(request):
    serializer = UserSerializer(request.user)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_user_view(request):
    # Solo admins pueden crear usuarios
    if request.user.rol not in ['Admin Consejo', 'Admin Comunidad']:
        return Response({'error': 'No tienes permisos para crear usuarios'}, 
                       status=status.HTTP_403_FORBIDDEN)
    
    serializer = CreateUserSerializer(data=request.data)
    if serializer.is_valid():
        # Si es admin comunidad, solo puede crear usuarios de su comunidad
        if request.user.rol == 'Admin Comunidad':
            serializer.validated_data['comunidad'] = request.user.comunidad
        
        user = serializer.save()
        return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class CustomUserViewSet(viewsets.ModelViewSet):
    queryset = CustomUser.objects.all()
    serializer_class = UserSerializer

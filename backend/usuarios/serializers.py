from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import CustomUser
from comunidades.models import Comunidad

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        
        # Agregar información adicional al token
        data['user'] = {
            'id': str(self.user.id),
            'username': self.user.username,
            'nombre': self.user.nombre,
            'email': self.user.email,
            'rol': self.user.rol,
            'comunidad': {
                'id': str(self.user.comunidad.id) if self.user.comunidad else None,
                'nombre': self.user.comunidad.nombre if self.user.comunidad else None
            } if self.user.comunidad else None
        }
        
        return data

class UserSerializer(serializers.ModelSerializer):
    comunidad_nombre = serializers.CharField(source='comunidad.nombre', read_only=True)
    fondos_recibidos = serializers.SerializerMethodField()
    fondos_ejecutados = serializers.SerializerMethodField()
    saldo_restante = serializers.SerializerMethodField()
    proyectos_en_ejecucion = serializers.SerializerMethodField()

    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'nombre', 'email', 'rol', 'comunidad', 'comunidad_nombre', 'is_active',
                  'fondos_recibidos', 'fondos_ejecutados', 'saldo_restante', 'proyectos_en_ejecucion']
        read_only_fields = ['id']

    def get_fondos_recibidos(self, obj):
        # Aquí puedes poner la lógica real, por ahora retorna 0
        return 0

    def get_fondos_ejecutados(self, obj):
        return 0

    def get_saldo_restante(self, obj):
        return 0

    def get_proyectos_en_ejecucion(self, obj):
        return 0

class CreateUserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    
    class Meta:
        model = CustomUser
        fields = ['username', 'nombre', 'email', 'password', 'rol', 'comunidad']
    
    def create(self, validated_data):
        user = CustomUser.objects.create_user(**validated_data)
        return user
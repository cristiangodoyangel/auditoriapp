
from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from .models import CustomUser

class UsuarioAPITests(APITestCase):
    def setUp(self):
        self.user = CustomUser.objects.create_user(
            username='testuser',
            password='testpass123',
            email='test@example.com',
            rol='admin',
            is_active=True
        )

    def test_login_jwt(self):
        url = reverse('token_obtain_pair')
        response = self.client.post(url, {'username': 'testuser', 'password': 'testpass123'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)

    def test_profile_authenticated(self):
        url = reverse('token_obtain_pair')
        response = self.client.post(url, {'username': 'testuser', 'password': 'testpass123'})
        token = response.data['access']
        profile_url = reverse('profile')
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        response = self.client.get(profile_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Verificar que los KPIs estén presentes en la respuesta
        self.assertIn('fondos_recibidos', response.data)
        self.assertIn('fondos_ejecutados', response.data)
        self.assertIn('saldo_restante', response.data)
        self.assertIn('proyectos_en_ejecucion', response.data)

    def test_creacion_usuario(self):
        from comunidades.models import Comunidad
        url = reverse('create_user')
        # Crear comunidad para asociar al usuario
        comunidad = Comunidad.objects.create(nombre="San Pedro de Atacama")
        # Crear usuario admin para autenticación
        admin = CustomUser.objects.create_user(
            username='adminuser',
            password='adminpass',
            email='admin@example.com',
            rol='Admin Consejo',
            is_active=True
        )
        login_url = reverse('token_obtain_pair')
        response = self.client.post(login_url, {'username': 'adminuser', 'password': 'adminpass'})
        token = response.data['access']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        data = {
            'username': 'nuevo_usuario',
            'nombre': 'Nuevo Usuario',
            'email': 'nuevo@example.com',
            'password': 'nuevapass',
            'rol': 'usuario',
            'comunidad': comunidad.id
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['username'], 'nuevo_usuario')
        self.assertEqual(response.data['nombre'], 'Nuevo Usuario')
        self.assertEqual(response.data['email'], 'nuevo@example.com')

    def test_logout(self):
        # El logout en JWT es solo borrar el token del cliente, pero podemos simularlo
        url = reverse('token_obtain_pair')
        response = self.client.post(url, {'username': 'testuser', 'password': 'testpass123'})
        token = response.data['access']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        # Acceso con token válido
        profile_url = reverse('profile')
        response = self.client.get(profile_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # "Logout": quitar credenciales
        self.client.credentials()
        response = self.client.get(profile_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

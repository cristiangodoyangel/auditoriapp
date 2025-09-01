from rest_framework.test import APITestCase
from rest_framework import status
from django.contrib.auth import get_user_model
from finanzas.models import MovimientoBancario
from proyectos.models import Proyecto
from comunidades.models import Comunidad

class DashboardTests(APITestCase):
    def setUp(self):
        """
        Método de configuración para crear un usuario de prueba y algunos datos
        necesarios para las pruebas (comunidad, proyecto, movimiento bancario).
        """
        # Crear un usuario de prueba y autenticarse
        user = get_user_model().objects.create_user(
            email="testuser@example.com",  # Email como 'username'
            nombre="Test User",            # Nombre del usuario
            password="testpassword"        # Contraseña
        )
        self.client.login(email="testuser@example.com", password="testpassword")  # Loguear al usuario creado
        
        # Crear los datos de prueba
        comunidad = Comunidad.objects.create(nombre='Comunidad Test', ciudad='Ciudad Test')
        proyecto = Proyecto.objects.create(
            nombre='Proyecto Test', 
            comunidad=comunidad, 
            estado='En Ejecución', 
            presupuesto_asignado=10000, 
            fecha_inicio='2023-01-01', 
            fecha_fin='2023-12-31'
        )
        MovimientoBancario.objects.create(
            comunidad=comunidad, 
            tipo='Ingreso', 
            monto=5000, 
            fecha='2023-09-01', 
            referencia='Ingreso test'
        )

    def test_resumen_kpis(self):
        """
        Prueba para verificar si los KPIs de resumen se calculan correctamente
        en la vista '/dashboard/resumen/'.
        """
        response = self.client.get('/dashboard/resumen/')
        
        # Comprobar si la respuesta es correcta
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Verificar que los KPIs estén presentes en la respuesta
        self.assertIn('fondos_recibidos', response.data)
        self.assertIn('fondos_ejecutados', response.data)
        self.assertIn('saldo_restante', response.data)
        self.assertIn('proyectos_en_ejecucion', response.data)

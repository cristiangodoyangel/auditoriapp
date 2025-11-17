from rest_framework.test import APITestCase
from rest_framework import status
from django.contrib.auth import get_user_model
from finanzas.models import MovimientoBancario, TipoMovimiento 
from proyectos.models import Proyecto
from comunidades.models import Comunidad

class DashboardTests(APITestCase):
    def setUp(self):
        """
        Método de configuración para crear un usuario de prueba y algunos datos
        necesarios para las pruebas (comunidad, proyecto, movimiento bancario).
        """
       
        user = get_user_model().objects.create_user(
            username="testuser",             
            email="testuser@example.com",   
            nombre="Test User",             
            password="testpassword"        
        )
        self.client.login(username="testuser", password="testpassword") 
        
        
        comunidad = Comunidad.objects.create(nombre='Comunidad Test', ciudad='Ciudad Test')
        proyecto = Proyecto.objects.create(
            nombre='Proyecto Test', 
            comunidad=comunidad, 
            estado='En Ejecución', 
            presupuesto_asignado=10000, 
            fecha_inicio='2023-01-01', 
            fecha_fin='2023-12-31'
        )

        
        tipo_ingreso = TipoMovimiento.objects.create(tipo='Ingreso')
        tipo_egreso = TipoMovimiento.objects.create(tipo='Egreso')

      
        MovimientoBancario.objects.create(
            comunidad=comunidad,
            tipo=tipo_ingreso,  
            metodo='Transferencia',
            monto=5000,
            fecha='2023-09-01',
            referencia='Ingreso test',
            creado_por=user  
        )

        MovimientoBancario.objects.create(
            comunidad=comunidad,
            tipo=tipo_egreso,  
            metodo='Cheque',
            monto=3000,
            fecha='2023-09-02',
            referencia='Egreso test',
            creado_por=user
        )

    def test_resumen_kpis(self):
        """
        Prueba para verificar si los KPIs de resumen se calculan correctamente
        en la vista '/dashboard/resumen/'.
        """
        response = self.client.get('/dashboard/resumen/')
        
       
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
    
        self.assertIn('fondos_recibidos', response.data)
        self.assertIn('fondos_ejecutados', response.data)
        self.assertIn('saldo_restante', response.data)
        self.assertIn('proyectos_en_ejecucion', response.data)

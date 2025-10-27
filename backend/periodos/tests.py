from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from comunidades.models import Comunidad
from periodos.models import Periodo
from proyectos.models import Proyecto

class PeriodoProyectoAPITests(APITestCase):
    def setUp(self):
        self.comunidad = Comunidad.objects.create(nombre="Comunidad Test")

    def test_crear_periodo_y_proyecto(self):
        # Crear periodo
        periodo = Periodo.objects.create(
            comunidad=self.comunidad,
            nombre="Periodo 2025",
            fecha_inicio="2025-01-01",
            fecha_fin="2025-12-31",
            monto_asignado=8000000
        )
        self.assertEqual(periodo.monto_asignado, 8000000)
        self.assertEqual(periodo.nombre, "Periodo 2025")
        self.assertEqual(periodo.comunidad, self.comunidad)

        # Crear proyecto
        proyecto = Proyecto.objects.create(
            comunidad=self.comunidad,
            periodo=periodo,
            nombre="Proyecto Test",
            descripcion="Descripción del proyecto",
            fecha_inicio="2025-02-01",
            fecha_fin="2025-11-30",
            presupuesto_total=8000000,
            estado="En ejecución",
            total_rendido=0,
            estado_rendicion="Pendiente"
        )
        self.assertEqual(proyecto.presupuesto_total, 8000000)
        self.assertEqual(proyecto.nombre, "Proyecto Test")
        self.assertEqual(proyecto.periodo, periodo)
        self.assertEqual(proyecto.comunidad, self.comunidad)

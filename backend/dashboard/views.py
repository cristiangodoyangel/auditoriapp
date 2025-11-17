from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_kpis(request):
    """
    Devuelve los KPIs generales para el dashboard.
    """

    data = {
        "monto_asignado": 0,
        "monto_rendido": 0,
        "monto_por_rendir": 0,
        "proyectos_totales": 0,
        "pendientes_validacion": 0,
        "proyectos_validados": 0,
        "proyectos_rechazados": 0
    }
    return Response(data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def resumen(request):
    return Response({"message": "Resumen endpoint"})
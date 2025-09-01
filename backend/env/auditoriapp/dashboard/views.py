# dashboard/views.py
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Sum
from finanzas.models import MovimientoBancario, Gasto, TipoMovimiento
from proyectos.models import Proyecto


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def resumen(request):
    """
    KPIs generales y por comunidad (opcional usar ?comunidad=<uuid>)
    - fondos_recibidos: suma de ingresos
    - fondos_ejecutados: suma de gastos
    - saldo_restante: ingresos - egresos - gastos
    - porcentaje_ejecucion: gastos / ingresos
    - proyectos_por_estado: [{estado, cantidad}]
    """
    comunidad_id = request.query_params.get("comunidad")

    movs = MovimientoBancario.objects.all()
    gastos_qs = Gasto.objects.all()
    proyectos_qs = Proyecto.objects.all()

    if comunidad_id:
        movs = movs.filter(comunidad_id=comunidad_id)
        gastos_qs = gastos_qs.filter(proyecto__comunidad_id=comunidad_id)
        proyectos_qs = proyectos_qs.filter(comunidad_id=comunidad_id)

    ingresos = movs.filter(tipo=TipoMovimiento.INGRESO).aggregate(total=Sum("monto"))["total"] or 0
    egresos = movs.filter(tipo=TipoMovimiento.EGRESO).aggregate(total=Sum("monto"))["total"] or 0
    gastos_total = gastos_qs.aggregate(total=Sum("monto"))["total"] or 0
    saldo = (ingresos or 0) - (egresos or 0) - (gastos_total or 0)

    # Conteo por estado
    estados = proyectos_qs.values_list("estado", flat=False)
    por_estado = (
        proyectos_qs.values("estado")
        .order_by()
        .annotate(cantidad=Sum(1))
    )

    data = {
        "fondos_recibidos": float(ingresos or 0),
        "fondos_ejecutados": float(gastos_total or 0),
        "saldo_restante": float(saldo or 0),
        "porcentaje_ejecucion": float(((gastos_total or 0) / ingresos * 100) if ingresos else 0),
        "proyectos_por_estado": list(por_estado),
    }
    return Response(data)

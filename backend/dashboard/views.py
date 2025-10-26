# dashboard/views.py
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Sum, Count
from proyectos.models import Proyecto
from periodos.models import Periodo
from comunidades.models import Comunidad

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_kpis(request):
    user = request.user
    
    if user.rol == 'Admin Comunidad':
        # KPIs para una comunidad específica
        comunidad = user.comunidad
        periodo_activo = Periodo.objects.filter(comunidad=comunidad, activo=True).first()
        
        if not periodo_activo:
            return Response({
                'error': 'No hay periodo activo para esta comunidad',
                'monto_total_asignado': 0,
                'monto_gastado': 0,
                'monto_disponible': 0,
                'total_proyectos': 0,
                'proyectos_aprobados': 0,
                'proyectos_en_revision': 0,
                'proyectos_pendientes': 0
            })
        
        proyectos = Proyecto.objects.filter(comunidad=comunidad, periodo=periodo_activo)
        monto_gastado = proyectos.filter(estado__in=['Aprobado', 'En Ejecución', 'Finalizado']).aggregate(
            total=Sum('presupuesto_asignado'))['total'] or 0
        
        return Response({
            'monto_total_asignado': periodo_activo.monto_total,
            'monto_gastado': monto_gastado,
            'monto_disponible': periodo_activo.monto_total - monto_gastado,
            'total_proyectos': proyectos.count(),
            'proyectos_aprobados': proyectos.filter(estado='Aprobado').count(),
            'proyectos_en_revision': proyectos.filter(estado='Enviado a Revision').count(),
            'proyectos_pendientes': proyectos.filter(estado='Borrador').count(),
            'periodo_actual': {
                'año': periodo_activo.año,
                'monto_asignado': periodo_activo.monto_asignado,
                'saldo_anterior': periodo_activo.saldo_anterior
            }
        })
    
    elif user.rol in ['Admin Consejo', 'Auditor']:
        # KPIs globales para todos los periodos activos
        periodos_activos = Periodo.objects.filter(activo=True)
        total_asignado = periodos_activos.aggregate(total=Sum('monto_total'))['total'] or 0
        
        proyectos_todos = Proyecto.objects.filter(periodo__in=periodos_activos)
        total_gastado = proyectos_todos.filter(estado__in=['Aprobado', 'En Ejecución', 'Finalizado']).aggregate(
            total=Sum('presupuesto_asignado'))['total'] or 0
        
        return Response({
            'monto_total_asignado': total_asignado,
            'monto_gastado': total_gastado,
            'monto_disponible': total_asignado - total_gastado,
            'total_proyectos': proyectos_todos.count(),
            'proyectos_aprobados': proyectos_todos.filter(estado='Aprobado').count(),
            'proyectos_en_revision': proyectos_todos.filter(estado='Enviado a Revision').count(),
            'proyectos_pendientes': proyectos_todos.filter(estado='Borrador').count(),
            'total_comunidades': Comunidad.objects.filter(activa=True).count(),
            'periodos_activos': periodos_activos.count()
        })
    
    return Response({'error': 'Rol no autorizado'}, status=403)
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

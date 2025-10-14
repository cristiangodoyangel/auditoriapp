import requests
import json

# Probar login rápido
try:
    response = requests.post("http://127.0.0.1:8000/api/auth/login/", 
                           data={"username": "admin_norte", "password": "123456"})
    
    if response.status_code == 200:
        data = response.json()
        print("✅ LOGIN EXITOSO!")
        print(f"Usuario: {data['user']['nombre']}")
        print(f"Rol: {data['user']['rol']}")
        print(f"Comunidad: {data['user']['comunidad']['nombre'] if data['user']['comunidad'] else 'N/A'}")
        
        # Probar KPIs
        token = data['access']
        headers = {"Authorization": f"Bearer {token}"}
        
        kpi_response = requests.get("http://127.0.0.1:8000/api/dashboard/kpis/", headers=headers)
        if kpi_response.status_code == 200:
            kpi_data = kpi_response.json()
            print("\n✅ DASHBOARD KPIs:")
            print(f"Monto Total: ${kpi_data.get('monto_total_asignado', 0):,.0f}")
            print(f"Monto Gastado: ${kpi_data.get('monto_gastado', 0):,.0f}")
            print(f"Monto Disponible: ${kpi_data.get('monto_disponible', 0):,.0f}")
            print(f"Total Proyectos: {kpi_data.get('total_proyectos', 0)}")
        else:
            print(f"❌ Error KPIs: {kpi_response.text}")
        
        # Probar listar proyectos
        proj_response = requests.get("http://127.0.0.1:8000/api/proyectos/", headers=headers)
        if proj_response.status_code == 200:
            proyectos = proj_response.json()
            print(f"\n✅ PROYECTOS: {len(proyectos['results']) if 'results' in proyectos else len(proyectos)}")
        else:
            print(f"❌ Error Proyectos: {proj_response.text}")
            
    else:
        print(f"❌ Login failed: {response.text}")
        
except Exception as e:
    print(f"❌ Error: {e}")
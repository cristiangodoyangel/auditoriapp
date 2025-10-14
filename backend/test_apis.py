import requests
import json

# URL base del API
BASE_URL = "http://127.0.0.1:8001/api"

def test_login():
    """Probar login con diferentes usuarios"""
    print("=== TESTING LOGIN ===")
    
    users = [
        {"username": "admin_consejo", "password": "123456", "rol": "Admin Consejo"},
        {"username": "admin_norte", "password": "123456", "rol": "Admin Comunidad"},
        {"username": "auditor1", "password": "123456", "rol": "Auditor"}
    ]
    
    tokens = {}
    
    for user in users:
        response = requests.post(f"{BASE_URL}/auth/login/", {
            "username": user["username"],
            "password": user["password"]
        })
        
        if response.status_code == 200:
            data = response.json()
            tokens[user["username"]] = data["access"]
            print(f"✓ Login exitoso: {user['username']} - {data['user']['rol']}")
            print(f"  Comunidad: {data['user']['comunidad']['nombre'] if data['user']['comunidad'] else 'N/A'}")
        else:
            print(f"✗ Login fallido: {user['username']} - {response.text}")
    
    return tokens

def test_dashboard_kpis(tokens):
    """Probar KPIs del dashboard"""
    print("\n=== TESTING DASHBOARD KPIs ===")
    
    for username, token in tokens.items():
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.get(f"{BASE_URL}/dashboard/kpis/", headers=headers)
        
        if response.status_code == 200:
            data = response.json()
            print(f"\n✓ KPIs para {username}:")
            print(f"  Monto Total Asignado: ${data.get('monto_total_asignado', 0):,.0f}")
            print(f"  Monto Gastado: ${data.get('monto_gastado', 0):,.0f}")
            print(f"  Monto Disponible: ${data.get('monto_disponible', 0):,.0f}")
            print(f"  Total Proyectos: {data.get('total_proyectos', 0)}")
        else:
            print(f"✗ Error KPIs {username}: {response.text}")

def test_proyectos_api(tokens):
    """Probar API de proyectos"""
    print("\n=== TESTING PROYECTOS API ===")
    
    # Usar token de admin_norte
    token = tokens.get("admin_norte")
    if not token:
        print("✗ No hay token para admin_norte")
        return
    
    headers = {"Authorization": f"Bearer {token}"}
    
    # Listar proyectos
    response = requests.get(f"{BASE_URL}/proyectos/", headers=headers)
    if response.status_code == 200:
        proyectos = response.json()["results"] if "results" in response.json() else response.json()
        print(f"✓ Proyectos listados: {len(proyectos)}")
        
        if proyectos:
            proyecto = proyectos[0]
            print(f"  Primer proyecto: {proyecto['nombre']} - Estado: {proyecto['estado']}")
            
            # Probar enviar a revisión
            proyecto_id = proyecto['id']
            response = requests.post(f"{BASE_URL}/proyectos/{proyecto_id}/enviar_revision/", headers=headers)
            if response.status_code == 200:
                print(f"✓ Proyecto enviado a revisión")
            else:
                print(f"✗ Error enviando a revisión: {response.text}")
    else:
        print(f"✗ Error listando proyectos: {response.text}")

def test_socios_api(tokens):
    """Probar API de socios"""
    print("\n=== TESTING SOCIOS API ===")
    
    token = tokens.get("admin_norte")
    if not token:
        print("✗ No hay token para admin_norte")
        return
    
    headers = {"Authorization": f"Bearer {token}"}
    
    # Listar socios
    response = requests.get(f"{BASE_URL}/socios/", headers=headers)
    if response.status_code == 200:
        socios = response.json()["results"] if "results" in response.json() else response.json()
        print(f"✓ Socios listados: {len(socios)}")
        for socio in socios:
            print(f"  - {socio['nombre_completo']} (RUT: {socio['rut']})")
    else:
        print(f"✗ Error listando socios: {response.text}")

if __name__ == "__main__":
    try:
        tokens = test_login()
        if tokens:
            test_dashboard_kpis(tokens)
            test_proyectos_api(tokens)
            test_socios_api(tokens)
            print("\n🎉 ¡Todas las pruebas completadas!")
        else:
            print("✗ No se pudieron obtener tokens")
    except requests.exceptions.ConnectionError:
        print("✗ Error: No se puede conectar al servidor. ¿Está corriendo en http://127.0.0.1:8001?")
    except Exception as e:
        print(f"✗ Error inesperado: {e}")
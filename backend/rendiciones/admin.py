# rendiciones/apps.py
from django.apps import AppConfig

class RendicionesConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'rendiciones'

    # --- AÑADE ESTA FUNCIÓN ---
    def ready(self):
        # Importar las señales para que se registren
        import rendiciones.signals
    # --------------------------
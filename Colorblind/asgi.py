"""ASGI config for colorblind_app project."""
import os
from django.core.asgi import get_asgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Colorblind.settings')
application = get_asgi_application()

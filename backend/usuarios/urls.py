from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

urlpatterns = [
    path('login/', views.login_view, name='login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('profile/', views.profile_view, name='profile'),
    path('create-user/', views.create_user_view, name='create_user'),
    path('inicio-admin-comunidad/', views.inicio_admin_comunidad, name='inicio_admin_comunidad'),
]
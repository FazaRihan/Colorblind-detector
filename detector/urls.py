from django.urls import path
from . import views

app_name = 'detector'

urlpatterns = [
    path('', views.index, name='index'),
    path('tentang/', views.tentang, name='tentang'),
    path('api/hasil/', views.hasil_terakhir, name='hasil_terakhir'),
    path('api/simpan/', views.simpan_hasil, name='simpan_hasil'),
    path('api/hapus/', views.hapus_semua, name='hapus_semua'),
]

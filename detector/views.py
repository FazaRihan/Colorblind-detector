from django.shortcuts import render, redirect
from django.http import JsonResponse
from django.views.decorators.http import require_POST
from .models import TestResult
import json


def index(request):
    """Halaman utama aplikasi (index)."""
    context = {
        'title': 'Aplikasi Bantu Buta Warna',
        'app_name': 'ColorBlind Helper',
    }
    return render(request, 'detector/index.html', context)


def tentang(request):
    """Halaman tentang aplikasi."""
    return render(request, 'detector/tentang.html', {'title': 'Tentang Aplikasi'})


def hasil_terakhir(request):
    """Menampilkan hasil tes terakhir dalam format JSON."""
    results = TestResult.objects.all()[:10]
    data = [{
        'nama': r.nama,
        'usia': r.usia,
        'jenis_kelamin': r.get_jenis_kelamin_display(),
        'hasil': r.get_hasil_display(),
        'skor': r.skor,
        'total_soal': r.total_soal,
        'tanggal': r.tanggal_tes.strftime('%d %B %Y %H:%M'),
    } for r in results]
    return JsonResponse({'status': 'ok', 'data': data})


@require_POST
def simpan_hasil(request):
    """Endpoint API untuk menyimpan hasil tes buta warna."""
    try:
        body = json.loads(request.body)
        TestResult.objects.create(
            nama=body.get('nama', 'Anonim'),
            usia=int(body.get('usia', 0)),
            jenis_kelamin=body.get('jenis_kelamin', 'L'),
            hasil=body.get('hasil', 'normal'),
            skor=int(body.get('skor', 0)),
            total_soal=int(body.get('total_soal', 5)),
            catatan=body.get('catatan', ''),
        )
        return JsonResponse({'status': 'ok', 'message': 'Hasil tersimpan'})
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)}, status=400)


def hapus_semua(request):
    """Endpoint untuk menghapus semua hasil tes (admin)."""
    if request.method == 'POST':
        TestResult.objects.all().delete()
        return JsonResponse({'status': 'ok', 'message': 'Semua data dihapus'})
    return JsonResponse({'status': 'error'}, status=405)

from django.contrib import admin
from .models import TestResult

@admin.register(TestResult)
class TestResultAdmin(admin.ModelAdmin):
    list_display = ('nama', 'usia', 'jenis_kelamin', 'hasil', 'skor', 'tanggal_tes')
    list_filter = ('hasil', 'jenis_kelamin', 'tanggal_tes')
    search_fields = ('nama',)
    readonly_fields = ('tanggal_tes',)

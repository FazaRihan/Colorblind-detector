from django.db import models


class TestResult(models.Model):
    """Model untuk menyimpan hasil tes buta warna."""
    JENIS_KELAMIN = [
        ('L', 'Laki-laki'),
        ('P', 'Perempuan'),
    ]
    JENIS_BUTA_WARNA = [
        ('normal', 'Normal'),
        ('protanopia', 'Protanopia'),
        ('deuteranopia', 'Deuteranopia'),
        ('tritanopia', 'Tritanopia'),
        ('total', 'Buta Warna Total'),
    ]

    nama = models.CharField(max_length=100)
    usia = models.PositiveIntegerField()
    jenis_kelamin = models.CharField(max_length=1, choices=JENIS_KELAMIN)
    hasil = models.CharField(max_length=20, choices=JENIS_BUTA_WARNA, default='normal')
    skor = models.IntegerField(default=0)
    total_soal = models.IntegerField(default=5)
    tanggal_tes = models.DateTimeField(auto_now_add=True)
    catatan = models.TextField(blank=True, null=True)

    class Meta:
        verbose_name = 'Hasil Tes'
        verbose_name_plural = 'Hasil Tes'
        ordering = ['-tanggal_tes']

    def __str__(self):
        return f"{self.nama} - {self.get_hasil_display()} ({self.skor}/{self.total_soal})"

    def get_hasil_display_label(self):
        """Label untuk tampilan."""
        return dict(self.JENIS_BUTA_WARNA).get(self.hasil, 'Tidak diketahui')

from django.test import TestCase
from .models import TestResult


class TestResultModelTest(TestCase):
    def setUp(self):
        self.result = TestResult.objects.create(
            nama='Budi Santoso',
            usia=25,
            jenis_kelamin='L',
            hasil='protanopia',
            skor=3,
            total_soal=5,
        )

    def test_str_representation(self):
        self.assertIn('Budi Santoso', str(self.result))
        self.assertIn('Protanopia', str(self.result))

    def test_default_values(self):
        self.assertEqual(self.result.hasil, 'protanopia')
        self.assertEqual(self.result.skor, 3)

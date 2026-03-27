from django.core.management.base import BaseCommand
from api.models import Prediction, Dataset, ModelMetrics, PredictionFeatures
from rest_framework.authtoken.models import Token


class Command(BaseCommand):
    help = 'Clear all prediction, dataset, and metrics data. User accounts are preserved.'

    def add_arguments(self, parser):
        parser.add_argument(
            '--confirm',
            action='store_true',
            help='Skip confirmation prompt',
        )

    def handle(self, *args, **options):
        if not options['confirm']:
            confirm = input(
                'This will delete ALL predictions, datasets, and metrics. '
                'User accounts will be kept. Type "yes" to continue: '
            )
            if confirm.lower() != 'yes':
                self.stdout.write(self.style.WARNING('Aborted.'))
                return

        pf_count  = PredictionFeatures.objects.count()
        pred_count = Prediction.objects.count()
        ds_count   = Dataset.objects.count()
        mm_count   = ModelMetrics.objects.count()

        PredictionFeatures.objects.all().delete()
        Prediction.objects.all().delete()
        Dataset.objects.all().delete()
        ModelMetrics.objects.all().delete()

        # Invalidate all auth tokens so users are forced to re-login
        Token.objects.all().delete()

        self.stdout.write(self.style.SUCCESS(
            f'Deleted: {pf_count} feature records, {pred_count} predictions, '
            f'{ds_count} datasets, {mm_count} metrics. '
            f'All auth tokens invalidated — users must log in again.'
        ))

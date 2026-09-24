import django.core.validators
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('admin_backend', '0003_labtest'),
    ]

    operations = [
        migrations.AddField(
            model_name='staff',
            name='date_of_birth',
            field=models.DateField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='staff',
            name='address',
            field=models.TextField(blank=True),
        ),
        migrations.AddField(
            model_name='staff',
            name='phone_number',
            field=models.CharField(
                blank=True,
                max_length=15,
                validators=[
                    django.core.validators.RegexValidator(
                        message=(
                            "Phone number must contain 7 to 15 digits "
                            "and may start with a '+'."
                        ),
                        regex='^\\+?\\d{7,15}$',
                    )
                ],
            ),
        ),
    ]
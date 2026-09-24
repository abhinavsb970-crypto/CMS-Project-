import django.core.validators
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('admin_backend', '0005_alter_labtest_options_alter_medicine_options'),
    ]

    operations = [
        migrations.AlterField(
            model_name='staff',
            name='phone_number',
            field=models.CharField(
                blank=True,
                max_length=10,
                validators=[
                    django.core.validators.RegexValidator(
                        message="Phone number must be exactly 10 digits.",
                        regex='^\\d{10}$',
                    )
                ],
            ),
        ),
    ]
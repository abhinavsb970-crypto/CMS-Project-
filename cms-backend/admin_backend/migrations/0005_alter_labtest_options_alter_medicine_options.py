from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('admin_backend', '0004_staff_dob_address_phone'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='labtest',
            options={
                'verbose_name': 'Lab Master',
                'verbose_name_plural': 'Lab Master',
            },
        ),
        migrations.AlterModelOptions(
            name='medicine',
            options={
                'verbose_name': 'Medicine Master',
                'verbose_name_plural': 'Medicine Master',
            },
        ),
    ]
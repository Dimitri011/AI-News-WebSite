from django.core.management.base import BaseCommand
from django.contrib.auth.models import User

class Command(BaseCommand):
    help = "Creeaz?/actualizeaz? utilizatorul unic (superuser) ?i dezactiveaz? restul"

    def add_arguments(self, parser):
        parser.add_argument("--username", required=True)
        parser.add_argument("--password", required=True)
        parser.add_argument("--email", default="admin@example.com")

    def handle(self, *args, **options):
        username = options["username"]
        password = options["password"]
        email    = options["email"]

        u, created = User.objects.get_or_create(username=username, defaults={"email": email})
        u.is_staff = True
        u.is_superuser = True
        u.set_password(password)
        u.save()

        # dezactiveaz? to?i ceilal?i
        User.objects.exclude(pk=u.pk).update(is_active=False)

        self.stdout.write(self.style.SUCCESS(
            f"OK: user '{username}' (created={created}). Ceilal?i au fost dezactiva?i."
        ))

# core/management/commands/bootstrap_site.py
from django.core.management.base import BaseCommand
from core.models import SiteSettings, Category

# folosim nume ASCII ca sa evitam problemele de encoding
CATS = [
    ("Piete", "ri-funds-fill"),
    ("Trenduri", "ri-radar-fill"),
    ("Fapt divers", "ri-spam-3-line"),
    ("Mortul zilei", "ri-skull-2-fill"),
    ("Stirea zilei", "ri-lightbulb-flash-fill"),
    ("Razboi", "ri-sword-line"),
]

def slugify_ro(txt: str) -> str:
    """Inlocuieste diacriticele, in caz ca vei folosi nume cu diacritice pe viitor."""
    mapping = {
        "\u0103": "a", "\u0102": "A",  # ? ?
        "\u00e2": "a", "\u00c2": "A",  # a A
        "\u00ee": "i", "\u00ce": "I",  # i I
        "\u0219": "s", "\u0218": "S",  # ? ?
        "\u021b": "t", "\u021a": "T",  # ? ?
        "\u015f": "s", "\u015e": "S",  # ? ? (vechi)
        "\u0163": "t", "\u0162": "T",  # ? ? (vechi)
    }
    for k, v in mapping.items():
        txt = txt.replace(k, v)
    return txt.lower().replace(" ", "-")

class Command(BaseCommand):
    help = "Populeaza SiteSettings si categoriile implicite pentru LOCO/EXTERNE"

    def handle(self, *args, **opts):
        # asigura randul unic de setari
        SiteSettings.get_solo()
        created = 0

        for edition in ("loco", "externe"):
            order = 0
            for name, icon in CATS:
                slug = slugify_ro(name)
                _, was_created = Category.objects.get_or_create(
                    slug=slug,
                    edition=edition,
                    defaults={"name": name, "icon": icon, "order": order},
                )
                if was_created:
                    created += 1
                order += 10

        self.stdout.write(self.style.SUCCESS(f"Bootstrap gata. Categorii noi: {created}"))


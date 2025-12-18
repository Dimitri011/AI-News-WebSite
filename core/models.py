# core/models.py
from django.db import models
from django.utils import timezone

class SiteSettings(models.Model):
    site_name = models.CharField(max_length=60, default="Telegrame")
    logo = models.ImageField(upload_to="logos/", blank=True, null=True)
    urgent_text = models.CharField(max_length=160, blank=True, default="")
    urgent_link = models.URLField(blank=True, default="")

    class Meta:
        verbose_name = "Setari site"
        verbose_name_plural = "Setari site"

    def __str__(self):
        return "Setari site"

    @classmethod
    def get_solo(cls):
        obj, _ = cls.objects.get_or_create(pk=1)
        return obj


class Category(models.Model):
    EDITIONS = [("loco", "LOCO"), ("externe", "EXTERNE")]

    name = models.CharField(max_length=60)
    slug = models.SlugField()
    edition = models.CharField(max_length=8, choices=EDITIONS, default="loco")
    icon = models.CharField(max_length=40, default="ri-article-line")
    order = models.PositiveIntegerField(default=0)

    class Meta:
        unique_together = ("slug", "edition")
        ordering = ["order", "name"]
        verbose_name = "Categorie"
        verbose_name_plural = "Categorii"

    def __str__(self):
        return f"{self.get_edition_display()} - {self.name}"


class ArticleQuerySet(models.QuerySet):
    def published(self):
        return self.filter(status="published", publish_at__lte=timezone.now())


class Article(models.Model):
    STATUS = [("draft", "Draft"), ("published", "Publicat")]

    title = models.CharField(max_length=140)
    slug = models.SlugField(unique=True)
    category = models.ForeignKey(Category, on_delete=models.PROTECT, related_name="articles")
    content = models.TextField(max_length=500, help_text="Stire scurta / telegrama (~500 caractere)")
    status = models.CharField(max_length=10, choices=STATUS, default="draft")
    publish_at = models.DateTimeField(default=timezone.now)
    is_urgent = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = ArticleQuerySet.as_manager()

    class Meta:
        ordering = ["-publish_at"]
        verbose_name = "Articol"
        verbose_name_plural = "Articole"

    def __str__(self):
        return self.title

    @property
    def is_published(self):
        return self.status == "published" and self.publish_at <= timezone.now()

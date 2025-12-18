from django.contrib import admin
from django.contrib.auth.models import User, Group
from django.contrib.auth.admin import UserAdmin
from django.contrib.admin.sites import NotRegistered
from .models import SiteSettings, Category, Article

# Unregister default admins for User and Group (if already registered)
for m in (User, Group):
    try:
        admin.site.unregister(m)
    except NotRegistered:
        pass

# Single user admin: userul isi poate edita doar propriul cont, fara add/delete
@admin.register(User)
class SingleUserAdmin(UserAdmin):
    def has_add_permission(self, request):
        return False
    def has_delete_permission(self, request, obj=None):
        return False
    def get_queryset(self, request):
        qs = super().get_queryset(request)
        if request.user.is_superuser:
            return qs.filter(pk=request.user.pk)
        return qs.none()

@admin.register(SiteSettings)
class SiteSettingsAdmin(admin.ModelAdmin):
    def has_add_permission(self, request):
        # permitem exact un rand de setari
        return not SiteSettings.objects.exists()

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("name", "edition", "order", "icon")
    list_filter = ("edition",)
    search_fields = ("name", "slug")
    prepopulated_fields = {"slug": ("name",)}
    ordering = ("edition", "order")

@admin.action(description="Publish selected")
def make_published(modeladmin, request, queryset):
    queryset.update(status="published")

@admin.action(description="Draft selected")
def make_draft(modeladmin, request, queryset):
    queryset.update(status="draft")

@admin.register(Article)
class ArticleAdmin(admin.ModelAdmin):
    list_display = ("title", "category", "status", "publish_at", "is_urgent")
    list_filter = ("status", "category__edition", "category")
    search_fields = ("title", "content")
    prepopulated_fields = {"slug": ("title",)}
    actions = [make_published, make_draft]
    autocomplete_fields = ("category",)

from django.urls import path, re_path
from django.contrib.auth import views as auth_views
from .views import (
    HomeView, DayView, ArchiveView,
    CategoryDetailView, UrgentUpdateView, ArticleCreateView
)

urlpatterns = [
    # RUTE FIXE  PRIMELE!
    path("login/",  auth_views.LoginView.as_view(template_name="core/login.html"), name="login"),
    # Logout prin POST + redirect imediat acas?
    path("logout/", auth_views.LogoutView.as_view(next_page="/"), name="logout"),
    path("urgent/update/", UrgentUpdateView.as_view(), name="urgent_update"),
    path("post/<str:edition>/<slug:slug>/", ArticleCreateView.as_view(), name="article_create"),

    # Arhiva (accept? /arhiva/loco ?i /arhiva/loco/)
    re_path(r"^arhiva/(?P<edition>(loco|externe))/?$", ArchiveView.as_view(), name="archive"),

    # Pagini pe edi?ie + categorie  la final ?i cu edi?ia limitat?
    re_path(r"^(?P<edition>(loco|externe))/(?P<slug>[-a-z0-9]+)/$", CategoryDetailView.as_view(), name="category"),
    re_path(r"^(?P<edition>(loco|externe))/$", DayView.as_view(), name="day"),

    # Home
    path("", HomeView.as_view(), name="home"),
]

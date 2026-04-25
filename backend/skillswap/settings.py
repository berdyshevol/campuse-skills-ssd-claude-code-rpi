"""
Django settings for the SkillSwap project.

This file is read once at startup. Anything that should differ between
local dev and Render production is pulled from environment variables via
django-environ, so the same code runs in both places.
"""

from pathlib import Path

import dj_database_url
import environ

BASE_DIR = Path(__file__).resolve().parent.parent

env = environ.Env(
    DJANGO_DEBUG=(bool, False),
)
# Load a .env file when present (dev only). In production Render injects env vars directly.
environ.Env.read_env(BASE_DIR / ".env")

SECRET_KEY = env("DJANGO_SECRET_KEY", default="dev-only-not-secret-change-me")
DEBUG = env("DJANGO_DEBUG")

ALLOWED_HOSTS = env.list(
    "DJANGO_ALLOWED_HOSTS",
    default=["localhost", "127.0.0.1", ".onrender.com"],
)

# The Next.js app's origin. Used for CORS, CSRF trust, and cookie domain decisions.
FRONTEND_ORIGIN = env("FRONTEND_ORIGIN", default="http://localhost:3000")


INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    # third-party
    "rest_framework",
    "corsheaders",
    "cloudinary_storage",
    "cloudinary",
    # local apps
    "accounts",
    "skills",
    "ratings",
    "bookings",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    # WhiteNoise serves collected static files in production without nginx.
    "whitenoise.middleware.WhiteNoiseMiddleware",
    # CORS must come before CommonMiddleware so it can short-circuit preflights.
    "corsheaders.middleware.CorsMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "skillswap.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "skillswap.wsgi.application"


# Database: SQLite locally, Postgres on Render (DATABASE_URL injected by the linked db).
DATABASES = {
    "default": dj_database_url.config(
        default=f"sqlite:///{BASE_DIR / 'db.sqlite3'}",
        conn_max_age=600,
    )
}


AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]


LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"
USE_I18N = True
USE_TZ = True


STATIC_URL = "static/"
STATIC_ROOT = BASE_DIR / "staticfiles"
STATICFILES_STORAGE = "whitenoise.storage.CompressedManifestStaticFilesStorage"

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"


# Django REST Framework: cookie-session auth, sane defaults.
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework.authentication.SessionAuthentication",
    ],
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.IsAuthenticatedOrReadOnly",
    ],
    "DEFAULT_PAGINATION_CLASS": "rest_framework.pagination.PageNumberPagination",
    "PAGE_SIZE": 20,
}


# CORS / CSRF for the Next.js client.
# The browser sends the session cookie cross-site, so we must:
#   1) whitelist the frontend origin
#   2) allow credentials
#   3) trust the frontend origin for CSRF
#   4) (in prod, over HTTPS) mark the session cookie SameSite=None + Secure
CORS_ALLOW_CREDENTIALS = True
CORS_ALLOWED_ORIGINS = [FRONTEND_ORIGIN]
CSRF_TRUSTED_ORIGINS = [FRONTEND_ORIGIN]

if DEBUG:
    # Dev: same-site=Lax over http://localhost works without Secure flags.
    SESSION_COOKIE_SAMESITE = "Lax"
    CSRF_COOKIE_SAMESITE = "Lax"
    SESSION_COOKIE_SECURE = False
    CSRF_COOKIE_SECURE = False
else:
    # Prod: cross-site cookies require SameSite=None + Secure (HTTPS only).
    SESSION_COOKIE_SAMESITE = "None"
    CSRF_COOKIE_SAMESITE = "None"
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")

# CSRF token cookie must be readable by JS so Next.js can echo it in the X-CSRFToken header.
CSRF_COOKIE_HTTPONLY = False


# Cloudinary: only configured if CLOUDINARY_URL is set; otherwise media stays on local disk.
CLOUDINARY_URL = env("CLOUDINARY_URL", default="")
if CLOUDINARY_URL:
    DEFAULT_FILE_STORAGE = "cloudinary_storage.storage.MediaCloudinaryStorage"
    CLOUDINARY_STORAGE = {"CLOUDINARY_URL": CLOUDINARY_URL}
else:
    MEDIA_URL = "/media/"
    MEDIA_ROOT = BASE_DIR / "media"

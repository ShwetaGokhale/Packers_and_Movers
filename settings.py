"""
Django settings for User_Management project.
"""

from pathlib import Path
import os

# --------------------------------
# BASE DIR SETUP
# --------------------------------
BASE_DIR = Path(__file__).resolve().parent.parent
TEMP_DIR = os.path.join(BASE_DIR, 'templates')  # Correct path for templates

# --------------------------------
# SECURITY SETTINGS
# --------------------------------
SECRET_KEY = 'django-insecure-=omk0=$w^wssy!v_4^33$+y-5err5c4zd5%ah09%xqw#g_3d5f'
DEBUG = True  # Set to False in production
ALLOWED_HOSTS = ['*']  # Replace with domain or IP in production

# --------------------------------
# INSTALLED APPS
# --------------------------------
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'django.contrib.humanize',
    'rest_framework',
    'rest_framework.authtoken',
    'accounts',
]

# --------------------------------
# REST FRAMEWORK CONFIG
# --------------------------------
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework.authentication.TokenAuthentication',
    ),
}

# --------------------------------
# MIDDLEWARE
# --------------------------------
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

# --------------------------------
# URL CONFIG
# --------------------------------
ROOT_URLCONF = 'User_Management.urls'
WSGI_APPLICATION = 'User_Management.wsgi.application'

# --------------------------------
# TEMPLATE CONFIG
# --------------------------------
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [TEMP_DIR],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

# --------------------------------
# DATABASE CONFIG
# --------------------------------
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': 'daaple_data',
        'USER': 'daaple_user',
        'PASSWORD': 'Daaple@@2025',
        'HOST': 'localhost',
        'PORT': 3306,
    }
}

# --------------------------------
# PASSWORD VALIDATION
# --------------------------------
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

# --------------------------------
# TIMEZONE AND LANG
# --------------------------------
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

# --------------------------------
# STATIC FILES CONFIG
# --------------------------------

# Static URL must match your subpath (e.g., /dapple/)
STATIC_URL = '/dapple/static/'

# Where collectstatic will dump all static files for production
STATIC_ROOT = '/var/www/Dapple/staticfiles/'

# Where Django looks for static source files before collectstatic
STATICFILES_DIRS = [os.path.join(BASE_DIR, 'static')]

# For mounting app under subpath like /dapple
FORCE_SCRIPT_NAME = '/dapple'

# --------------------------------
# LOGIN / LOGOUT REDIRECTS
# --------------------------------
LOGIN_URL = '/dapple/'
LOGIN_REDIRECT_URL = '/dapple/dashboard/'
LOGOUT_REDIRECT_URL = '/dapple/'

# --------------------------------
# EMAIL CONFIG
# --------------------------------
EMAIL_BACKEND = "django.core.mail.backends.smtp.EmailBackend"
EMAIL_HOST = "smtp.gmail.com"
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = "infitestmail2024@gmail.com"
EMAIL_HOST_PASSWORD = "sxuaapyncqqcesgv"
DEFAULT_FROM_EMAIL = EMAIL_HOST_USER

# --------------------------------
# DEFAULT PRIMARY KEY TYPE
# --------------------------------
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

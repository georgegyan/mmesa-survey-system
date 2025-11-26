from django.urls import path
from . import views

urlpatterns = [
    path('responses/', views.SurveyResponseListCreate.as_view(), name='survey-response-list'),
    path('responses/<int:pk>/', views.SurveyResponseDetailView.as_view(), name='survey-response-detail'),
    path('test-email/', views.test_email, name='test-email'),
]
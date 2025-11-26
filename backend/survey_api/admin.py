from django.contrib import admin
from .models import SurveyResponse

@admin.register(SurveyResponse)
class SurveyResponseAdmin(admin.ModelAdmin):
    list_display = ['email', 'index_number', 'selected_option', 'submitted_at']
    list_filter = ['selected_option', 'year_of_study']
    search_fields = ['email', 'index_number']
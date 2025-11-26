from rest_framework import serializers
from .models import SurveyResponse

class SurveyResponseSerializer(serializers.ModelSerializer):
    class Meta:
        model = SurveyResponse
        fields = '__all__'
        read_only_fields = ('submitted_at', 'email_sent', 'email_sent_at')
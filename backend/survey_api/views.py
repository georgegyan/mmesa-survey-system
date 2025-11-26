from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.decorators import api_view
from .models import SurveyResponse
from .serializers import SurveyResponseSerializer
from .email_service import SurveyEmailService
from django.core.mail import send_mail
from django.utils import timezone

class SurveyResponseListCreate(generics.ListCreateAPIView):
    queryset = SurveyResponse.objects.all()
    serializer_class = SurveyResponseSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Save the response
        survey_response = serializer.save()
        
        # Send confirmation email
        try:
            email_sent = SurveyEmailService.send_survey_confirmation(survey_response)
            if email_sent:
                survey_response.email_sent = True
                survey_response.email_sent_at = timezone.now()
                survey_response.save()
            
            # Also send admin notification
            SurveyEmailService.send_admin_notification(survey_response)
            
        except Exception as e:
            print(f"Email sending failed: {str(e)}")
            # Don't fail the request if email fails
        
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

class SurveyResponseDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = SurveyResponse.objects.all()
    serializer_class = SurveyResponseSerializer

@api_view(['POST'])
def test_email(request):
    """Test endpoint to verify email configuration"""
    try:
        send_mail(
            'MMESA Email Test',
            'This is a test email from MMESA Survey System.',
            None,  # Uses DEFAULT_FROM_EMAIL
            ['test@example.com'],  # Replace with your email
            fail_silently=False,
        )
        return Response({'message': 'Test email sent successfully'})
    except Exception as e:
        return Response({'error': str(e)}, status=500)
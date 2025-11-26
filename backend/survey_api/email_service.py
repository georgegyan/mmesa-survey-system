from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils.html import strip_tags
import os

class SurveyEmailService:
    @staticmethod
    def send_survey_confirmation(survey_response):
        """
        Send confirmation email to user after survey submission
        """
        try:
            subject = "MMESA Short Course Survey Submission Confirmation"
            
            # Prepare email context
            context = {
                'student_name': survey_response.email.split('@')[0],  # Use email username as name
                'index_number': survey_response.index_number,
                'selected_option': survey_response.selected_option,
                'submission_date': survey_response.submitted_at.strftime("%B %d, %Y at %H:%M"),
                'year_of_study': survey_response.year_of_study,
            }
            
            # Render HTML template
            html_content = render_to_string('emails/survey_confirmation.html', context)
            text_content = strip_tags(html_content)  # Fallback text version
            
            # Create email
            email = EmailMultiAlternatives(
                subject=subject,
                body=text_content,
                from_email=None,  # Uses DEFAULT_FROM_EMAIL from settings
                to=[survey_response.email],
                reply_to=['mmesa8134@gmail.com']  # MMESA official email
            )
            
            email.attach_alternative(html_content, "text/html")
            email.send()
            
            print(f"Confirmation email sent to {survey_response.email}")
            return True
            
        except Exception as e:
            print(f"Failed to send email to {survey_response.email}: {str(e)}")
            return False

    @staticmethod
    def send_admin_notification(survey_response):
        """
        Send notification to admin about new survey submission
        """
        try:
            subject = f"New Survey Submission - {survey_response.index_number}"
            
            context = {
                'index_number': survey_response.index_number,
                'email': survey_response.email,
                'selected_option': survey_response.selected_option,
                'submission_date': survey_response.submitted_at.strftime("%B %d, %Y at %H:%M"),
            }
            
            html_content = render_to_string('emails/admin_notification.html', context)
            text_content = strip_tags(html_content)
            
            email = EmailMultiAlternatives(
                subject=subject,
                body=text_content,
                from_email=None,
                to=['mmesa8134@gmail.com'],  # MMESA admin email
            )
            
            email.attach_alternative(html_content, "text/html")
            email.send()
            
            print("Admin notification sent")
            return True
            
        except Exception as e:
            print(f"Failed to send admin notification: {str(e)}")
            return False
from django.db import models 

class SurveyResponse(models.Model):
    email = models.EmailField()
    email_sent = models.BooleanField(default=False)
    email_sent_at = models.DateTimeField(null=True, blank=True)
    index_number = models.CharField(max_length=20)
    year_of_study = models.CharField(max_length=10, choices=[
        ('Year 2', 'Year 2'),
        ('Year 3', 'Year 3'), 
        ('Year 4', 'Year 4')
    ])
    phone_number = models.CharField(max_length=15)
    
    OPTION_CHOICES = [
        ('Option 1', 'Option 1: Only 2 major modules'),
        ('Option 2', 'Option 2: 1 major module + 2 sub-modules'),
        ('Option 3', 'Option 3: 4 sub-modules only'),
    ]
    selected_option = models.CharField(max_length=10, choices=OPTION_CHOICES)
    
    # Module selections (store as JSON for flexibility)
    category1_selections = models.JSONField(default=list)
    category2_selections = models.JSONField(default=list)
    category3_selections = models.JSONField(default=list)
    category4_selections = models.JSONField(default=list)
    category5_selections = models.JSONField(default=list)
    category6_selections = models.JSONField(default=list)
    category7_selections = models.JSONField(default=list)
    
    # Engineering software selections
    software_selections = models.JSONField(default=list)
    
    additional_courses = models.TextField(blank=True)
    submitted_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.email} - {self.selected_option}"

class SurveyResponseDetail(models.Model):
    survey_response = models.OneToOneField(SurveyResponse, on_delete=models.CASCADE, related_name='detail')
    # Add any additional fields specific to response details here
    
    def __str__(self):
        return f"Detail for {self.survey_response.email}"


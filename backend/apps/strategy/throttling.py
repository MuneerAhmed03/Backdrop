from rest_framework.throttling import AnonRateThrottle, UserRateThrottle

class TemplateReadRateThrottle(AnonRateThrottle):
    rate = '1000/minute'
    scope = 'template_read' 
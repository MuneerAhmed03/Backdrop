from rest_framework.throttling import AnonRateThrottle, UserRateThrottle

class TemplateReadRateThrottle(AnonRateThrottle):
    rate = '1000/day'
    scope = 'template_read' 
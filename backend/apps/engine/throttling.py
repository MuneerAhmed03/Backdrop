from rest_framework.throttling import AnonRateThrottle, UserRateThrottle, SimpleRateThrottle

class CodeExecutionRateThrottle(SimpleRateThrottle):
    rate = '1/minute'
    scope = 'code_execution'

    def get_cache_key(self, request, view):
        if request.user.is_authenticated:
            ident = request.user.pk
        else:
            ident = self.get_ident(request)
        return self.cache_format % {
            'scope': self.scope,
            'ident': ident
        }

class HealthCheckRateThrottle(AnonRateThrottle):
    rate = '1000/hour'
    scope = 'health_check'

class TaskResultRateThrottle(AnonRateThrottle):
    rate = '30/minute'
    scope = 'task_result' 
from threading import current_thread

class LocationMiddleware:
    """
    Middleware to set database location based on session
    """
    
    def __init__(self, get_response):
        self.get_response = get_response
    
    def __call__(self, request):
        # Get location from session (set during login)
        location = request.session.get('db_location', 'default')
        
        # Store in thread-local for router access
        thread = current_thread()
        thread.db_location = location
        
        # Also store in request for easy access in views
        request.db_location = location
        
        response = self.get_response(request)
        return response
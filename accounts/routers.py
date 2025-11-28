class LocationRouter:
    """
    Routes database operations based on session location (kolkata/rajasthan)
    """
    
    # Apps that should ONLY exist in 'default' database
    AUTH_APPS = {'auth', 'contenttypes', 'sessions', 'admin', 'authtoken'}
    
    def db_for_read(self, model, **hints):
        """Route read operations"""
        # Auth-related apps always use 'default'
        if model._meta.app_label in self.AUTH_APPS:
            return 'default'
        
        # Business data uses location from thread-local
        location = self._get_location()
        return location if location else 'default'
    
    def db_for_write(self, model, **hints):
        """Route write operations"""
        # Auth-related apps always use 'default'
        if model._meta.app_label in self.AUTH_APPS:
            return 'default'
        
        # Business data uses location from thread-local
        location = self._get_location()
        return location if location else 'default'
    
    def allow_relation(self, obj1, obj2, **hints):
        """Allow relations if both objects are in the same database"""
        # Always allow relations within auth apps
        if obj1._meta.app_label in self.AUTH_APPS and obj2._meta.app_label in self.AUTH_APPS:
            return True
        
        # Allow relations if same database
        db1 = obj1._state.db
        db2 = obj2._state.db
        if db1 and db2:
            return db1 == db2
        return None
    
    def allow_migrate(self, db, app_label, model_name=None, **hints):
        """
        Ensure auth/admin/session apps ONLY migrate to 'default'
        Business apps (accounts) migrate to ALL databases
        """
        # Auth apps ONLY in 'default'
        if app_label in self.AUTH_APPS:
            return db == 'default'
        
        # Business apps (accounts) in ALL databases
        if app_label == 'accounts':
            return True
        
        # Block everything else
        return None
    
    def _get_location(self):
        """Get location from thread-local storage"""
        from threading import current_thread
        thread = current_thread()
        return getattr(thread, 'db_location', 'default')
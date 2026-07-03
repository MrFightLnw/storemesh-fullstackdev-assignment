from rest_framework import permissions

class IsSeller(permissions.BasePermission):
    def has_permission(self, request, view):
        # Check if the user is authenticated and has the 'seller' role
        return (
            request.user and 
            request.user.is_authenticated and 
            getattr(request.user.profile, 'role', None) == 'seller'
        )
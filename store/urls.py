from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import RegisterView, UserProfileView, ProductListCreateView, ProductDetailView, MockPurchaseView

urlpatterns = [
    path('auth/register/', RegisterView.as_view(), name='auth_register'),
    
    path('auth/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    path('auth/profile/', UserProfileView.as_view(), name='user_profile'),

    path('products/', ProductListCreateView.as_view(), name='product_list_create'),

    path('products/<int:pk>/', ProductDetailView.as_view(), name='product_detail'),

    path('products/<int:pk>/purchase/', MockPurchaseView.as_view(), name='mock_purchase'),
]
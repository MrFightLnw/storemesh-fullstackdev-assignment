from django.shortcuts import render

from rest_framework import status, generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth.models import User
from .serializers import RegisterSerializer, UserSerializer

# API view for user registration, allowing new users to sign up with a role selection (Buyer/Seller)
class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (permissions.AllowAny,) # Allowing anyone to register without authentication
    serializer_class = RegisterSerializer

# API view for retrieving user profile information, requiring authentication
class UserProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated] # Needed to be logged in to access user profile information

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)
    
from .models import Product, Order, OrderItem
from .serializers import ProductSerializer
from .permissions import IsSeller

# API view for listing all products and creating new products, with different permissions based on the request method
# - Buyer GET (Marketplace Browsing)
# - Seller POST (Product Listing)
class ProductListCreateView(generics.ListCreateAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer

    def get_permissions(self):
        if self.request.method == 'GET':
            return [permissions.AllowAny()]
        return [IsSeller()]

    def perform_create(self, serializer):
        serializer.save(seller=self.request.user)


# API view for retrieving, updating, and deleting a specific product, with different permissions based on the request method
class ProductDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer

    def get_permissions(self):
        if self.request.method == 'GET':
            return [permissions.AllowAny()]
        return [IsSeller()]


# API view for handling mock purchases, allowing authenticated users to buy products and manage inventory
class MockPurchaseView(APIView):
    permission_classes = [permissions.IsAuthenticated] # Login required to make a purchase

    def post(self, request, pk):
        try:
            product = Product.objects.get(pk=pk)
        except Product.DoesNotExist:
            return Response({"detail": "ไม่พบสินค้านี้ในระบบ"}, status=status.HTTP_404_NOT_FOUND)

        # Get the quantity to buy from the request data, defaulting to 1 if not provided
        quantity_to_buy = int(request.data.get('quantity', 1))

        # Check if the requested quantity is available in stock
        if product.product_qty < quantity_to_buy:
            return Response({"detail": "สินค้าในสต๊อกไม่เพียงพอ"}, status=status.HTTP_400_BAD_REQUEST)

        # Deduct the purchased quantity from the product's stock and save the updated product
        product.product_qty -= quantity_to_buy
        product.save()

        # Create an order and order item to record the purchase, linking it to the buyer and the product
        order = Order.objects.create(buyer=request.user, total_price=product.product_price * quantity_to_buy)
        OrderItem.objects.create(
            order=order,
            product=product,
            quantity=quantity_to_buy,
            price=product.product_price
        )

        return Response({
            "message": "Purchase successful!",
            "remaining_qty": product.product_qty
        }, status=status.HTTP_200_OK)
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth.models import User
from .models import Product

class ProductAPITests(APITestCase):

    def setUp(self):
        # Create Buyer tester
        self.user = User.objects.create_user(username='buyer_test', password='password123')
        self.client.force_authenticate(user=self.user)
        
        # Create a product for testing
        self.product = Product.objects.create(
            product_name="Test Product",
            product_desc="Description",
            product_price=100.00,
            product_qty=10,          
            seller_id=self.user.id
        )
        
        self.purchase_url = reverse('mock_purchase', args=[self.product.id])

    def test_purchase_reduces_stock_successfully(self):
        """Test that purchasing a product reduces the stock quantity correctly."""
        data = {'quantity': 3}  
        response = self.client.post(self.purchase_url, data, format='json')
        
        # Check successful response
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Check that the product quantity has been reduced by 3
        self.product.refresh_from_db()
        self.assertEqual(self.product.product_qty, 7)

    def test_purchase_fails_when_insufficient_stock(self):
        """Test that purchasing a product fails when the requested quantity exceeds available stock."""
        data = {'quantity': 15}  
        response = self.client.post(self.purchase_url, data, format='json')
        
        # Check bad request response due to insufficient stock
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        
        # Check that the product quantity has not been reduced
        self.product.refresh_from_db()
        self.assertEqual(self.product.product_qty, 10)
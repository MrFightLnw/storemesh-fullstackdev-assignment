from django.db import models
from django.contrib.auth.models import User

class Role(models.TextChoices):
    SELLER = 'seller', 'Seller'
    BUYER = 'buyer', 'Buyer'

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    role = models.CharField(max_length=10, choices=Role.choices, default=Role.BUYER)

    def __str__(self):
        return f"{self.user.username} - {self.role}"

class Product(models.Model):
    product_name = models.CharField(max_length=255)
    product_desc = models.TextField()
    product_price = models.DecimalField(max_digits=10, decimal_places=2) 
    product_qty = models.IntegerField()
    product_img = models.ImageField(upload_to='products/') 
    seller = models.ForeignKey(User, on_delete=models.CASCADE, related_name='products') # For SELLER user

    def __str__(self):
        return self.product_name

class Order(models.Model):
    buyer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='orders') # For BUYER user
    total_price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    order_created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Order #{self.id} by {self.buyer.username}"

class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True) # Prevent deletion of product from order history
    quantity = models.IntegerField()
    price = models.DecimalField(max_digits=10, decimal_places=2) # Store the price at the time of order to avoid issues with price changes

    def __str__(self):
        return f"{self.quantity} x {self.product.product_name if self.product else 'Unknown Product'}"
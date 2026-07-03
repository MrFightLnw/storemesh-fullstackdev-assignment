from rest_framework import serializers
from django.contrib.auth.models import User
from .models import UserProfile, Role

# For serializing the User model along with the associated role from UserProfile
class UserSerializer(serializers.ModelSerializer):
    role = serializers.CharField(source='profile.role', read_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'role']

# RegisterSerializer for handling user registration with role selection
class RegisterSerializer(serializers.ModelSerializer):
    role = serializers.ChoiceField(choices=Role.choices, write_only=True)
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'password', 'email', 'role']

    def create(self, validated_data):
        # Role data is extracted from validated_data to create the UserProfile
        role_data = validated_data.pop('role')
        
        # Create User in the main Django table and automatically hash the Password
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password']
        )
        
        # Create a linked profile to store the role (Buyer/Seller)
        UserProfile.objects.create(user=user, role=role_data)
        return user
    
from .models import Product

class ProductSerializer(serializers.ModelSerializer):
    # Add a read-only field to display the seller's username in the serialized output
    seller_name = serializers.CharField(source='seller.username', read_only=True)

    class Meta:
        model = Product
        fields = ['id', 'product_name', 'product_desc', 'product_price', 'product_qty', 'product_img', 'seller', 'seller_name']
        read_only_fields = ['seller']
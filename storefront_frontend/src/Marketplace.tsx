import { useState, useEffect } from 'react';
import axios from 'axios';

interface Product {
  id: number;
  product_name: string;
  product_desc: string;
  product_price: string;
  product_qty: number;
  product_img: string;
  seller_name: string;
}

interface CartItem {
  product: Product;
  quantity: number;
}

export default function Marketplace() {
  // Set Products State
  const [products, setProducts] = useState<Product[]>([]);

  // Search State
  const [searchTerm, setSearchTerm] = useState(''); 

  // Modal State
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Cart State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const fetchProducts = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/products/');
      setProducts(response.data);
    } catch (error) {
      console.error('Cannot fetch products', error);
    }
  };

  // Fetch products when the component mounts
  useEffect(() => {
    fetchProducts();
  }, []);

  // Add to Cart Function
  const handleAddToCart = (product: Product) => {
    const exist = cart.find(item => item.product.id === product.id);
    
    if (exist) {
      // Check Quantity in stock before adding more to cart
      if (exist.quantity >= product.product_qty) {
        alert('Cannot add more of this product. Stock limit reached.');
        return;
      }
      setCart(cart.map(item => item.product.id === product.id ? { ...exist, quantity: exist.quantity + 1 } : item));
    } else {
      setCart([...cart, { product, quantity: 1 }]);
    }
    
    alert(`"${product.product_name}" added to cart!`);
    setSelectedProduct(null); // Close modal
  };

  // Remove from Cart Function
  const handleRemoveFromCart = (productId: number) => {
    setCart(cart.filter(item => item.product.id !== productId));
  };

  // Checkout Function for all items in the cart
  const handleCheckout = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      alert('Please login before purchasing products');
      window.location.href = '/login';
      return;
    }

    if (cart.length === 0) return alert('There are no items in the cart to checkout');

    try {
      for (const item of cart) {
        await axios.post(
          `http://127.0.0.1:8000/api/products/${item.product.id}/purchase/`,
          { quantity: item.quantity },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      
      alert('Successfully checked out all items in the cart!');
      setCart([]); // Clear the cart after successful checkout
      fetchProducts(); // Refresh the product list to show updated stock
    } catch (error: any) {
      alert('Failed to checkout: ' + (error.response?.data?.detail || 'An error occurred'));
    }
  };

  // Calculate total price of items in the cart
  const totalPrice = cart.reduce((sum, item) => sum + (parseFloat(item.product.product_price) * item.quantity), 0);
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Filter products based on the search term
  const filteredProducts = products.filter(product =>
    product.product_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <h2>Marketplace</h2>
      
      <div style={{display: 'flex', gap: '15px', alignItems: 'center', justifyContent:'center', marginTop:'15px',marginBottom: '25px', flexWrap: 'wrap'}}>
        <input 
          type="text" 
          placeholder="Search products..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ width: '100%', maxWidth: '400px', padding: '10px', fontSize: '16px', borderRadius: '4px', border: '1px solid #ccc' }}
        />
        <button 
          onClick={() => setIsCartOpen(true)}
          style={{background: '#ffc107', color: '#212529', border: 'none', padding: '10px 20px', borderRadius: '4px', 
            fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
            boxSizing: 'border-box'
          }}
        >
          <span>Shopping Cart</span>
          <span style={{ background: '#dc3545', color: 'white', borderRadius: '10px', padding: '2px 8px', fontSize: '12px' }}>{totalItems}</span>
        </button>
      </div>

      {/* Product Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
        {filteredProducts.map(product => (
          <div 
            key={product.id} 
            onClick={() => setSelectedProduct(product)} // Set selected product to show details in modal
            style={{ 
              border: '1px solid #ddd', 
              borderRadius: '8px', 
              padding: '15px', 
              boxShadow: '0 2px 4px rgba(0,0,0,0.05)', 
              cursor: 'pointer', // Set cursor to pointer to indicate it's clickable
              transition: '0.2s'
            }}
          >
            {/* Product Image */}
            {product.product_img && (
              <div style={{ width: '100%', height: '150px', overflow: 'hidden', borderRadius: '4px', marginBottom: '10px' }}>
                <img 
                  src={product.product_img.startsWith('http') ? product.product_img : `http://127.0.0.1:8000${product.product_img}`} 
                  alt={product.product_name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
            )}
            
            {/* Show only product name and price */}
            <h3 style={{ margin: '0 0 5px 0', fontSize: '16px' }}>{product.product_name}</h3>
            <p style={{ color: '#28a745', fontWeight: 'bold', margin: 0 }}>
              {parseFloat(product.product_price).toLocaleString()} THB
            </p>
            <small style={{ color: '#999', display: 'block', marginTop: '5px' }}>Click to view details</small>
          </div>
        ))}
      </div>

      {/* Cart Modal */}
      {isCartOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000, padding: '10px', boxSizing: 'border-box' }}>
          <div style={{ background: 'white', borderRadius: '12px', maxWidth: '450px', width: '100%', padding: '25px', position: 'relative', boxShadow: '0 4px 15px rgba(0,0,0,0.2)', boxSizing: 'border-box' }}>
            <button onClick={() => setIsCartOpen(false)} style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer' }}>❌</button>
            <h3 style={{ marginTop: 0, marginBottom: '20px' }}>Shopping Cart</h3>
            
            {cart.length === 0 ? (
              <p style={{ color: '#888', textAlign: 'center', margin: '20px 0' }}>Your cart is empty.</p>
            ) : (
              <div>
                <div style={{ maxHeight: '300px', overflowY: 'auto', marginBottom: '15px' }}>
                  {cart.map(item => (
                    <div key={item.product.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                      <div>
                        <h4 style={{ margin: '0 0 5px 0', fontSize: '14px' }}>{item.product.product_name}</h4>
                        <small style={{ color: '#666' }}>{item.quantity} ชิ้น x {parseFloat(item.product.product_price).toLocaleString()} THB</small>
                      </div>
                      <button onClick={() => handleRemoveFromCart(item.product.id)} style={{ background: 'none', border: 'none', color: '#dc3545', cursor: 'pointer', fontSize: '14px' }}>Remove</button>
                    </div>
                  ))}
                </div>
                <div style={{ fontWeight: 'bold', fontSize: '18px', display: 'flex', justifyContent: 'space-between', borderTop: '2px solid #ddd', paddingTop: '15px' }}>
                  <span>Total Price :</span>
                  <span style={{ color: '#28a745' }}>{totalPrice.toLocaleString()} THB</span>
                </div>
                <button onClick={handleCheckout} style={{ width: '100%', padding: '12px', marginTop: '15px', background: '#007bff', color: 'white', border: 'none', borderRadius: '6px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}>
                  Confirm & Purchase
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Product Detail Modal */}
      {selectedProduct && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '10px'
        }}>
          <div style={{
            background: 'white', padding: '30px', borderRadius: '12px', maxWidth: '500px', width: '100%', maxHeight: '90vh', overflowY: 'auto',
            boxShadow: '0 4px 15px rgba(0,0,0,0.2)', position: 'relative'
          }}>
            {/* Close Button Modal */}
            <button 
              onClick={() => setSelectedProduct(null)} 
              style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }}
            >
              ❌
            </button>

            {/* Product Image inside popup */}
            {selectedProduct.product_img && (
              <img 
                src={selectedProduct.product_img.startsWith('http') ? selectedProduct.product_img : `http://127.0.0.1:8000${selectedProduct.product_img}`} 
                alt={selectedProduct.product_name}
                style={{ maxWidth: '100%', maxHeight: '220px', objectFit: 'cover', borderRadius: '6px', marginBottom: '15px' }}
              />
            )}

            {/* Product Details */}
            <h2 style={{ color: '#555' }}>{selectedProduct.product_name}</h2>
            <p style={{ color: '#555', lineHeight: '2' }}><strong>Description :</strong> {selectedProduct.product_desc}</p>
            <p style={{ fontSize: '18px' }}><strong>Price :</strong> <span style={{ color: '#28a745', fontWeight: 'bold' }}>{parseFloat(selectedProduct.product_price).toLocaleString()}</span> บาท</p>
            <p><strong>In Stock :</strong> {selectedProduct.product_qty} ชิ้น</p>
            <p style={{ fontSize: '14px', color: '#888' }}>Seller : {selectedProduct.seller_name}</p>

            {/* Add to Cart Button */}
            <button 
              onClick={() => handleAddToCart(selectedProduct)}
              disabled={selectedProduct.product_qty <= 0}
              style={{ 
                width: '100%', padding: '12px', marginTop: '15px',
                background: selectedProduct.product_qty > 0 ? '#28a745' : '#ccc', 
                color: 'white', border: 'none', borderRadius: '6px', 
                fontSize: '16px', fontWeight: 'bold',
                cursor: selectedProduct.product_qty > 0 ? 'pointer' : 'not-allowed' 
              }}
            >
              {selectedProduct.product_qty > 0 ? 'Add to Cart' : 'Out of Stock'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
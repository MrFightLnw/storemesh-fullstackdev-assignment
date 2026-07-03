import { useState, useEffect } from 'react';
import axios from 'axios';

interface Product {
  id: number;
  product_name: string;
  product_desc: string;
  product_price: string;
  product_qty: number;
  product_img: string; 
}

export default function Seller() {
  const [products, setProducts] = useState<Product[]>([]);
  
  // State for the new product form
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [price, setPrice] = useState('');
  const [qty, setQty] = useState('');
  const [image, setImage] = useState<File | null>(null); 

  // State for editing a product
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editQty, setEditQty] = useState('');
  const [editImg, setEditImg] = useState<File | null>(null);

  const token = localStorage.getItem('access_token'); 

  const fetchMyProducts = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/products/');
      setProducts(response.data);
    } catch (error) {
      console.error('Failed to fetch products', error);
    }
  };

  useEffect(() => {
    fetchMyProducts();
  }, []);

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return alert('Please login to add products');

    const formData = new FormData();
    formData.append('product_name', name);
    formData.append('product_desc', desc);
    formData.append('product_price', price);
    formData.append('product_qty', qty);
    if (image) {
      formData.append('product_img', image); 
    }

    try {
      await axios.post('http://127.0.0.1:8000/api/products/', formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data' 
        }
      });
      alert('Product added successfully!');
      // Clear form data
      setName(''); setDesc(''); setPrice(''); setQty(''); setImage(null);
      fetchMyProducts(); // Refresh the product list
    } catch (error) {
      alert('Failed to add product. Please try again.');
    }
  };

  // Popup modal for editing product
  const handleOpenEditModal = (product: Product) => {
    setEditingProduct(product);
    setEditName(product.product_name);
    setEditDesc(product.product_desc);
    setEditPrice(product.product_price);
    setEditQty(product.product_qty.toString());
    setEditImg(null); 
  };

  // Function to handle updating the product from editing modal
  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    const formData = new FormData();
    formData.append('product_name', editName);
    formData.append('product_desc', editDesc);
    formData.append('product_price', editPrice);
    formData.append('product_qty', editQty);
    if (editImg) formData.append('product_img', editImg);

    try {
      await axios.patch(`http://127.0.0.1:8000/api/products/${editingProduct.id}/`, formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      alert('Product updated successfully!');
      setEditingProduct(null); 
      fetchMyProducts(); 
    } catch (error) {
      alert('Failed to update product. Please try again.');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this product?')) return;
    
    try {
      await axios.delete(`http://127.0.0.1:8000/api/products/${id}/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      alert('Product deleted successfully');
      fetchMyProducts();
    } catch (error) {
      alert('Failed to delete product');
    }
  };

  return (
    <div style={{ display: 'flex', gap: '40px' }}>

      {/* Add Product Form */}
      <div style={{ flex: 1, maxWidth: '400px', border: '1px solid #ddd', padding: '20px', borderRadius: '8px', boxSizing: 'border-box' }}>
        <h3>Add New Product</h3>
        <form onSubmit={handleCreateProduct}>
          <div style={{ marginBottom: '10px' }}>
            <label>Product Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required style={{ width: '100%', padding: '6px', boxSizing: 'border-box' }} />
          </div>
          <div style={{ marginBottom: '10px' }}>
            <label>Product Description</label>
            <textarea value={desc} onChange={(e) => setDesc(e.target.value)} required style={{ width: '100%', padding: '6px', boxSizing: 'border-box' }} />
          </div>
          <div style={{ marginBottom: '10px' }}>
            <label>Price (THB)</label>
            <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} required style={{ width: '100%', padding: '6px', boxSizing: 'border-box' }} />
          </div>
          <div style={{ marginBottom: '10px' }}>
            <label>Stock Quantity</label>
            <input type="number" value={qty} onChange={(e) => setQty(e.target.value)} required style={{ width: '100%', padding: '6px', boxSizing: 'border-box' }} />
          </div>
          <div style={{ marginBottom: '15px' }}>
            <label>Product Image</label>
            <input type="file" onChange={(e) => setImage(e.target.files ? e.target.files[0] : null)} style={{ width: '100%', marginTop: '5px', boxSizing: 'border-box' }} />
          </div>
          <button type="submit" style={{ width: '100%', padding: '10px', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            Add Product
          </button>
        </form>
      </div>

      {/* Product Management (Right Side) */}
      <div style={{ flex: 2 }}>
        <h3>Product Management</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', boxSizing: 'border-box' }}>
          <thead>
            <tr style={{ background: '#f5f5f5', borderBottom: '2px solid #ddd' }}>
              <th style={{ padding: '10px', textAlign: 'center', width: '80px' }}>Image</th>
              <th style={{ padding: '10px', textAlign: 'center' }}>Product Name</th>
              <th style={{ padding: '10px', textAlign: 'center' }}>Price</th>
              <th style={{ padding: '10px', textAlign: 'center' }}>Stock Quantity</th>
              <th style={{ padding: '10px', textAlign: 'center' }}>Management</th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => (
              <tr key={product.id} style={{ borderBottom: '1px solid #ddd' }}>
                <td style={{ padding: '10px' }}>
                  {product.product_img && (
                    <img 
                      src={product.product_img.startsWith('http') ? product.product_img : `http://127.0.0.1:8000${product.product_img}`} 
                      alt="" 
                      style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }}
                    />
                  )}
                </td>
                <td style={{ padding: '10px' }}>{product.product_name}</td>
                <td style={{ padding: '10px' }}>{parseFloat(product.product_price).toLocaleString()} THB</td>
                <td style={{ padding: '10px' }}>{product.product_qty} units</td>
                <td style={{ padding: '10px', textAlign: 'center' }}>
                  <button onClick={() => handleOpenEditModal(product)} style={{ padding: '4px 8px', background: '#ffc107', color: '#212529', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer'}}>Edit</button><br></br>
                  <button onClick={() => handleDelete(product.id)} style={{ padding: '4px 8px', background: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Product Modal */}
      {editingProduct && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000, padding: '10px', boxSizing: 'border-box' }}>
          <div style={{ background: 'white', borderRadius: '12px', maxWidth: '450px', width: '100%', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 4px 15px rgba(0,0,0,0.2)', position: 'relative', padding: '25px', boxSizing: 'border-box' }}>
            <button onClick={() => setEditingProduct(null)} style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer' }}>❌</button>
            
            <h3 style={{ marginTop: 0, marginBottom: '20px' }}>Edit Product: {editingProduct.product_name}</h3>
            
            <form onSubmit={handleUpdateProduct}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ fontSize: '14px', fontWeight: 'bold' }}>Product Name</label>
                <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} required style={{ width: '100%', padding: '8px', marginTop: '5px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
              </div>
              
              <div style={{ marginBottom: '12px' }}>
                <label style={{ fontSize: '14px', fontWeight: 'bold' }}>Product Description</label>
                <textarea value={editDesc} onChange={(e) => setEditDesc(e.target.value)} required style={{ width: '100%', padding: '8px', marginTop: '5px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box', minHeight: '80px', fontFamily: 'sans-serif' }} />
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ fontSize: '14px', fontWeight: 'bold' }}>Price (THB)</label>
                <input type="number" value={editPrice} onChange={(e) => setEditPrice(e.target.value)} required style={{ width: '100%', padding: '8px', marginTop: '5px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ fontSize: '14px', fontWeight: 'bold' }}>Stock Quantity</label>
                <input type="number" value={editQty} onChange={(e) => setEditQty(e.target.value)} required style={{ width: '100%', padding: '8px', marginTop: '5px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: 'bold' }}>Product Image (Leave blank to keep current)</label>
                <input type="file" onChange={(e) => setEditImg(e.target.files ? e.target.files[0] : null)} style={{ width: '100%', boxSizing: 'border-box' }} />
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="submit" style={{ flex: 1, padding: '10px', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>Save Changes</button>
                <button type="button" onClick={() => setEditingProduct(null)} style={{ flex: 1, padding: '10px', background: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
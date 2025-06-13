import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiDownload, FiArrowLeft, FiPackage, FiTruck, FiCheck, FiClock, FiCalendar, FiFileText, FiShoppingBag, FiMapPin } from 'react-icons/fi';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const OrderDetails = () => {
  const { orderId } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [order, setOrder] = useState(null);
  const [allOrders, setAllOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [sortOrder, setSortOrder] = useState('newest');
  
  useEffect(() => {
    // Load all orders from localStorage
    const loadOrders = () => {
      try {
        setLoading(true);
        const storedOrders = JSON.parse(localStorage.getItem('orders') || '[]');
        
        // Filter orders for current user
        const userOrders = currentUser 
          ? storedOrders.filter(order => order.userId === currentUser._id)
          : storedOrders;
        
        setAllOrders(userOrders);
        
        // Find the current order
        if (orderId) {
          const currentOrder = userOrders.find(o => o._id === orderId);
          if (currentOrder) {
            setOrder(currentOrder);
          } else {
            // Redirect if order not found
            navigate('/profile');
          }
        } else if (userOrders.length > 0) {
          // Display most recent order if no ID specified
          setOrder(userOrders[0]);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error loading orders:', error);
        setLoading(false);
      }
    };
    
    loadOrders();
  }, [orderId, currentUser, navigate]);
  
  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  // Sort orders based on sort option
  const sortedOrders = [...allOrders].sort((a, b) => {
    if (sortOrder === 'newest') {
      return new Date(b.createdAt) - new Date(a.createdAt);
    } else {
      return new Date(a.createdAt) - new Date(b.createdAt);
    }
  });
  
  // Estimated delivery date (7 days from order date)
  const getEstimatedDelivery = (orderDate) => {
    const deliveryDate = new Date(orderDate);
    deliveryDate.setDate(deliveryDate.getDate() + 7);
    return deliveryDate;
  };
  
  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'Processing':
        return 'text-blue-600 bg-blue-100';
      case 'Shipped':
        return 'text-purple-600 bg-purple-100';
      case 'Delivered':
        return 'text-green-600 bg-green-100';
      case 'Cancelled':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };
  
  // Generate PDF receipt
  const generateReceipt = () => {
    if (!order) {
      alert('Order information is missing. Please try again later.');
      return;
    }
    
    setGenerating(true);
    
    try {
      const doc = new jsPDF();
      
      // Add logo and header
      doc.setFontSize(20);
      doc.setTextColor(0, 0, 128);
      doc.text('WorldOfBooks', 105, 20, { align: 'center' });
      
      doc.setFontSize(16);
      doc.setTextColor(0, 0, 0);
      doc.text('Order Receipt', 105, 30, { align: 'center' });
      
      // Add order info
      doc.setFontSize(12);
      doc.text(`Order #: ${order._id || 'N/A'}`, 14, 45);
      doc.text(`Date: ${order.createdAt ? formatDate(order.createdAt) : 'N/A'}`, 14, 52);
      doc.text(`Status: ${order.status || 'Processing'}`, 14, 59);
      
      // Add customer info with null/undefined checks
      doc.setFontSize(14);
      doc.text('Customer Information', 14, 75);
      doc.setFontSize(12);
      
      // Check if shipping info exists
      if (order.shippingInfo) {
        const firstName = order.shippingInfo.firstName || '';
        const lastName = order.shippingInfo.lastName || '';
        doc.text(`${firstName} ${lastName}`, 14, 82);
        doc.text(order.shippingInfo.address || 'N/A', 14, 89);
        
        const city = order.shippingInfo.city || '';
        const state = order.shippingInfo.state || '';
        const zipCode = order.shippingInfo.zipCode || '';
        doc.text(`${city}, ${state} ${zipCode}`, 14, 96);
        
        doc.text(`Phone: ${order.shippingInfo.phone || 'N/A'}`, 14, 103);
      } else {
        doc.text('Shipping information not available', 14, 82);
      }
      
      // Add order items table
      doc.setFontSize(14);
      doc.text('Order Items', 14, 120);
      
      const tableColumn = ["Item", "Qty", "Price", "Total"];
      const tableRows = [];
      
      // Add rows for each item with proper error handling
      if (order.items && Array.isArray(order.items) && order.items.length > 0) {
        order.items.forEach(item => {
          if (item && item.book) {
            const title = item.book.title || 'Unknown Item';
            const displayTitle = title.substring(0, 30) + (title.length > 30 ? '...' : '');
            const quantity = item.quantity || 1;
            const price = item.book.discountPrice || item.book.price || 0;
            
            const itemData = [
              displayTitle,
              quantity,
              `$${parseFloat(price).toFixed(2)}`,
              `$${(parseFloat(price) * quantity).toFixed(2)}`
            ];
            tableRows.push(itemData);
          }
        });
      }
      
      doc.autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: 125,
        theme: 'striped',
        headStyles: { fillColor: [0, 0, 128] }
      });
      
      // Add total information with safe calculations
      const finalY = (doc.lastAutoTable && doc.lastAutoTable.finalY) 
        ? doc.lastAutoTable.finalY + 10 
        : 200;
      
      const totalAmount = parseFloat(order.totalAmount || 0);
      const shipping = 5.99;
      const tax = totalAmount * 0.08;
      const total = totalAmount + shipping + tax;
      
      doc.text(`Subtotal: $${totalAmount.toFixed(2)}`, 140, finalY);
      doc.text(`Shipping: $${shipping.toFixed(2)}`, 140, finalY + 7);
      doc.text(`Tax: $${tax.toFixed(2)}`, 140, finalY + 14);
      
      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      doc.text(`Total: $${total.toFixed(2)}`, 140, finalY + 25);
      
      // Add footer
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      doc.setTextColor(100, 100, 100);
      doc.text('Thank you for shopping with WorldOfBooks!', 105, 280, { align: 'center' });
      
      // Save the PDF
      doc.save(`WorldOfBooks-Receipt-${order._id || 'order'}.pdf`);
    } catch (error) {
      console.error('Error generating receipt:', error);
      alert('Failed to generate receipt: ' + (error.message || 'Unknown error. Please try again.'));
    } finally {
      setGenerating(false);
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center py-12">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="ml-3 text-gray-600">Loading order details...</span>
        </div>
        <Footer />
      </div>
    );
  }
  
  if (!order) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center py-12">
          <div className="text-center p-8 max-w-md">
            <FiShoppingBag className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">No orders found</h3>
            <p className="mt-1 text-sm text-gray-500">
              You haven't placed any orders yet.
            </p>
            <div className="mt-6">
              <Link
                to="/books"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
              >
                Start shopping
              </Link>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <div className="flex-grow container-custom py-8">
        <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold text-gray-900">
              Order Details
            </h1>
            <p className="text-gray-600">
              View the details of your order and track its status.
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex items-center">
            <Link 
              to="/profile"
              className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800"
            >
              <FiArrowLeft className="mr-1" />
              Back to Profile
            </Link>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order History Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Order History</h2>
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="text-sm border border-gray-300 rounded-md p-1"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                </select>
              </div>
              
              {sortedOrders.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-gray-500">No order history available.</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                  {sortedOrders.map((historyOrder) => (
                    <div 
                      key={historyOrder._id}
                      className={`border rounded-md p-4 transition-shadow cursor-pointer hover:shadow-md ${
                        historyOrder._id === order._id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                      }`}
                      onClick={() => navigate(`/orders/${historyOrder._id}`)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-gray-900">Order #{historyOrder._id.slice(-6)}</p>
                          <p className="text-sm text-gray-600">{formatDate(historyOrder.createdAt)}</p>
                        </div>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(historyOrder.status)}`}>
                          {historyOrder.status}
                        </span>
                      </div>
                      <div className="mt-2">
                        <p className="text-sm text-gray-700">
                          {historyOrder.items?.length || 0} item{historyOrder.items?.length !== 1 ? 's' : ''}
                        </p>
                        <p className="text-sm font-medium text-gray-900 mt-1">
                          ${historyOrder.totalAmount?.toFixed(2) || '0.00'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {/* Order Details Main Content */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Order Status */}
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <h2 className="text-lg font-semibold text-gray-900">Order Status</h2>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                  
                  <div className="mt-6">
                    <div className="relative">
                      <div className="overflow-hidden h-2 mb-6 text-xs flex rounded bg-gray-200">
                        <div 
                          style={{ 
                            width: order.status === 'Processing' ? '33%' : 
                                  order.status === 'Shipped' ? '66%' : 
                                  order.status === 'Delivered' ? '100%' : '0%' 
                          }} 
                          className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-600"
                        ></div>
                      </div>
                      <div className="flex text-sm font-medium text-gray-600 justify-between">
                        <div className="text-center">
                          <div className={`w-8 h-8 mx-auto flex items-center justify-center rounded-full ${
                            ['Processing', 'Shipped', 'Delivered'].includes(order.status) 
                              ? 'bg-blue-600 text-white' 
                              : 'bg-gray-200 text-gray-500'
                          }`}>
                            {['Processing', 'Shipped', 'Delivered'].includes(order.status) ? <FiCheck /> : '1'}
                          </div>
                          <p className="mt-1">Processing</p>
                        </div>
                        <div className="text-center">
                          <div className={`w-8 h-8 mx-auto flex items-center justify-center rounded-full ${
                            ['Shipped', 'Delivered'].includes(order.status) 
                              ? 'bg-blue-600 text-white' 
                              : 'bg-gray-200 text-gray-500'
                          }`}>
                            {['Shipped', 'Delivered'].includes(order.status) ? <FiCheck /> : '2'}
                          </div>
                          <p className="mt-1">Shipped</p>
                        </div>
                        <div className="text-center">
                          <div className={`w-8 h-8 mx-auto flex items-center justify-center rounded-full ${
                            order.status === 'Delivered' 
                              ? 'bg-blue-600 text-white' 
                              : 'bg-gray-200 text-gray-500'
                          }`}>
                            {order.status === 'Delivered' ? <FiCheck /> : '3'}
                          </div>
                          <p className="mt-1">Delivered</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="p-6 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <FiClock className="text-blue-600 mr-2" />
                      <span className="text-sm text-gray-600">Ordered on {formatDate(order.createdAt)}</span>
                    </div>
                    <div className="flex items-center">
                      <FiCalendar className="text-blue-600 mr-2" />
                      <span className="text-sm text-gray-600">
                        Estimated delivery by {formatDate(getEstimatedDelivery(order.createdAt))}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Order Information */}
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-semibold text-gray-900">Order Information</h2>
                    <button
                      onClick={generateReceipt}
                      disabled={generating}
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
                    >
                      {generating ? (
                        <>
                          <div className="mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Generating...
                        </>
                      ) : (
                        <>
                          <FiDownload className="mr-2" />
                          Download Receipt
                        </>
                      )}
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 mb-6">
                    <div>
                      <p className="text-sm text-gray-600">Order Number:</p>
                      <p className="font-medium">{order._id}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Order Date:</p>
                      <p className="font-medium">{formatDate(order.createdAt)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Status:</p>
                      <p className="font-medium">{order.status}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Estimated Delivery:</p>
                      <p className="font-medium">{formatDate(getEstimatedDelivery(order.createdAt))}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-md font-semibold text-gray-900 mb-2">
                        <FiMapPin className="inline mr-2 text-blue-600" />
                        Shipping Address
                      </h3>
                      <div className="bg-gray-50 p-4 rounded">
                        <p className="font-medium">{order.shippingInfo.firstName} {order.shippingInfo.lastName}</p>
                        <p>{order.shippingInfo.address}</p>
                        <p>{order.shippingInfo.city}, {order.shippingInfo.state} {order.shippingInfo.zipCode}</p>
                        <p>{order.shippingInfo.phone}</p>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-md font-semibold text-gray-900 mb-2">
                        <FiFileText className="inline mr-2 text-blue-600" />
                        Payment Information
                      </h3>
                      <div className="bg-gray-50 p-4 rounded">
                        <p className="flex justify-between">
                          <span>Payment Method:</span>
                          <span>Credit Card ending in {order.paymentInfo?.cardLast4 || '****'}</span>
                        </p>
                        <p className="flex justify-between mt-2">
                          <span>Subtotal:</span>
                          <span>${order.totalAmount?.toFixed(2) || '0.00'}</span>
                        </p>
                        <p className="flex justify-between">
                          <span>Shipping:</span>
                          <span>$5.99</span>
                        </p>
                        <p className="flex justify-between">
                          <span>Tax:</span>
                          <span>${(order.totalAmount * 0.08).toFixed(2)}</span>
                        </p>
                        <p className="flex justify-between font-bold mt-2 text-lg">
                          <span>Total:</span>
                          <span>${(order.totalAmount + 5.99 + (order.totalAmount * 0.08)).toFixed(2)}</span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Order Items */}
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-6">Order Items</h2>
                  
                  {order.items && order.items.length > 0 ? (
                    <div className="space-y-4">
                      {order.items.map((item) => (
                        <div key={item.book._id} className="flex border-b border-gray-100 pb-4">
                          <div className="w-20 h-24 flex-shrink-0 overflow-hidden rounded">
                            {item.book.coverImage ? (
                              <img 
                                src={item.book.coverImage} 
                                alt={item.book.title} 
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = 'https://via.placeholder.com/80x120?text=No+Image';
                                }}
                              />
                            ) : (
                              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                <span className="text-gray-500 text-xs text-center px-2">No Image</span>
                              </div>
                            )}
                          </div>
                          <div className="ml-4 flex-grow">
                            <h3 className="font-semibold text-gray-900">{item.book.title}</h3>
                            <p className="text-sm text-gray-600">by {item.book.author}</p>
                            <div className="flex justify-between mt-2">
                              <p className="text-sm">Qty: {item.quantity}</p>
                              <p className="font-medium">
                                ${((item.book.discountPrice || item.book.price) * item.quantity).toFixed(2)}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-600">No items in this order.</p>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default OrderDetails; 
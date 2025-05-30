// src/pages/AdminDashboard.tsx

import { useState, useEffect, useCallback } from "react";
import Head from "@/components/Head";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { formatPrice } from "@/lib/utils";
import { Loader2, Search, Filter } from "lucide-react";
import { cn } from "@/lib/utils";
import io from 'socket.io-client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

// Define the structure of an order as it comes from your backend/Supabase
interface Order {
  id: string; // Supabase UUID
  order_id: string; // Your custom ADH-timestamp ID
  customer_info: {
    fullName: string;
    email: string;
    address: string;
    city: string;
    state: string;
    postalCode: string;
    phoneNumber: string;
    // Add deliveryNotes here if you store them in customer_info
    // deliveryNotes?: string;
  };
  ordered_items: Array<{
    product: {
      id: string;
      name: string;
      image: string;
      pricePerWeight: { [key: string]: number };
    };
    weight: string; // '100', '250', '500', '1000'
    quantity: number;
    unitPrice?: number; // Add unitPrice here if your backend also stores it directly on the item
  }> | null; // IMPORTANT: Allow ordered_items to be null to prevent crashes
  subtotal: number;
  discount_amount: number;
  taxes: number;
  shipping_cost: number;
  additional_fees: number;
  total_amount: number;
  payment_method: 'cod' | 'razorpay';
  payment_id?: string;
  applied_coupon?: {
    code: string;
    discountPercent: number;
  };
  order_status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'; // Added 'refunded'
  created_at: string;
  updated_at: string;
  // Add an optional field for order history if your backend provides it
  // history?: Array<{ status: Order['order_status']; timestamp: string; changedBy?: string }>;
}

const ADMIN_API_KEY_STORAGE_KEY = 'adhyaa_admin_api_key';

export default function AdminDashboard() {
  const initialAdminKey = localStorage.getItem(ADMIN_API_KEY_STORAGE_KEY) || '';
  const [adminKey, setAdminKey] = useState<string>(initialAdminKey);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!initialAdminKey);

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<Order['order_status'] | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [loginError, setLoginError] = useState<string | null>(null);

  // State for Order Details Modal
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<boolean>(false); // For single order status update
  const [isRefunding, setIsRefunding] = useState<boolean>(false); // For refund action
  const [isCancelling, setIsCancelling] = useState<boolean>(false); // For cancel action

  // State for Bulk Actions
  const [selectedOrderIds, setSelectedOrderIds] = useState<Set<string>>(new Set());
  const [isBulkProcessing, setIsBulkProcessing] = useState<boolean>(false); // For all bulk status updates

  const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  // Handle admin logout
  const handleLogout = useCallback(() => {
    setIsAuthenticated(false);
    setAdminKey('');
    setOrders([]);
    localStorage.removeItem(ADMIN_API_KEY_STORAGE_KEY);
    toast.info('Logged out from admin dashboard.');
  }, []);

  // Memoized function to fetch orders from the backend
  const fetchOrders = useCallback(async () => {
    if (!isAuthenticated) {
      setOrders([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams();
      if (filterStatus !== 'all') {
        queryParams.append('status', filterStatus);
      }
      if (searchTerm) {
        queryParams.append('search', searchTerm);
      }

      const response = await fetch(`${backendUrl}/api/admin/orders?${queryParams.toString()}`, {
        headers: {
          'X-Admin-API-Key': adminKey,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 401) {
          toast.error('Session expired or Invalid Admin API Key. Please log in again.');
          handleLogout();
          return;
        }
        throw new Error(errorData.message || 'Failed to fetch orders.');
      }

      const data: Order[] = await response.json();
      console.log("Fetched Orders Data:", JSON.stringify(data, null, 2));
      setOrders(data);
    } catch (err: any) {
      console.error("Error fetching orders:", err);
      setError(err.message || 'An unexpected error occurred while fetching orders.');
      toast.error(err.message || 'Failed to load orders.');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, filterStatus, searchTerm, adminKey, backendUrl, handleLogout]);

  // --- Main useEffect for initial fetch and WebSocket listener ---
  useEffect(() => {
    fetchOrders();

    let socket: ReturnType<typeof io> | undefined;
    if (isAuthenticated) {
      console.log(`Attempting to connect to WebSocket at: ${backendUrl}`);
      socket = io(backendUrl);

      socket.on('connect', () => {
        console.log('Connected to WebSocket server');
      });

      socket.on('disconnect', () => {
        console.log('Disconnected from WebSocket server');
      });

      socket.on('connect_error', (err) => {
        console.error('WebSocket connection error:', err.message);
        toast.error('Failed to connect to real-time updates. Check backend.');
      });

      socket.on('newOrder', (newOrder: Order) => {
        console.log('New order received via WebSocket:', newOrder);
        setOrders((prevOrders) => [newOrder, ...prevOrders]);
        toast.success(`🎉 New Order! #${newOrder.order_id}`);
      });

      socket.on('orderUpdated', (updatedOrder: Order) => {
        console.log('Order updated via WebSocket:', updatedOrder);
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order.id === updatedOrder.id ? updatedOrder : order
          )
        );
        toast.info(`Order #${updatedOrder.order_id} status changed to ${updatedOrder.order_status}`);
        // If the updated order is the one currently in the modal, update it
        if (selectedOrder && selectedOrder.id === updatedOrder.id) {
          setSelectedOrder(updatedOrder);
        }
      });
    }

    return () => {
      if (socket) {
        console.log('Disconnecting from WebSocket server...');
        socket.disconnect();
      }
    };
  }, [isAuthenticated, fetchOrders, backendUrl, selectedOrder]);

  // Handle admin login
  const handleLogin = async () => {
    setLoginError(null);
    if (!adminKey.trim()) {
      setLoginError('Admin API Key cannot be empty.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${backendUrl}/api/admin/orders`, {
        headers: {
          'X-Admin-API-Key': adminKey,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Invalid Admin API Key.');
      }

      localStorage.setItem(ADMIN_API_KEY_STORAGE_KEY, adminKey);
      setIsAuthenticated(true);
      toast.success('Admin login successful!');
    } catch (err: any) {
      console.error("Login error:", err);
      setLoginError(err.message || 'Login failed. Please check your API Key.');
      toast.error(err.message || 'Admin login failed.');
      setIsAuthenticated(false);
      localStorage.removeItem(ADMIN_API_KEY_STORAGE_KEY);
    } finally {
      setLoading(false);
    }
  };

  // Handle single order status update
  const handleUpdateStatus = async (orderId: string, newStatus: Order['order_status']) => {
    setIsUpdatingStatus(true);
    setError(null);
    try {
      const response = await fetch(`${backendUrl}/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-API-Key': adminKey,
        },
        body: JSON.stringify({ newStatus }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update order status.');
      }

      const updatedOrder = await response.json();
      setOrders(prevOrders =>
        prevOrders.map(order => (order.id === orderId ? { ...order, order_status: newStatus } : order))
      );
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(prev => prev ? { ...prev, order_status: newStatus } : null);
      }
      toast.success(`Order ${updatedOrder.order.order_id} status updated to ${newStatus}!`);
    } catch (err: any) {
      console.error("Error updating status:", err);
      setError(err.message || 'An unexpected error occurred while updating status.');
      toast.error(err.message || 'Failed to update order status.');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Handle refund for a single order
  const handleRefund = async (orderId: string, paymentId: string, totalAmount: number) => {
    if (!paymentId) {
      toast.error("Cannot refund: No payment ID found for this order.");
      return;
    }
    const amountInPaisa = Math.round(totalAmount * 100);

    if (!confirm(`Are you sure you want to initiate a full refund of ${formatPrice(totalAmount)} for this order? This action cannot be undone.`)) {
      return;
    }

    setIsRefunding(true);
    try {
      // THIS ENDPOINT MUST BE IMPLEMENTED ON YOUR BACKEND
      const response = await fetch(`${backendUrl}/api/admin/orders/${orderId}/refund`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-API-Key': adminKey,
        },
        body: JSON.stringify({ amount: amountInPaisa, paymentId: paymentId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Refund failed.');
      }

      toast.success(`Refund of ${formatPrice(totalAmount)} initiated successfully for Order #${selectedOrder?.order_id || orderId}!`);
      fetchOrders();
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(prev => prev ? { ...prev, order_status: 'refunded' } : null);
      }

    } catch (err: any) {
      console.error("Refund error:", err);
      toast.error(err.message || 'An error occurred during refund.');
    } finally {
      setIsRefunding(false);
    }
  };

  // Handle order cancellation
  const handleCancelOrder = async (orderId: string) => {
    if (!confirm(`Are you sure you want to cancel Order #${selectedOrder?.order_id || orderId}? This will mark it as cancelled.`)) {
      return;
    }

    setIsCancelling(true);
    try {
      // THIS ENDPOINT MUST BE IMPLEMENTED ON YOUR BACKEND
      const response = await fetch(`${backendUrl}/api/admin/orders/${orderId}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-API-Key': adminKey,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Order cancellation failed.');
      }

      toast.success(`Order #${selectedOrder?.order_id || orderId} has been cancelled successfully.`);
      setOrders(prevOrders =>
        prevOrders.map(order => (order.id === orderId ? { ...order, order_status: 'cancelled' } : order))
      );
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(prev => prev ? { ...prev, order_status: 'cancelled' } : null);
      }
    } catch (err: any) {
      console.error("Cancellation error:", err);
      toast.error(err.message || 'An error occurred during cancellation.');
    } finally {
      setIsCancelling(false);
    }
  };

  // --- Bulk Actions Logic ---
  const handleSelectOrder = (orderId: string) => {
    setSelectedOrderIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(orderId)) {
        newSet.delete(orderId);
      } else {
        newSet.add(orderId);
      }
      return newSet;
    });
  };

  const handleSelectAllOrders = () => {
    if (selectedOrderIds.size === orders.length && orders.length > 0) {
      setSelectedOrderIds(new Set()); // Deselect all
    } else {
      setSelectedOrderIds(new Set(orders.map(order => order.id))); // Select all
    }
  };

  // Generic bulk status update function
  const handleBulkUpdateStatus = async (newStatus: Order['order_status']) => {
    if (selectedOrderIds.size === 0) {
      toast.info("No orders selected for bulk update.");
      return;
    }

    if (!confirm(`Are you sure you want to update status of ${selectedOrderIds.size} orders to "${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}"?`)) {
      return;
    }

    setIsBulkProcessing(true); // Set loading for all bulk actions
    setError(null);
    const updates: Promise<any>[] = [];
    const failedOrderIds: string[] = [];

    // Optimistically update the UI
    setOrders(prevOrders => prevOrders.map(order =>
      selectedOrderIds.has(order.id) ? { ...order, order_status: newStatus } : order
    ));

    for (const orderId of Array.from(selectedOrderIds)) {
      updates.push(
        fetch(`${backendUrl}/api/admin/orders/${orderId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'X-Admin-API-Key': adminKey,
          },
          body: JSON.stringify({ newStatus }),
        })
          .then(response => {
            if (!response.ok) {
              failedOrderIds.push(orderId);
              return response.json().then(err => Promise.reject(err.message || `Failed to update ${orderId}`));
            }
            return response.json();
          })
          .catch(err => {
            console.error(`Error updating order ${orderId}:`, err);
            failedOrderIds.push(orderId);
            return Promise.resolve(); // Don't block Promise.all
          })
      );
    }

    await Promise.all(updates);

    if (failedOrderIds.length === 0) {
      toast.success(`${selectedOrderIds.size} orders updated to "${newStatus}" successfully!`);
    } else {
      toast.warning(`Updated ${selectedOrderIds.size - failedOrderIds.length} orders. Failed to update ${failedOrderIds.length} orders.`);
      fetchOrders(); // Re-fetch orders to ensure consistency after partial failure
    }
    setSelectedOrderIds(new Set()); // Clear selection after action
    setIsBulkProcessing(false);
  };

  const handleBulkPrint = () => {
    if (selectedOrderIds.size === 0) {
      toast.info("No orders selected for printing.");
      return;
    }
    toast.info("Bulk print functionality is not fully implemented yet. Please print individually from order details.");
  };

  const handleBulkExport = () => {
    if (selectedOrderIds.size === 0) {
      toast.info("No orders selected for export.");
      return;
    }

    const ordersToExport = orders.filter(order => selectedOrderIds.has(order.id));

    if (ordersToExport.length === 0) {
      toast.info("No orders found to export based on current selection.");
      return;
    }

    const headers = [
      "OrderID", "CustomOrderID", "CustomerName", "CustomerEmail", "CustomerPhone",
      "Address", "City", "State", "PostalCode", "TotalAmount", "PaymentMethod",
      "PaymentID", "OrderStatus", "CreatedAt", "ItemsDetails", "Subtotal", "Discount",
      "Taxes", "ShippingCost", "AdditionalFees"
    ];

    const csvRows = ordersToExport.map(order => {
      const customerInfo = order.customer_info;
      const itemDetails = order.ordered_items ?
        order.ordered_items.map(item =>
          `${item.product?.name || 'N/A'} (${item.weight || 'N/A'}g) x ${item.quantity || 0}`
        ).join('; ') : 'N/A';

      return [
        `"${order.id}"`,
        `"${order.order_id}"`,
        `"${customerInfo.fullName}"`,
        `"${customerInfo.email}"`,
        `"${customerInfo.phoneNumber}"`,
        `"${customerInfo.address}, ${customerInfo.city}, ${customerInfo.state} - ${customerInfo.postalCode}"`,
        `"${customerInfo.city}"`,
        `"${customerInfo.state}"`,
        `"${customerInfo.postalCode}"`,
        order.total_amount,
        `"${order.payment_method}"`,
        `"${order.payment_id || ''}"`,
        `"${order.order_status}"`,
        `"${new Date(order.created_at).toISOString()}"`,
        `"${itemDetails}"`,
        order.subtotal,
        order.discount_amount,
        order.taxes,
        order.shipping_cost,
        order.additional_fees,
      ].map(field => typeof field === 'string' ? `"${field.replace(/"/g, '""')}"` : field).join(',');
    });

    const csvString = [headers.join(','), ...csvRows].join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `adhyaa_orders_export_${Date.now()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success(`${ordersToExport.length} orders exported successfully!`);
    setSelectedOrderIds(new Set());
  };

  // Render Login Form if not authenticated
  if (!isAuthenticated) {
    return (
      <>
        <Head title="Admin Login | ADHYAA PICKLES" />
        <div className="flex flex-col min-h-screen bg-gradient-to-br from-yellow-50 to-orange-100">
          <Navbar />
          <main className="flex-grow flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md border border-gray-200">
              <h1 className="text-3xl font-display font-bold text-center mb-6 text-pickle-700">
                Admin Login
              </h1>
              <p className="text-muted-foreground text-center mb-6">
                Enter your Admin API Key to access the dashboard.
              </p>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="admin-key" className="mb-2 block">Admin API Key</Label>
                  <Input
                    id="admin-key"
                    type="password"
                    placeholder="********************"
                    value={adminKey}
                    onChange={(e) => setAdminKey(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') handleLogin();
                    }}
                    className="w-full"
                  />
                  {loginError && <p className="text-red-500 text-sm mt-2">{loginError}</p>}
                </div>
                <Button
                  onClick={handleLogin}
                  disabled={loading}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 rounded-md transition-colors"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Logging in...
                    </>
                  ) : (
                    "Login"
                  )}
                </Button>
              </div>
            </div>
          </main>
          <Footer />
        </div>
      </>
    );
  }

  // Render Dashboard if authenticated
  return (
    <>
      <Head title="Admin Dashboard | ADHYAA PICKLES" />
      <div className="flex flex-col min-h-screen bg-gray-50">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-8 md:py-12">
          <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
            <h1 className="text-3xl font-display font-bold text-pickle-700">Admin Dashboard</h1>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="bg-red-500 hover:bg-red-600 text-white font-semibold"
            >
              Logout
            </Button>
          </div>

          {/* Filters and Search */}
          <div className="bg-white p-6 rounded-lg shadow-md mb-8 flex flex-col md:flex-row items-center gap-4">
            <div className="flex items-center gap-2 w-full md:w-1/3">
              <Filter className="h-5 w-5 text-gray-500" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as Order['order_status'] | 'all')}
                className="flex-grow border rounded-md px-3 py-2 bg-background text-sm h-10"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
                <option value="refunded">Refunded</option> {/* Added refunded to filter options */}
              </select>
            </div>
            <div className="flex items-center gap-2 w-full md:w-2/3">
              <Search className="h-5 w-5 text-gray-500" />
              <Input
                type="text"
                placeholder="Search by Order ID or Customer Name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-grow"
              />
            </div>
          </div>

          {/* Bulk Actions Controls */}
          <div className="bg-white p-6 rounded-lg shadow-md mb-8 flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center">
              <Input
                type="checkbox"
                className="mr-2 h-4 w-4"
                checked={selectedOrderIds.size === orders.length && orders.length > 0}
                onChange={handleSelectAllOrders}
                disabled={orders.length === 0 || loading || isBulkProcessing}
              />
              <Label className="text-sm">Select All ({selectedOrderIds.size} selected)</Label>
            </div>
            <div className="flex flex-wrap gap-2">
              {selectedOrderIds.size > 0 && (
                <>
                  <Button
                    onClick={() => handleBulkUpdateStatus('processing')}
                    disabled={isBulkProcessing || loading}
                    variant="outline"
                    className="flex items-center"
                  >
                    {isBulkProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Mark as Processing
                  </Button>
                  <Button
                    onClick={() => handleBulkUpdateStatus('shipped')}
                    disabled={isBulkProcessing || loading}
                    variant="outline"
                    className="flex items-center"
                  >
                    {isBulkProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Mark as Shipped
                  </Button>
                  <Button
                    onClick={() => handleBulkUpdateStatus('delivered')}
                    disabled={isBulkProcessing || loading}
                    variant="outline"
                    className="flex items-center"
                  >
                    {isBulkProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Mark as Delivered
                  </Button>
                  <Button
                    onClick={handleBulkPrint}
                    disabled={isBulkProcessing || loading}
                    variant="outline"
                  >
                    Print Selected Invoices
                  </Button>
                  <Button
                    onClick={handleBulkExport}
                    disabled={isBulkProcessing || loading}
                    variant="outline"
                  >
                    Export Selected
                  </Button>
                </>
              )}
            </div>
          </div>

          {loading && (
            <div className="text-center py-12">
              <Loader2 className="h-10 w-10 animate-spin text-orange-500 mx-auto" />
              <p className="mt-4 text-lg text-gray-600">Loading orders...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
              <strong className="font-bold">Error!</strong>
              <span className="block sm:inline ml-2">{error}</span>
            </div>
          )}

          {!loading && orders.length === 0 && !error && (
            <div className="text-center py-12 text-gray-600">
              <p className="text-xl font-semibold">No orders found.</p>
              <p className="mt-2">Try adjusting your filters or search term.</p>
            </div>
          )}

          {!loading && orders.length > 0 && (
            <div className="grid grid-cols-1 gap-6">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white p-6 rounded-lg shadow-md border border-gray-100 cursor-pointer"
                  onClick={() => setSelectedOrder(order)} // Opens details modal
                >
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 pb-4 border-b border-dashed border-gray-200">
                    <div className="flex items-center">
                      <Input
                        type="checkbox"
                        className="mr-3 h-4 w-4"
                        checked={selectedOrderIds.has(order.id)}
                        onChange={() => handleSelectOrder(order.id)}
                        onClick={(e) => e.stopPropagation()} // Prevent modal from opening
                      />
                      <div>
                        <h2 className="text-xl font-semibold text-pickle-700">Order #{order.order_id}</h2>
                        <p className="text-sm text-muted-foreground">
                          Placed on: {new Date(order.created_at).toLocaleDateString()} at {new Date(order.created_at).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 md:mt-0">
                      <Label htmlFor={`status-${order.id}`} className="sr-only">Order Status</Label>
                      <select
                        id={`status-${order.id}`}
                        value={order.order_status}
                        onChange={(e) => {
                          e.stopPropagation(); // Prevent modal from opening
                          handleUpdateStatus(order.id, e.target.value as Order['order_status']);
                        }}
                        className={cn(
                          "px-3 py-2 rounded-md border text-sm font-medium",
                          {
                            'bg-yellow-100 text-yellow-800 border-yellow-300': order.order_status === 'pending',
                            'bg-blue-100 text-blue-800 border-blue-300': order.order_status === 'processing',
                            'bg-purple-100 text-purple-800 border-purple-300': order.order_status === 'shipped',
                            'bg-green-100 text-green-800 border-green-300': order.order_status === 'delivered',
                            'bg-red-100 text-red-800 border-red-300': order.order_status === 'cancelled',
                            'bg-gray-100 text-gray-800 border-gray-300': order.order_status === 'refunded', // Style for refunded
                          }
                        )}
                        disabled={isUpdatingStatus || loading}
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="refunded">Refunded</option> {/* Added refunded to single status options */}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                    {/* Customer Info */}
                    <div>
                      <h3 className="font-semibold text-lg mb-2 text-spice-600">Customer Details</h3>
                      <p className="text-muted-foreground"><strong>Name:</strong> {order.customer_info.fullName}</p>
                      <p className="text-muted-foreground"><strong>Email:</strong> {order.customer_info.email}</p>
                      <p className="text-muted-foreground"><strong>Phone:</strong> {order.customer_info.phoneNumber}</p>
                      <p className="text-muted-foreground"><strong>Address:</strong> {order.customer_info.address}, {order.customer_info.city}, {order.customer_info.state} - {order.customer_info.postalCode}</p>
                    </div>

                    {/* Payment Info */}
                    <div>
                      <h3 className="font-semibold text-lg mb-2 text-spice-600">Payment & Totals</h3>
                      <p className="text-muted-foreground"><strong>Method:</strong> {order.payment_method === 'cod' ? 'Cash on Delivery' : 'Razorpay'}</p>
                      {order.payment_id && <p className="text-muted-foreground"><strong>Payment ID:</strong> {order.payment_id}</p>}
                      <p className="text-muted-foreground"><strong>Subtotal:</strong> {formatPrice(order.subtotal)}</p>
                      {order.discount_amount > 0 && (
                        <p className="text-muted-foreground text-green-600"><strong>Discount:</strong> -{formatPrice(order.discount_amount)}</p>
                      )}
                      <p className="text-muted-foreground"><strong>Shipping:</strong> {formatPrice(order.shipping_cost)}</p>
                      <p className="text-muted-foreground"><strong>Taxes:</strong> {formatPrice(order.taxes)}</p>
                      {order.additional_fees > 0 && (
                        <p className="text-muted-foreground"><strong>Additional Fees:</strong> {formatPrice(order.additional_fees)}</p>
                      )}
                      <p className="font-bold text-lg text-pickle-700 mt-2"><strong>Total:</strong> {formatPrice(order.total_amount)}</p>
                    </div>
                  </div>

                  {/* Ordered Items Summary (details in modal) */}
                  <div>
                    <h3 className="font-semibold text-lg mb-2 text-spice-600">Ordered Items Summary</h3>
                    <ul className="list-disc list-inside text-muted-foreground">
                      {order.ordered_items && order.ordered_items.length > 0 ? (
                        order.ordered_items.slice(0, 3).map((item, idx) => ( // Show first 3, indicate more
                          <li key={idx} className="text-sm">
                            {item.quantity} x {item.product?.name || 'Unknown'} ({item.weight}g)
                          </li>
                        ))
                      ) : (
                        <li className="text-muted-foreground italic text-sm">No items found.</li>
                      )}
                      {order.ordered_items && order.ordered_items.length > 3 && (
                        <li className="text-sm italic">...and {order.ordered_items.length - 3} more items.</li>
                      )}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
        <Footer />
      </div>

      {/* --- Order Details Modal --- */}
      {selectedOrder && (
        <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
          <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl">Order Details for #{selectedOrder.order_id}</DialogTitle>
              <DialogDescription>
                Comprehensive view of the order placed on {new Date(selectedOrder.created_at).toLocaleString()}.
              </DialogDescription>
            </DialogHeader>

            <div className="py-4 space-y-6">
              {/* Customer Information */}
              <section>
                <h3 className="font-semibold text-xl mb-2 text-spice-600">Customer Details</h3>
                <p><strong>Name:</strong> {selectedOrder.customer_info.fullName}</p>
                <p><strong>Email:</strong> {selectedOrder.customer_info.email}</p>
                <p><strong>Phone:</strong> {selectedOrder.customer_info.phoneNumber}</p>
                <p><strong>Address:</strong> {selectedOrder.customer_info.address}, {selectedOrder.customer_info.city}, {selectedOrder.customer_info.state} - {selectedOrder.customer_info.postalCode}</p>
                {/* {selectedOrder.customer_info.deliveryNotes && <p><strong>Delivery Notes:</strong> {selectedOrder.customer_info.deliveryNotes}</p>} */}
              </section>

              <hr className="my-4" />

              {/* Detailed Item Breakdown */}
              <section>
                <h3 className="font-semibold text-xl mb-2 text-spice-600">Ordered Items</h3>
                <ul className="space-y-4">
                  {selectedOrder.ordered_items && selectedOrder.ordered_items.length > 0 ? (
                    selectedOrder.ordered_items.map((item, idx) => (
                      <li key={idx} className="flex items-start space-x-4 p-2 border rounded-md bg-gray-50">
                        <img
                          src={item.product?.image || 'https://placehold.co/80x80/e0e0e0/ffffff?text=No+Img'}
                          alt={item.product?.name || 'Product Image'}
                          className="w-20 h-20 object-cover rounded-md flex-shrink-0"
                        />
                        <div className="flex-grow">
                          <p className="font-medium text-lg text-foreground">{item.product?.name || 'Unknown Product'}</p>
                          <p className="text-sm text-muted-foreground">
                            {item.quantity} x {item.weight}g @ {formatPrice(item.product?.pricePerWeight?.[item.weight] || 0)} each
                          </p>
                          <p className="font-semibold text-sm mt-1">
                            Total: {formatPrice(item.quantity * (item.product?.pricePerWeight?.[item.weight] || 0))}
                          </p>
                        </div>
                      </li>
                    ))
                  ) : (
                    <p className="text-muted-foreground italic">No items found for this order.</p>
                  )}
                </ul>
              </section>

              <hr className="my-4" />

              {/* Order History/Timeline (Requires backend logging) */}
              <section>
                <h3 className="font-semibold text-xl mb-2 text-spice-600">Order History</h3>
                <p className="text-muted-foreground">Order placed: {new Date(selectedOrder.created_at).toLocaleString()}</p>
                <p className="text-muted-foreground">Last updated: {new Date(selectedOrder.updated_at).toLocaleString()}</p>
                <p className="text-muted-foreground">Current Status: <span className={cn(
                  "font-semibold",
                  {
                    'text-yellow-800': selectedOrder.order_status === 'pending',
                    'text-blue-800': selectedOrder.order_status === 'processing',
                    'text-purple-800': selectedOrder.order_status === 'shipped',
                    'text-green-800': selectedOrder.order_status === 'delivered',
                    'text-red-800': selectedOrder.order_status === 'cancelled',
                    'text-gray-800': selectedOrder.order_status === 'refunded',
                  }
                )}>{selectedOrder.order_status.charAt(0).toUpperCase() + selectedOrder.order_status.slice(1)}</span></p>
              </section>

              <hr className="my-4" />

              {/* Payment Gateway Details */}
              <section>
                <h3 className="font-semibold text-xl mb-2 text-spice-600">Payment Information</h3>
                <p><strong>Payment Method:</strong> {selectedOrder.payment_method === 'cod' ? 'Cash on Delivery' : 'Razorpay'}</p>
                {selectedOrder.payment_id && <p><strong>Transaction ID:</strong> {selectedOrder.payment_id}</p>}
                <p className="font-bold text-lg text-pickle-700 mt-2">Total Amount: {formatPrice(selectedOrder.total_amount)}</p>
              </section>

              <hr className="my-4" />

              {/* Action Buttons: Refund & Cancel */}
              <section className="flex flex-wrap gap-4 justify-end">
                {selectedOrder.payment_method === 'razorpay' && selectedOrder.payment_id && selectedOrder.order_status !== 'cancelled' && selectedOrder.order_status !== 'refunded' && (
                  <Button
                    onClick={() => handleRefund(selectedOrder.id, selectedOrder.payment_id!, selectedOrder.total_amount)}
                    disabled={isRefunding || selectedOrder.order_status === 'delivered'}
                    variant="destructive"
                  >
                    {isRefunding ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Refunding...
                      </>
                    ) : (
                      "Initiate Full Refund"
                    )}
                  </Button>
                )}

                {selectedOrder.order_status !== 'cancelled' && selectedOrder.order_status !== 'delivered' && selectedOrder.order_status !== 'refunded' && (
                  <Button
                    onClick={() => handleCancelOrder(selectedOrder.id)}
                    disabled={isCancelling || isRefunding}
                    variant="outline"
                    className="border-red-500 text-red-500 hover:bg-red-50"
                  >
                    {isCancelling ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Cancelling...
                      </>
                    ) : (
                      "Cancel Order"
                    )}
                  </Button>
                )}

                <Button
                  onClick={() => window.print()}
                  variant="secondary"
                >
                  Print Invoice/Packing Slip
                </Button>
              </section>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}

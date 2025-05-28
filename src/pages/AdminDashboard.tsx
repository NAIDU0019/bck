// src/pages/AdminDashboard.tsx

import { useState, useEffect, useCallback } from "react";
import Head from "@/components/Head";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
// import { Separator } from "@/components/ui/separator"; // Only keep if actually used elsewhere
import { toast } from "sonner"; // Changed from "@/components/ui/sonner" assuming it's the external library
import { formatPrice } from "@/lib/utils";
import { Loader2, Search, Filter } from "lucide-react"; // Removed CheckCircle, XCircle if not directly used
import { cn } from "@/lib/utils";
import io from 'socket.io-client'; // Import socket.io-client

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
  order_status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  created_at: string;
  updated_at: string;
}

const ADMIN_API_KEY_STORAGE_KEY = 'adhyaa_admin_api_key';

export default function AdminDashboard() {
  // Initialize isAuthenticated based on localStorage
  const initialAdminKey = localStorage.getItem(ADMIN_API_KEY_STORAGE_KEY) || '';
  const [adminKey, setAdminKey] = useState<string>(initialAdminKey);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!initialAdminKey); // Correctly sets initial auth state
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<Order['order_status'] | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [loginError, setLoginError] = useState<string | null>(null);

  // Use import.meta.env for Vite projects
  const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  // Handle admin logout (defined here so it can be called by fetchOrders)
  const handleLogout = useCallback(() => {
    setIsAuthenticated(false);
    setAdminKey('');
    setOrders([]);
    localStorage.removeItem(ADMIN_API_KEY_STORAGE_KEY);
    toast.info('Logged out from admin dashboard.');
  }, []); // No dependencies for this simple logout function

  // Memoized function to fetch orders from the backend
  const fetchOrders = useCallback(async () => {
    // Only attempt to fetch orders if authenticated
    if (!isAuthenticated) {
        setOrders([]); // Clear orders if not authenticated
        setLoading(false); // Ensure loading is false if not authenticated
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
        // If 401 Unauthorized, specifically handle it as a login failure
        if (response.status === 401) {
            toast.error('Session expired or Invalid Admin API Key. Please log in again.');
            handleLogout(); // Log out if unauthorized
            return; // Exit function early
        }
        throw new Error(errorData.message || 'Failed to fetch orders.');
      }

      const data: Order[] = await response.json();
      console.log("Fetched Orders Data:", JSON.stringify(data, null, 2)); // <<-- IMPORTANT DEBUG LOG
      setOrders(data);
    } catch (err: any) {
      console.error("Error fetching orders:", err); // Log the actual error
      setError(err.message || 'An unexpected error occurred while fetching orders.');
      toast.error(err.message || 'Failed to load orders.');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, filterStatus, searchTerm, adminKey, backendUrl, handleLogout]); // Include handleLogout as dependency

  // --- Main useEffect for initial fetch and WebSocket listener ---
  useEffect(() => {
    // Initial fetch when authenticated or filters/search change
    fetchOrders();

    // Setup WebSocket connection only if authenticated
    let socket: ReturnType<typeof io> | undefined;
    if (isAuthenticated) {
        console.log(`Attempting to connect to WebSocket at: ${backendUrl}`);
        socket = io(backendUrl); // Connect to your backend's WebSocket server

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

        // Listen for 'newOrder' event from the backend
        socket.on('newOrder', (newOrder: Order) => {
            console.log('New order received via WebSocket:', newOrder);
            // Add the new order to the beginning of the list
            setOrders((prevOrders) => [newOrder, ...prevOrders]);
            toast.success(`🎉 New Order! #${newOrder.order_id}`); // Sonner toast for new order
        });

        // Optional: Listen for 'orderUpdated' if your backend emits it on status changes
        socket.on('orderUpdated', (updatedOrder: Order) => {
            console.log('Order updated via WebSocket:', updatedOrder);
            setOrders((prevOrders) =>
                prevOrders.map((order) =>
                    order.id === updatedOrder.id ? updatedOrder : order
                )
            );
            toast.info(`Order #${updatedOrder.order_id} status changed to ${updatedOrder.order_status}`);
        });
    }

    // Cleanup function for WebSocket
    return () => {
      if (socket) {
        console.log('Disconnecting from WebSocket server...');
        socket.disconnect();
      }
    };
  }, [isAuthenticated, fetchOrders, backendUrl]); // Dependencies for useEffect

  // Handle admin login
  const handleLogin = async () => {
    setLoginError(null);
    if (!adminKey.trim()) {
      setLoginError('Admin API Key cannot be empty.');
      return;
    }

    setLoading(true);
    try {
      // A simple way to test the key is to try fetching orders
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
      // fetchOrders will be called by the useEffect hook due to isAuthenticated change
    } catch (err: any) {
      console.error("Login error:", err); // Log login error
      setLoginError(err.message || 'Login failed. Please check your API Key.');
      toast.error(err.message || 'Admin login failed.');
      setIsAuthenticated(false);
      localStorage.removeItem(ADMIN_API_KEY_STORAGE_KEY);
    } finally {
      setLoading(false);
    }
  };

  // Handle order status update
  const handleUpdateStatus = async (orderId: string, newStatus: Order['order_status']) => {
    setLoading(true);
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
      // Optimistic UI update or re-fetch for immediate consistency
      // Note: If you also emit 'orderUpdated' from backend, this might lead to duplicate updates.
      // You might want to remove this if you rely solely on WebSocket updates for status changes.
      setOrders(prevOrders =>
        prevOrders.map(order => (order.id === orderId ? { ...order, order_status: newStatus } : order))
      );
      toast.success(`Order ${updatedOrder.order.order_id} status updated to ${newStatus}!`);
    } catch (err: any) {
      console.error("Error updating status:", err); // Log the actual error
      setError(err.message || 'An unexpected error occurred while updating status.');
      toast.error(err.message || 'Failed to update order status.');
    } finally {
      setLoading(false);
    }
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
                    type="password" // Use type="password" for security
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
                <div key={order.id} className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 pb-4 border-b border-dashed border-gray-200">
                    <div>
                      <h2 className="text-xl font-semibold text-pickle-700">Order #{order.order_id}</h2>
                      <p className="text-sm text-muted-foreground">
                        Placed on: {new Date(order.created_at).toLocaleDateString()} at {new Date(order.created_at).toLocaleTimeString()}
                      </p>
                    </div>
                    <div className="mt-2 md:mt-0">
                      <Label htmlFor={`status-${order.id}`} className="sr-only">Order Status</Label>
                      <select
                        id={`status-${order.id}`}
                        value={order.order_status}
                        onChange={(e) => handleUpdateStatus(order.id, e.target.value as Order['order_status'])}
                        className={cn(
                          "px-3 py-2 rounded-md border text-sm font-medium",
                          {
                            'bg-yellow-100 text-yellow-800 border-yellow-300': order.order_status === 'pending',
                            'bg-blue-100 text-blue-800 border-blue-300': order.order_status === 'processing',
                            'bg-purple-100 text-purple-800 border-purple-300': order.order_status === 'shipped',
                            'bg-green-100 text-green-800 border-green-300': order.order_status === 'delivered',
                            'bg-red-100 text-red-800 border-red-300': order.order_status === 'cancelled',
                          }
                        )}
                        disabled={loading}
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
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

                  {/* Ordered Items */}
                  <div>
                    <h3 className="font-semibold text-lg mb-2 text-spice-600">Ordered Items</h3>
                    <ul className="space-y-2">
                      {order.ordered_items && order.ordered_items.length > 0 ? ( // Added check for null/empty array
                        order.ordered_items.map((item, idx) => (
                          <li key={idx} className="flex items-center space-x-3 text-muted-foreground">
                            <img
                              src={item.product?.image || 'https://placehold.co/50x50/e0e0e0/ffffff?text=No+Img'} // Added ?.
                              alt={item.product?.name || 'Product Image'} // Added ?.
                              className="w-12 h-12 object-cover rounded-md"
                            />
                            <div>
                              <p className="font-medium text-foreground">{item.product?.name || 'Unknown Product'}</p> {/* Added ?. */}
                              <p className="text-sm">
                                {item.quantity || 0} x {item.weight || 'N/A'}g @ {formatPrice(item.product?.pricePerWeight?.[item.weight] || 0)} {/* Added ?. for pricePerWeight */}
                              </p>
                            </div>
                          </li>
                        ))
                      ) : (
                        <p className="text-muted-foreground italic">No items found for this order.</p> // Fallback message
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
    </>
  );
}
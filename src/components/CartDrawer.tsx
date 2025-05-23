import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Trash2, MinusCircle, PlusCircle, ShoppingBag } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
}

export default function CartDrawer({ open, onClose }: CartDrawerProps) {
  const { items, removeItem, updateQuantity, clearCart, total } = useCart();
  const navigate = useNavigate();

  const handleCheckout = () => {
    onClose();
    navigate("/checkout");
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="text-2xl font-display">Your Cart</SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-8">
            <p className="text-muted-foreground mb-4">Your cart is empty</p>
            <Button onClick={onClose}>Continue Shopping</Button>
          </div>
        ) : (
          <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto custom-scroll py-4">
              {items.map((item) => {
                const selectedWeight = item.weight;
                const itemPrice =
                  item.product.pricePerWeight?.[selectedWeight] || 0;

                return (
                  <div key={`${item.product.id}-${selectedWeight}`} className="mb-4">
                    <div className="flex gap-4">
                      <div className="w-20 h-20 rounded-md overflow-hidden bg-muted flex-shrink-0">
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium">{item.product.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {selectedWeight}g
                        </p>
                        <div className="flex justify-between items-center mt-2">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() =>
                                updateQuantity(item.product.id, item.quantity - 1, selectedWeight)
                              }
                            >
                              <MinusCircle className="h-4 w-4" />
                            </Button>
                            <span className="w-6 text-center">{item.quantity}</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() =>
                                updateQuantity(item.product.id, item.quantity + 1, selectedWeight)
                              }
                            >
                              <PlusCircle className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">
                              {formatPrice(itemPrice * item.quantity)}
                            </p>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-muted-foreground hover:text-destructive"
                              onClick={() => removeItem(item.product.id, selectedWeight)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                    <Separator className="my-4" />
                  </div>
                );
              })}
            </div>

            <div className="pt-4 border-t">
              <div className="flex justify-between mb-2">
                <span>Subtotal</span>
                <span className="font-medium">{formatPrice(total)}</span>
              </div>
              <div className="flex justify-between mb-4">
                <span>Shipping</span>
                <span>Calculated at checkout</span>
              </div>
              <Button className="w-full mb-2 gap-2" onClick={handleCheckout}>
                <ShoppingBag className="h-4 w-4" />
                Proceed to Checkout
              </Button>
              <Button variant="outline" className="w-full" onClick={clearCart}>
                Clear Cart
              </Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

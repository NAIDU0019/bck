import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
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

interface CartItemProps {
  productId: string;
  selectedWeight: number;
  quantity: number;
  productName: string;
  productImage: string;
  pricePerWeight: Record<number, number> | undefined;
  updateQuantity: (
    productId: string,
    weight: string,
    quantity: number
  ) => void;
  removeItem: (productId: string, weight: string) => void;
}

function CartItem({
  productId,
  selectedWeight,
  quantity,
  productName,
  productImage,
  pricePerWeight,
  updateQuantity,
  removeItem,
}: CartItemProps) {
  const itemPrice = pricePerWeight?.[selectedWeight] || 0;

  return (
    <div key={`${productId}-${selectedWeight}`} className="mb-6">
      <div className="flex gap-4 items-center">
        <div className="w-20 h-20 rounded-md overflow-hidden bg-muted flex-shrink-0 border border-gray-200">
          <img
            src={productImage}
            alt={productName}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>

        <div className="flex-1 flex flex-col justify-between">
          <div>
            <h3 className="font-semibold text-lg leading-tight">{productName}</h3>
            <p className="text-sm text-muted-foreground">{selectedWeight}g</p>
          </div>

          <div className="flex justify-between items-center mt-3">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 p-0 disabled:opacity-50 disabled:pointer-events-none"
                onClick={() =>
                  quantity > 1 &&
                  updateQuantity(productId, selectedWeight.toString(), quantity - 1)
                }
                disabled={quantity === 1}
                aria-label="Decrease quantity"
              >
                <MinusCircle className="h-5 w-5" />
              </Button>

              <span className="w-8 text-center font-medium">{quantity}</span>

              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 p-0"
                onClick={() =>
                  updateQuantity(productId, selectedWeight.toString(), quantity + 1)
                }
                aria-label="Increase quantity"
              >
                <PlusCircle className="h-5 w-5" />
              </Button>
            </div>

            <div className="text-right flex items-center gap-2">
              <p className="font-semibold text-lg">{formatPrice(itemPrice * quantity)}</p>
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-destructive"
                onClick={() => removeItem(productId, selectedWeight.toString())}
                aria-label="Remove item"
              >
                <Trash2 className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CartDrawer({ open, onClose }: CartDrawerProps) {
  const { items, removeItem, updateQuantity, clearCart, total } = useCart();
  const navigate = useNavigate();

  const handleCheckout = () => {
    onClose();
    navigate("/checkout");
  };

  return (
    <Sheet
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose();
      }}
    >
      <SheetContent className="w-full sm:max-w-md flex flex-col">
        <SheetHeader>
          <SheetTitle className="text-3xl font-display mb-4">Your Cart</SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-grow py-12 gap-6">
            <p className="text-muted-foreground text-lg">Your cart is empty</p>
            <Button onClick={onClose} size="lg">
              Continue Shopping
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto custom-scroll py-4 px-1 min-h-[300px]">
              {items.map((item) => (
                <CartItem
                  key={`${item.product.id}-${item.weight}`}
                  productId={item.product.id}
                  selectedWeight={Number(item.weight)} // convert weight to number
                  quantity={item.quantity}
                  productName={item.product.name}
                  productImage={item.product.image}
                  pricePerWeight={item.product.pricePerWeight}
                  updateQuantity={updateQuantity}
                  removeItem={removeItem}
                />
              ))}
            </div>

            <div className="pt-6 border-t border-gray-200 px-2">
              <div className="flex justify-between text-lg mb-3">
                <span>Subtotal</span>
                <span className="font-semibold">{formatPrice(total)}</span>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground mb-6">
                <span>Shipping</span>
                <span>Calculated at checkout</span>
              </div>
              <Button
                className="w-full mb-3 gap-2"
                onClick={handleCheckout}
                size="lg"
              >
                <ShoppingBag className="h-5 w-5" />
                Proceed to Checkout
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={clearCart}
                size="lg"
              >
                Clear Cart
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { HiOutlineBanknotes, HiOutlineCreditCard, HiOutlineDevicePhoneMobile } from "react-icons/hi2";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { orderApi } from "../api/orders";
import FormInput from "../components/FormInput";
import { formatCurrency } from "../utils/format";
import { nameRules, phoneRules } from "../utils/validationRules";

const PAYMENT_METHODS = [
  { value: "cash", label: "Cash on pickup", icon: HiOutlineBanknotes },
  { value: "card", label: "Card", icon: HiOutlineCreditCard },
  { value: "upi", label: "UPI", icon: HiOutlineDevicePhoneMobile },
];

export default function Checkout() {
  const { items, clearCart, itemCount } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [summary, setSummary] = useState(null);
  const [serverError, setServerError] = useState("");
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("cash");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      customerName: user?.name || "",
      customerPhone: user?.phone || "",
      customerAddress: user?.address || "",
      notes: "",
    },
  });

  useEffect(() => {
    if (itemCount === 0) {
      navigate("/cart", { replace: true });
      return;
    }
    orderApi
      .calculateCart(items.map((i) => ({ product_id: i.productId, quantity: i.quantity })))
      .then(setSummary)
      .catch((err) => setServerError(err.message));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const onSubmit = async (data) => {
    setServerError("");
    setIsPlacingOrder(true);
    try {
      const order = await orderApi.checkout({
        items: items.map((i) => ({ product_id: i.productId, quantity: i.quantity })),
        customer_name: data.customerName,
        customer_phone: data.customerPhone,
        customer_address: data.customerAddress || undefined,
        payment_method: paymentMethod,
        notes: data.notes || undefined,
      });
      clearCart();
      navigate(`/order-success/${order.id}`, { replace: true });
    } catch (err) {
      setServerError(err.message);
    } finally {
      setIsPlacingOrder(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-display text-4xl font-semibold">Checkout</h1>
      <p className="mt-2 text-espresso/60 dark:text-cream/60">Confirm your details to place the order.</p>

      {serverError && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="glass-card p-6">
            <h2 className="font-display text-xl font-semibold">Customer Information</h2>
            <div className="mt-4 space-y-4">
              <FormInput label="Full name" register={register("customerName", nameRules)} error={errors.customerName} />
              <FormInput label="Phone number" type="tel" register={register("customerPhone", phoneRules)} error={errors.customerPhone} />
              <FormInput
                label="Delivery / pickup address (optional)"
                register={register("customerAddress")}
                error={errors.customerAddress}
                placeholder="123 Main Street, Apt 4B"
              />
              <div>
                <label className="mb-1.5 block text-sm font-medium text-espresso/80 dark:text-cream/70">
                  Order notes (optional)
                </label>
                <textarea
                  {...register("notes")}
                  rows={3}
                  className="input-field resize-none"
                  placeholder="Extra hot, no sugar, etc."
                />
              </div>
            </div>
          </div>

          <div className="glass-card p-6">
            <h2 className="font-display text-xl font-semibold">Payment Method</h2>
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
              {PAYMENT_METHODS.map(({ value, label, icon: Icon }) => (
                <button
                  type="button"
                  key={value}
                  onClick={() => setPaymentMethod(value)}
                  className={`flex flex-col items-center gap-2 rounded-xl border-2 px-4 py-4 transition ${
                    paymentMethod === value
                      ? "border-accent bg-accent/5 text-accent"
                      : "border-secondary/30 text-espresso/60 hover:border-secondary/60 dark:text-cream/50"
                  }`}
                >
                  <Icon size={22} />
                  <span className="text-sm font-medium">{label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Order summary */}
        <div className="glass-card h-fit space-y-4 p-6">
          <h2 className="font-display text-xl font-semibold">Order Summary</h2>
          <div className="max-h-56 space-y-2 overflow-y-auto pr-1">
            {items.map((item) => (
              <div key={item.productId} className="flex justify-between text-sm">
                <span className="text-espresso/70 dark:text-cream/60">
                  {item.name} × {item.quantity}
                </span>
                <span className="font-medium">{formatCurrency(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>

          {summary && (
            <div className="space-y-2 border-t border-secondary/20 pt-3 text-sm">
              <div className="flex justify-between text-espresso/70 dark:text-cream/60">
                <span>Subtotal</span>
                <span>{formatCurrency(summary.subtotal)}</span>
              </div>
              <div className="flex justify-between text-espresso/70 dark:text-cream/60">
                <span>Tax</span>
                <span>{formatCurrency(summary.tax_amount)}</span>
              </div>
              {Number(summary.discount_amount) > 0 && (
                <div className="flex justify-between text-accent">
                  <span>Discount</span>
                  <span>-{formatCurrency(summary.discount_amount)}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-secondary/20 pt-2 font-display text-lg font-semibold">
                <span>Total</span>
                <span>{formatCurrency(summary.total_amount)}</span>
              </div>
            </div>
          )}

          <button type="submit" disabled={isPlacingOrder} className="btn-accent w-full">
            {isPlacingOrder ? "Placing order…" : "Place Order"}
          </button>
        </div>
      </form>
    </div>
  );
}

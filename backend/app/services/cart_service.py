"""
Cart pricing logic shared between the "preview cart totals" endpoint and checkout,
so tax/discount rules are computed in exactly one place.
"""
from decimal import ROUND_HALF_UP, Decimal

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.product import Product
from app.schemas.order import (
    DISCOUNT_RATE,
    DISCOUNT_THRESHOLD,
    TAX_RATE,
    CartItemInput,
    CartItemPriced,
    CartSummaryResponse,
)


def _round_money(value: Decimal) -> Decimal:
    return value.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)


async def price_cart(items: list[CartItemInput], db: AsyncSession) -> tuple[CartSummaryResponse, list[Product]]:
    """
    Fetches live product data, validates availability/stock, and computes
    subtotal/tax/discount/total. Raises HTTPException on invalid/unavailable items.
    Returns the priced summary plus the matching Product rows (for stock decrement on checkout).
    """
    if not items:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cart cannot be empty.")

    product_ids = [item.product_id for item in items]
    result = await db.execute(select(Product).where(Product.id.in_(product_ids)))
    products_by_id = {p.id: p for p in result.scalars().all()}

    priced_items: list[CartItemPriced] = []
    ordered_products: list[Product] = []
    subtotal = Decimal("0")

    for item in items:
        product = products_by_id.get(item.product_id)
        if product is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail=f"Product {item.product_id} does not exist."
            )
        if not product.is_available:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail=f"'{product.name}' is currently unavailable."
            )
        if product.stock < item.quantity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Only {product.stock} of '{product.name}' left in stock.",
            )

        unit_price = Decimal(product.price)
        line_total = _round_money(unit_price * item.quantity)
        subtotal += line_total

        priced_items.append(
            CartItemPriced(
                product_id=product.id,
                name=product.name,
                unit_price=unit_price,
                quantity=item.quantity,
                line_total=line_total,
                is_available=product.is_available,
                stock=product.stock,
            )
        )
        ordered_products.append(product)

    tax_amount = _round_money(subtotal * TAX_RATE)
    discount_amount = _round_money(subtotal * DISCOUNT_RATE) if subtotal >= DISCOUNT_THRESHOLD else Decimal("0")
    total_amount = _round_money(subtotal + tax_amount - discount_amount)

    summary = CartSummaryResponse(
        items=priced_items,
        subtotal=subtotal,
        tax_amount=tax_amount,
        discount_amount=discount_amount,
        total_amount=total_amount,
    )
    return summary, ordered_products

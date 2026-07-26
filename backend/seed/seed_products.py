import asyncio
import json
from pathlib import Path

from sqlalchemy import select

from app.database.session import AsyncSessionLocal
from app.models.category import Category
from app.models.product import Product

JSON_FILE = Path(__file__).parent / "products.json"


async def seed_products():
    with open(JSON_FILE, "r", encoding="utf-8") as f:
        data = json.load(f)

    async with AsyncSessionLocal() as session:

        for category_data in data:

            category_name = category_data["category"]

            result = await session.execute(
                select(Category).where(Category.name == category_name)
            )

            category = result.scalar_one_or_none()

            if not category:
                print(f"❌ Category '{category_name}' not found")
                continue

            print(f"\n📂 {category_name}")

            for item in category_data["products"]:

                existing = await session.execute(
                    select(Product).where(Product.name == item["name"])
                )

                existing_product = existing.scalar_one_or_none()

                if existing_product:
                    existing_product.description = item.get("description")
                    existing_product.image_url = item.get("image")
                    existing_product.price = item["price"]
                    existing_product.is_available = item.get("available", True)
                    existing_product.category_id = category.id

                    print(f"🔄 Updated: {item['name']}")
                else:
                    product = Product(
                        name=item["name"],
                        description=item.get("description"),
                        image_url=item.get("image"),
                        price=item["price"],
                        stock=100,
                        is_available=item.get("available", True),
                        category_id=category.id,
                    )

                    session.add(product)

                    print(f"✅ Added: {item['name']}")

        await session.commit()

        print("\n🎉 All products imported successfully!")


if __name__ == "__main__":
    asyncio.run(seed_products())
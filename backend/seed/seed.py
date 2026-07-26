# Import all models so SQLAlchemy registers relationships
import app.models.user
import app.models.category
import app.models.product
import app.models.order
import asyncio

from sqlalchemy import select

from app.database.session import AsyncSessionLocal
from app.models.category import Category

from seed.categories import CATEGORIES


async def seed_categories():

    async with AsyncSessionLocal() as db:

        category_map = {}

        for data in CATEGORIES:

            result = await db.execute(
                select(Category).where(Category.name == data["name"])
            )

            category = result.scalar_one_or_none()

            if category is None:

                category = Category(**data)

                db.add(category)

                await db.flush()

            category_map[category.name] = category.id

        await db.commit()

        print("✅ Categories Seeded")

        return category_map


async def main():
    await seed_categories()


if __name__ == "__main__":
    asyncio.run(main())
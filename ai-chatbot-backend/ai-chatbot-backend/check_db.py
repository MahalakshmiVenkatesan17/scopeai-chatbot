import asyncio
from app.core.database import async_session_factory
from sqlalchemy import text

async def get_path():
    async with async_session_factory() as s:
        r = await s.execute(text('SELECT file_path FROM documents ORDER BY id DESC LIMIT 5'))
        for row in r:
            print(row[0])

asyncio.run(get_path())
